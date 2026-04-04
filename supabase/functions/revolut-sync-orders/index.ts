import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const REVOLUT_API_URL = 'https://merchant.revolut.com/api/orders'

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
  // Case 1: First-time referral via affiliate link
  if (affiliateCode && typeof affiliateCode === 'string') {
    const { data: aff } = await supabase
      .from('affiliates')
      .select('id')
      .eq('affiliate_code', affiliateCode)
      .eq('status', 'active')
      .maybeSingle()

    if (aff) {
      // Check if commission already exists for this payment
      const { data: existingRef } = await supabase
        .from('affiliate_referrals')
        .select('id')
        .eq('payment_id', paymentId)
        .maybeSingle()

      if (existingRef) {
        console.log(`Commission already exists for payment ${paymentId}, skipping`)
        return
      }

      const commissionRate = 0.20
      const commissionAmount = amount * commissionRate
      const bonusAmount = getSignupBonus(amount)

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
        console.log(`Signup bonus €${bonusAmount} created for affiliate ${affiliateCode}`)
      }

      await supabase
        .from('subscriptions')
        .update({ affiliate_code: affiliateCode })
        .eq('customer_email', email)
        .eq('status', 'active')

      console.log(`Affiliate referral created for code ${affiliateCode}, commission €${commissionAmount}`)
    }
    return
  }

  // Case 2: Recurring payment — check if customer has active subscription with affiliate_code
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('affiliate_code, started_at')
    .eq('customer_email', email)
    .eq('status', 'active')
    .not('affiliate_code', 'is', null)
    .maybeSingle()

  // Date guard: only attribute if order was created after the affiliate was linked
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
      // Check if commission already exists for this payment
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
        console.log(`Recurring commission €${commissionAmount} for affiliate ${sub.affiliate_code}`)
      }
    }
  }
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
        // Use last order's created_at as cursor for next page
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

    let synced = 0
    let updated = 0

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

      // Preserve affiliateCode from existing payload
      const existingAffiliateCode = (existingPayment?.payload as any)?.affiliateCode || null

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
            // Preserve affiliateCode
            ...(existingAffiliateCode ? { affiliateCode: existingAffiliateCode } : {}),
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
        const { data: existingCustomer } = await supabaseAdmin
          .from('customers')
          .select('id, total_spent, subscription_count')
          .eq('email', finalEmail)
          .maybeSingle()

        if (existingCustomer) {
          const { data: existingSub } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('revolut_subscription_id', orderId)
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

        // Upsert subscription
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('id')
          .eq('revolut_subscription_id', orderId)
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
            revolut_subscription_id: orderId,
            started_at: createdAt,
            expires_at: expiresAt.toISOString(),
            ...(existingAffiliateCode ? { affiliate_code: existingAffiliateCode } : {}),
          })
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
    const { data: allSubs } = await supabaseAdmin.from('subscriptions').select('amount')
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
