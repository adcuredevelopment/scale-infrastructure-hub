import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Signup bonus amounts by plan price
const SIGNUP_BONUSES: Record<number, number> = {
  79: 20,
  119: 30,
  149: 50,
}

function getSignupBonus(amount: number): number {
  return SIGNUP_BONUSES[amount] || 0
}

async function verifyRevolutSignature(
  payload: string,
  signatureHeader: string,
  secret: string
): Promise<boolean> {
  try {
    const parts = signatureHeader.split(',')
    const v1Sig = parts.find((p) => p.trim().startsWith('v1='))
    if (!v1Sig) return false

    const receivedHex = v1Sig.trim().substring(3)

    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
    const expectedHex = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    if (receivedHex.length !== expectedHex.length) return false
    let mismatch = 0
    for (let i = 0; i < receivedHex.length; i++) {
      mismatch |= receivedHex.charCodeAt(i) ^ expectedHex.charCodeAt(i)
    }
    return mismatch === 0
  } catch {
    return false
  }
}

async function handleAffiliateCommission(
  supabase: any,
  paymentId: string,
  email: string,
  planName: string,
  amount: number,
  affiliateCode: string | null
) {
  // Case 1: First-time referral via affiliate link → signup bonus ONLY (no 20% on first month)
  if (affiliateCode && typeof affiliateCode === 'string') {
    const { data: aff } = await supabase
      .from('affiliates')
      .select('id')
      .eq('affiliate_code', affiliateCode)
      .eq('status', 'active')
      .maybeSingle()

    if (aff) {
      const bonusAmount = getSignupBonus(amount)

      // Only create signup bonus on first payment — no recurring commission
      if (bonusAmount > 0) {
        await supabase.from('affiliate_referrals').insert({
          affiliate_id: aff.id,
          payment_id: paymentId,
          customer_email: email,
          plan_name: planName,
          payment_amount: amount,
          commission_rate: 0,
          commission_amount: bonusAmount,
          status: 'approved',
          referral_type: 'signup_bonus',
        })
        console.log(`Signup bonus €${bonusAmount} created for affiliate ${affiliateCode} (first month, no recurring)`)
      }

      // Store affiliate_code on the subscription for future recurring attribution
      await supabase
        .from('subscriptions')
        .update({ affiliate_code: affiliateCode })
        .eq('customer_email', email)
        .eq('status', 'active')

      console.log(`Affiliate first-month referral for code ${affiliateCode}, bonus only`)
    }
    return
  }

  // Case 2: Recurring payment (2nd month+) → 20% commission ONLY (no bonus)
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('affiliate_code, started_at')
    .eq('customer_email', email)
    .eq('status', 'active')
    .not('affiliate_code', 'is', null)
    .maybeSingle()

  if (sub?.affiliate_code) {
    const { data: aff } = await supabase
      .from('affiliates')
      .select('id')
      .eq('affiliate_code', sub.affiliate_code)
      .eq('status', 'active')
      .maybeSingle()

    if (aff) {
      const commissionRate = 0.20
      const commissionAmount = amount * commissionRate

      await supabase.from('affiliate_referrals').insert({
        affiliate_id: aff.id,
        payment_id: paymentId,
        customer_email: email,
        plan_name: planName,
        payment_amount: amount,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        status: 'approved',
        referral_type: 'recurring',
      })
      console.log(`Recurring commission €${commissionAmount} for affiliate ${sub.affiliate_code} (month 2+)`)
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const rawBody = await req.text()
    const webhookSecret = Deno.env.get('REVOLUT_WEBHOOK_SECRET')

    if (webhookSecret) {
      const signature = req.headers.get('Revolut-Signature')
      if (!signature) {
        console.error('Missing Revolut-Signature header')
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const valid = await verifyRevolutSignature(rawBody, signature, webhookSecret)
      if (!valid) {
        console.error('Invalid webhook signature')
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      console.warn('REVOLUT_WEBHOOK_SECRET not set — skipping signature verification')
    }

    const rawPayload = JSON.parse(rawBody)
    console.log('Revolut webhook received, event:', rawPayload.event, 'order:', rawPayload.order_id)

    const { event, order_id, merchant_order_ext_ref } = rawPayload

    if (!event || typeof event !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!order_id || typeof order_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const validEvents = ['ORDER_COMPLETED', 'ORDER_AUTHORISED', 'ORDER_PAYMENT_FAILED', 'ORDER_PAYMENT_DECLINED', 'SUBSCRIPTION_ACTIVATED', 'SUBSCRIPTION_CANCELLED', 'SUBSCRIPTION_RENEWED']
    if (!validEvents.includes(event)) {
      return new Response(
        JSON.stringify({ received: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // FIX: Create supabase client BEFORE any database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Handle subscription-specific events
    if (event === 'SUBSCRIPTION_ACTIVATED' || event === 'SUBSCRIPTION_CANCELLED' || event === 'SUBSCRIPTION_RENEWED') {
      const subscriptionId = rawPayload.subscription_id || rawPayload.id
      console.log(`Subscription event: ${event}, subscription: ${subscriptionId}`)

      if (subscriptionId) {
        if (event === 'SUBSCRIPTION_CANCELLED') {
          await supabase
            .from('subscriptions')
            .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
            .eq('revolut_subscription_id', subscriptionId)
          console.log(`Subscription ${subscriptionId} cancelled via webhook`)
        }
      }

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

    let status = 'unknown'
    if (event === 'ORDER_COMPLETED') status = 'completed'
    else if (event === 'ORDER_AUTHORISED') status = 'authorised'
    else if (event === 'ORDER_PAYMENT_FAILED' || event === 'ORDER_PAYMENT_DECLINED') status = 'failed'

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

      if (event === 'ORDER_COMPLETED') {
        const prevPayload = existing.payload as any
        const email = prevPayload?.email
        const planName = prevPayload?.plan
        const amount = Number(prevPayload?.amount || 0)

        if (email && planName) {
          const customerName = prevPayload?.firstName && prevPayload?.lastName
            ? `${prevPayload.firstName} ${prevPayload.lastName}`
            : null

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
              ...(customerName ? { name: customerName } : {}),
            }).eq('id', existingCustomer.id)
          } else {
            await supabase.from('customers').insert({
              email,
              name: customerName,
              plan: planName,
              total_spent: amount,
              subscription_count: 1,
              first_payment_at: new Date().toISOString(),
              last_payment_at: new Date().toISOString(),
              status: 'active',
            })
          }

          const expiresAt = new Date()
          expiresAt.setMonth(expiresAt.getMonth() + 1)

          const revolutSubId = prevPayload?.subscriptionId || order_id

          // FIX: Use upsert to prevent duplicate subscriptions from repeated webhooks
          const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('revolut_subscription_id', revolutSubId)
            .maybeSingle()

          if (existingSub) {
            // Update existing subscription instead of creating duplicate
            await supabase.from('subscriptions').update({
              customer_email: email,
              customer_name: customerName,
              plan_name: planName,
              status: 'active',
              amount,
              expires_at: expiresAt.toISOString(),
              affiliate_code: prevPayload?.affiliateCode || null,
            }).eq('id', existingSub.id)
            console.log(`Subscription ${revolutSubId} updated (duplicate webhook)`)
          } else {
            await supabase.from('subscriptions').insert({
              customer_email: email,
              customer_name: customerName,
              plan_name: planName,
              status: 'active',
              amount,
              currency: 'EUR',
              revolut_subscription_id: revolutSubId,
              expires_at: expiresAt.toISOString(),
              affiliate_code: prevPayload?.affiliateCode || null,
            })
          }

          await supabase.from('notifications').insert({
            type: 'payment',
            title: `New payment: ${planName}`,
            message: `${email} subscribed to ${planName} (€${amount})`,
            related_entity_id: order_id,
          })

          console.log(`Synced customer & subscription for ${email}`)

          // Send subscription confirmed email
          try {
            await supabase.functions.invoke('send-transactional-email', {
              body: {
                templateName: 'subscription-confirmed',
                recipientEmail: email,
                idempotencyKey: `sub-confirmed-${existing.id}`,
                templateData: {
                  customerName,
                  planName,
                  amount,
                  currency: 'EUR',
                },
              },
            })
            console.log(`Subscription confirmation email queued for ${email}`)
          } catch (emailErr) {
            console.error('Failed to send subscription confirmation email', emailErr)
          }

          // Affiliate commission handling (auto-approved)
          const affiliateCode = prevPayload?.affiliateCode
          await handleAffiliateCommission(supabase, existing.id, email, planName, amount, affiliateCode || null)
        }
      }

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
      JSON.stringify({ error: 'Processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
