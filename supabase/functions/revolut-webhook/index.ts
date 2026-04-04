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
    // --- Validate webhook signature if secret is configured ---
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
      // Note: For production, implement full HMAC-SHA256 signature verification
      // against the raw request body using the webhookSecret
    }

    const payload = await req.json()
    console.log('Revolut webhook received:', JSON.stringify(payload))

    // --- Validate payload structure ---
    const { event, order_id, merchant_order_ext_ref } = payload

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
      // Acknowledge unknown events without processing
      return new Response(
        JSON.stringify({ received: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use service role for DB writes (webhook has no user context)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    let status = 'unknown'
    if (event === 'ORDER_COMPLETED') status = 'completed'
    else if (event === 'ORDER_AUTHORISED') status = 'authorised'
    else if (event === 'ORDER_PAYMENT_FAILED' || event === 'ORDER_PAYMENT_DECLINED') status = 'failed'

    // Try to update existing payment record first
    const { data: existing } = await supabase
      .from('payments')
      .select('id')
      .eq('revolut_order_id', order_id)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('payments')
        .update({ status, payload })
        .eq('revolut_order_id', order_id)
      if (error) console.error('Error updating payment:', error)
      else console.log(`Payment ${order_id} updated to ${status}`)
    } else {
      const { error } = await supabase.from('payments').insert({
        revolut_order_id: order_id,
        merchant_ref: merchant_order_ext_ref || null,
        status,
        payload,
      })
      if (error) console.error('Error storing payment:', error)
      else console.log(`Payment ${order_id} stored with status ${status}`)
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
