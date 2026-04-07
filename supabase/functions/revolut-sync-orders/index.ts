import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const REVOLUT_API_URL = 'https://merchant.revolut.com/api/orders'
const REVOLUT_SUBSCRIPTIONS_URL = 'https://merchant.revolut.com/api/1.0/subscriptions'

// Signup bonus amounts by plan price (duplicated from revolut-webhook)
const SIGNUP_BONUSES: Record<number, number> = {
  79: 20,
  119: 30,
  149: 50,
}

function getSignupBonus(amount: number): number {
  return SIGNUP_BONUSES[amount] || 0
}

async function handleAffiliateCommission(
  supabase: any,
  paymentId: string,
  email: string,
  planName: string,
  amount: number,
  affiliateCode: string | null,
  orderCreatedAt: string | null
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
      const { data: existingRef } = await supabase
        .from('affiliate_referrals')
        .select('id')
        .eq('payment_id', paymentId)
        .maybeSingle()

      if (existingRef) {
        console.log(`Commission already exists for payment ${paymentId}, skipping`)
        return
      }

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

  if (sub?.affiliate_code && orderCreatedAt) {
    const orderDate = new Date(orderCreatedAt)
    const subStartDate = new Date(sub.started_at)
    if (orderDate < subStartDate) {
      console.log(`Skipping recurring commission: order ${orderCreatedAt} is before subscription ${sub.started_at}`)
      return
    }
  }

  if (sub?.affiliate_code) {
    const { data: aff } = await supabase
      .from('affiliates')
      .select('id')
      .eq('affiliate_code', sub.affiliate_code)
      .eq('status', 'active')
      .maybeSingle()

    if (aff) {
      const { data: existingRef } = await supabase
        .from('affiliate_referrals')
        .select('id')
        .eq('payment_id', paymentId)
        .maybeSingle()

      if (!existingRef) {
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
}

/**
 * Fetch the actual subscription status from Revolut for known subscription IDs.
 * Returns a map of subscriptionId -> state (e.g. 'ACTIVE', 'CANCELLED', 'INACTIVE').
 */
async function fetchRevolutSubscriptionStates(
  subscriptionIds: string[],
  apiKey: string
): Promise<Record<string, string>> {
  const stateMap: Record<string, string> = {}
  
  for (const subId of subscriptionIds) {
    try {
      const res = await fetch(`${REVOLUT_SUBSCRIPTIONS_URL}/${subId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Revolut-Api-Version': '2024-09-01',
        },
      })
      if (res.ok) {
        const data = await res.json()
        stateMap[subId] = (data.state || 'UNKNOWN').toUpperCase()
        console.log(`Revolut subscription ${subId} state: ${stateMap[subId]}`)
      } else {
        console.log(`Could not fetch subscription ${subId}: ${res.status}`)
      }
    } catch (e) {
      console.error(`Error fetching subscription ${subId}:`, e)
    }
  }
  
  return stateMap
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const isCronCall = req.headers.get('x-cron') === 'true' || !authHeader?.includes('.')

    if (!isCronCall) {
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
      )

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )
      const { data: roleData } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle()

      if (!roleData) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    const REVOLUT_API_KEY = Deno.env.get('REVOLUT_API_SECRET_KEY')
    if (!REVOLUT_API_KEY) {
      return new Response(JSON.stringify({ error: 'Revolut API not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - 90)

    // Paginate through all Revolut orders
    const orders: any[] = []
    let cursor = fromDate.toISOString()
    let hasMore = true

    while (hasMore) {
      const revolutRes = await fetch(
        `${REVOLUT_API_URL}?from_created_date=${cursor}&limit=500`,
        {
          headers: {
            'Authorization': `Bearer ${REVOLUT_API_KEY}`,
            'Content-Type': 'application/json',
            'Revolut-Api-Version': '2024-09-01',
          },
        }
      )

      if (!revolutRes.ok) {
        const errText = await revolutRes.text()
        console.error('Revolut API error:', errText)
        return new Response(JSON.stringify({ error: 'Failed to fetch from Revolut' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const rawData = await revolutRes.json()
      const batch = Array.isArray(rawData) ? rawData : (rawData?.orders || rawData?.items || [rawData]).filter(Boolean)

      console.log(`Fetched batch of ${batch.length} orders (cursor: ${cursor})`)
      orders.push(...batch)

      if (batch.length < 500) {
        hasMore = false
      } else {
        const lastOrder = batch[batch.length - 1]
        const lastCreatedAt = lastOrder.created_at
        if (!lastCreatedAt || lastCreatedAt === cursor) {
          hasMore = false
        } else {
          cursor = lastCreatedAt
        }
      }
    }

    console.log(`Total orders fetched: ${orders.length}`)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Step 1: Collect all known subscription IDs from DB to check their real status in Revolut
    const { data: allDbSubs } = await supabaseAdmin
      .from('subscriptions')
      .select('revolut_subscription_id, status')
      .not('revolut_subscription_id', 'is', null)

    const knownSubIds = new Set<string>()
    for (const s of allDbSubs || []) {
      if (s.revolut_subscription_id) knownSubIds.add(s.revolut_subscription_id)
    }

    // Also collect subscription IDs from payment payloads
    const { data: paymentsWithSubId } = await supabaseAdmin
      .from('payments')
      .select('payload')
      .not('payload', 'is', null)

    for (const p of paymentsWithSubId || []) {
      const subId = (p.payload as any)?.subscriptionId
      if (subId) knownSubIds.add(subId)
    }

    // Fetch actual states from Revolut for all known subscription IDs
    const revolutSubStates = await fetchRevolutSubscriptionStates(
      Array.from(knownSubIds),
      REVOLUT_API_KEY
    )

    // Build a set of cancelled subscription IDs according to Revolut
    const cancelledSubIds = new Set<string>()
    for (const [subId, state] of Object.entries(revolutSubStates)) {
      if (state === 'CANCELLED' || state === 'INACTIVE') {
        cancelledSubIds.add(subId)
      }
    }

    // Update any DB subscriptions that Revolut says are cancelled but DB says active
    for (const sub of allDbSubs || []) {
      if (sub.status === 'active' && sub.revolut_subscription_id && cancelledSubIds.has(sub.revolut_subscription_id)) {
        console.log(`Marking subscription ${sub.revolut_subscription_id} as cancelled (Revolut says so)`)
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
          .eq('revolut_subscription_id', sub.revolut_subscription_id)
          .eq('status', 'active')
      }
    }

    let synced = 0
    let updated = 0

    // Build a set of cancelled customer emails from DB (for order-based subscription guard)
    const { data: cancelledSubs } = await supabaseAdmin
      .from('subscriptions')
      .select('customer_email, revolut_subscription_id, amount')
      .eq('status', 'cancelled')

    // Map order IDs that belong to cancelled subscriptions
    // We need to know which order IDs should NOT create new active subscriptions
    const cancelledOrderIds = new Set<string>()
    for (const cs of cancelledSubs || []) {
      if (cs.revolut_subscription_id) cancelledOrderIds.add(cs.revolut_subscription_id)
    }

    for (const order of orders) {
      const orderId = order.id
      const email = order.email || order.customer?.email || null
      const amount = order.order_amount?.value
        ? (order.order_amount.value / 100)
        : (order.amount ? order.amount / 100 : 0)
      const currency = order.order_amount?.currency || order.currency || 'EUR'
      const state = (order.state || 'unknown').toUpperCase()
      const createdAt = order.created_at || new Date().toISOString()
      const description = order.description || ''

      let planName = 'Unknown'
      const descLower = description.toLowerCase()
      const refLower = (order.merchant_order_ext_ref || '').toLowerCase()
      if (descLower.includes('starter') || refLower.includes('starter')) planName = 'Starter Advertiser'
      else if (descLower.includes('growth') || refLower.includes('growth')) planName = 'Growth Advertiser'
      else if (descLower.includes('advanced') || refLower.includes('advanced')) planName = 'Advanced Advertiser'

      let dbStatus = 'pending'
      if (state === 'COMPLETED') dbStatus = 'completed'
      else if (state === 'FAILED' || state === 'CANCELLED') dbStatus = 'failed'
      else if (state === 'AUTHORISED') dbStatus = 'authorised'

      // Read existing payment FIRST to preserve email and affiliateCode
      const { data: existingPayment } = await supabaseAdmin
        .from('payments')
        .select('id, payload')
        .eq('revolut_order_id', orderId)
        .maybeSingle()

      const existingEmailFromPayload = (existingPayment?.payload as any)?.email || null
      const finalEmail = email || existingEmailFromPayload

      // Preserve affiliateCode and subscriptionId from existing payload
      const existingAffiliateCode = (existingPayment?.payload as any)?.affiliateCode || null
      const existingSubscriptionId = (existingPayment?.payload as any)?.subscriptionId || null

      if (existingPayment) {
        await supabaseAdmin.from('payments').update({
          status: dbStatus,
          payload: {
            plan: planName,
            amount,
            currency,
            email: finalEmail,
            revolut_state: state,
            synced_at: new Date().toISOString(),
            ...(existingAffiliateCode ? { affiliateCode: existingAffiliateCode } : {}),
            ...(existingSubscriptionId ? { subscriptionId: existingSubscriptionId } : {}),
          },
        }).eq('revolut_order_id', orderId)
        updated++
      } else {
        await supabaseAdmin.from('payments').insert({
          revolut_order_id: orderId,
          merchant_ref: order.merchant_order_ext_ref || null,
          status: dbStatus,
          payload: {
            plan: planName,
            amount,
            currency,
            email: finalEmail,
            revolut_state: state,
            synced_at: new Date().toISOString(),
          },
          created_at: createdAt,
        })
        synced++
      }

      // Sync completed orders to customers & subscriptions + affiliate commissions
      if (dbStatus === 'completed' && finalEmail) {
        // Resolve the true subscription ID: payload > order itself > fallback to orderId
        const trueSubscriptionId = existingSubscriptionId || orderId

        // *** KEY FIX: Check if this subscription ID or order belongs to a cancelled subscription ***
        // Check 1: Is the resolved subscription ID cancelled?
        if (cancelledSubIds.has(trueSubscriptionId) || cancelledOrderIds.has(trueSubscriptionId)) {
          console.log(`Skipping subscription creation for order ${orderId}: subscription ${trueSubscriptionId} is cancelled`)
          // Still update customer spending but don't create/reactivate subscription
          const { data: existingCustomer } = await supabaseAdmin
            .from('customers')
            .select('id')
            .eq('email', finalEmail)
            .maybeSingle()

          if (!existingCustomer) {
            await supabaseAdmin.from('customers').insert({
              email: finalEmail,
              name: order.customer?.full_name || order.customer?.name || null,
              plan: planName,
              total_spent: amount,
              subscription_count: 0,
              first_payment_at: createdAt,
              last_payment_at: createdAt,
              status: 'cancelled',
            })
          }
          continue
        }

        // Check 2: Does this customer already have a cancelled subscription with same amount?
        // This catches cases where the order ID differs from the subscription ID
        const { data: cancelledForCustomer } = await supabaseAdmin
          .from('subscriptions')
          .select('id, revolut_subscription_id')
          .eq('customer_email', finalEmail)
          .eq('status', 'cancelled')
          .eq('amount', amount)

        // If there's a cancelled sub and NO active sub with this order/sub ID, skip
        if (cancelledForCustomer && cancelledForCustomer.length > 0) {
          const { data: activeSub } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('revolut_subscription_id', trueSubscriptionId)
            .eq('status', 'active')
            .maybeSingle()

          if (!activeSub) {
            // Check if the order was created BEFORE the cancellation — if so, it's a historical order
            const { data: existingSubById } = await supabaseAdmin
              .from('subscriptions')
              .select('id')
              .eq('revolut_subscription_id', trueSubscriptionId)
              .maybeSingle()

            if (!existingSubById) {
              console.log(`Skipping subscription creation for ${finalEmail}: cancelled sub exists with same amount €${amount}`)
              continue
            }
          }
        }

        // Update/create customer
        const { data: existingCustomer } = await supabaseAdmin
          .from('customers')
          .select('id, total_spent, subscription_count')
          .eq('email', finalEmail)
          .maybeSingle()

        if (existingCustomer) {
          const { data: existingSub } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('revolut_subscription_id', trueSubscriptionId)
            .maybeSingle()

          if (!existingSub) {
            await supabaseAdmin.from('customers').update({
              total_spent: Number(existingCustomer.total_spent) + amount,
              subscription_count: (existingCustomer.subscription_count || 0) + 1,
              last_payment_at: createdAt,
              plan: planName,
              status: 'active',
            }).eq('id', existingCustomer.id)
          }
        } else {
          await supabaseAdmin.from('customers').insert({
            email: finalEmail,
            name: order.customer?.full_name || order.customer?.name || null,
            plan: planName,
            total_spent: amount,
            subscription_count: 1,
            first_payment_at: createdAt,
            last_payment_at: createdAt,
            status: 'active',
          })
        }

        // Upsert subscription — use true subscription ID
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('id, status')
          .eq('revolut_subscription_id', trueSubscriptionId)
          .maybeSingle()

        if (!existingSub) {
          const expiresAt = new Date(createdAt)
          expiresAt.setMonth(expiresAt.getMonth() + 1)

          await supabaseAdmin.from('subscriptions').insert({
            customer_email: finalEmail,
            customer_name: order.customer?.full_name || order.customer?.name || null,
            plan_name: planName,
            status: 'active',
            amount,
            currency,
            revolut_subscription_id: trueSubscriptionId,
            started_at: createdAt,
            expires_at: expiresAt.toISOString(),
            ...(existingAffiliateCode ? { affiliate_code: existingAffiliateCode } : {}),
          })
        } else if (existingSub.status === 'cancelled') {
          // *** Never reactivate a cancelled subscription from a historical order ***
          console.log(`Subscription ${trueSubscriptionId} is cancelled, not reactivating from order ${orderId}`)
        }

        // Handle affiliate commissions
        const paymentId = existingPayment?.id || null
        if (paymentId) {
          await handleAffiliateCommission(
            supabaseAdmin,
            paymentId,
            finalEmail,
            planName,
            amount,
            existingAffiliateCode,
            createdAt
          )
        }
      }
    }

    // Update revenue milestones
    const { data: allSubs } = await supabaseAdmin.from('subscriptions').select('amount').eq('status', 'active')
    const totalRevenue = (allSubs || []).reduce((sum, s) => sum + Number(s.amount || 0), 0)

    const { data: milestones } = await supabaseAdmin
      .from('revenue_milestones')
      .select('*')
      .eq('achieved', false)

    for (const m of milestones || []) {
      await supabaseAdmin.from('revenue_milestones').update({
        current_amount: totalRevenue,
        achieved: totalRevenue >= Number(m.target_amount),
        achieved_at: totalRevenue >= Number(m.target_amount) ? new Date().toISOString() : null,
      }).eq('id', m.id)
    }

    await supabaseAdmin.from('revenue_milestones').update({
      current_amount: totalRevenue,
    }).eq('achieved', true)

    // Recompute customer subscription counts based on actual active subscriptions
    const { data: allCustomers } = await supabaseAdmin.from('customers').select('id, email')
    for (const c of allCustomers || []) {
      const { data: activeSubs } = await supabaseAdmin
        .from('subscriptions')
        .select('id')
        .eq('customer_email', c.email)
        .eq('status', 'active')

      const activeCount = activeSubs?.length || 0
      await supabaseAdmin.from('customers').update({
        subscription_count: activeCount,
        status: activeCount > 0 ? 'active' : 'cancelled',
      }).eq('id', c.id)
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_orders: orders.length,
        new_synced: synced,
        updated,
        total_revenue: totalRevenue,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Sync error:', error)
    return new Response(
      JSON.stringify({ error: 'Sync failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
