import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const webhookSecret = Deno.env.get('REVOLUT_WEBHOOK_SECRET')
    if (webhookSecret) {
      const signature = req.headers.get('Revolut-Signature')
      if (!signature) {
        console.error('Missing Revolut-Signature header')
        return new Response(
          JSON.stringify({ error: 'Missing signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const rawPayload = await req.json()
    console.log('Revolut webhook received, event:', rawPayload.event, 'order:', rawPayload.order_id)

    const { event, order_id, merchant_order_ext_ref } = rawPayload

    if (!event || typeof event !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid payload: missing event' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!order_id || typeof order_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid payload: missing order_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const validEvents = ['ORDER_COMPLETED', 'ORDER_AUTHORISED', 'ORDER_PAYMENT_FAILED', 'ORDER_PAYMENT_DECLINED']
    if (!validEvents.includes(event)) {
      return new Response(
        JSON.stringify({ received: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedPayload = {
      event,
      order_id,
      merchant_order_ext_ref: merchant_order_ext_ref || null,
      state: rawPayload.state || null,
      completed_at: rawPayload.completed_at || null,
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    let status = 'unknown'
    if (event === 'ORDER_COMPLETED') status = 'completed'
    else if (event === 'ORDER_AUTHORISED') status = 'authorised'
    else if (event === 'ORDER_PAYMENT_FAILED' || event === 'ORDER_PAYMENT_DECLINED') status = 'failed'

    // Update payment record
    const { data: existing } = await supabase
      .from('payments')
      .select('id, payload')
      .eq('revolut_order_id', order_id)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('payments')
        .update({ status, payload: sanitizedPayload })
        .eq('revolut_order_id', order_id)
      console.log(`Payment ${order_id} updated to ${status}`)

      // On completed: sync to subscriptions & customers
      if (event === 'ORDER_COMPLETED') {
        const prevPayload = existing.payload as any
        const email = prevPayload?.email
        const planName = prevPayload?.plan
        const amount = Number(prevPayload?.amount || 0)

        if (email && planName) {
          // Upsert customer
          const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id, total_spent, subscription_count')
            .eq('email', email)
            .maybeSingle()

          if (existingCustomer) {
            await supabase.from('customers').update({
              total_spent: Number(existingCustomer.total_spent) + amount,
              subscription_count: (existingCustomer.subscription_count || 0) + 1,
              last_payment_at: new Date().toISOString(),
              plan: planName,
              status: 'active',
            }).eq('id', existingCustomer.id)
          } else {
            await supabase.from('customers').insert({
              email,
              plan: planName,
              total_spent: amount,
              subscription_count: 1,
              first_payment_at: new Date().toISOString(),
              last_payment_at: new Date().toISOString(),
              status: 'active',
            })
          }

          // Create subscription record
          const expiresAt = new Date()
          expiresAt.setMonth(expiresAt.getMonth() + 1)

          await supabase.from('subscriptions').insert({
            customer_email: email,
            plan_name: planName,
            status: 'active',
            amount,
            currency: 'EUR',
            revolut_subscription_id: order_id,
            expires_at: expiresAt.toISOString(),
          })

          // Create notification
          await supabase.from('notifications').insert({
            type: 'payment',
            title: `New payment: ${planName}`,
            message: `${email} subscribed to ${planName} (€${amount})`,
            related_entity_id: order_id,
          })

          console.log(`Synced customer & subscription for ${email}`)
        }
      }

      // On failed: create alert notification
      if (event === 'ORDER_PAYMENT_FAILED' || event === 'ORDER_PAYMENT_DECLINED') {
        const prevPayload = existing.payload as any
        await supabase.from('notifications').insert({
          type: 'warning',
          title: `Payment failed`,
          message: `Payment for ${prevPayload?.plan || 'unknown plan'} by ${prevPayload?.email || 'unknown'} has failed`,
          related_entity_id: order_id,
        })
      }
    } else {
      await supabase.from('payments').insert({
        revolut_order_id: order_id,
        merchant_ref: merchant_order_ext_ref || null,
        status,
        payload: sanitizedPayload,
      })
      console.log(`Payment ${order_id} stored with status ${status}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
