import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Validate admin auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check admin role
    const { data: isAdmin } = await supabaseAdmin.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin',
    })

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { subscriptionId } = await req.json()
    if (!subscriptionId) {
      return new Response(JSON.stringify({ error: 'subscriptionId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get the subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single()

    if (subError || !subscription) {
      return new Response(JSON.stringify({ error: 'Subscription not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (subscription.status === 'cancelled') {
      return new Response(JSON.stringify({ error: 'Subscription is already cancelled' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const now = new Date().toISOString()

    // Cancel the subscription
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'cancelled', cancelled_at: now, updated_at: now })
      .eq('id', subscriptionId)

    if (updateError) {
      throw updateError
    }

    // Update customer record
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('email', subscription.customer_email)
      .single()

    if (customer) {
      const newSubCount = Math.max(0, (customer.subscription_count || 0) - 1)
      const updateData: Record<string, any> = {
        subscription_count: newSubCount,
        updated_at: now,
      }

      // If no more active subs, check and update status
      if (newSubCount === 0) {
        const { data: activeSubs } = await supabaseAdmin
          .from('subscriptions')
          .select('id')
          .eq('customer_email', subscription.customer_email)
          .eq('status', 'active')

        if (!activeSubs || activeSubs.length === 0) {
          updateData.status = 'inactive'
        }
      }

      await supabaseAdmin
        .from('customers')
        .update(updateData)
        .eq('id', customer.id)
    }

    // Try to send cancellation email (will work once email infra is set up)
    try {
      await supabaseAdmin.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'subscription-cancelled',
          recipientEmail: subscription.customer_email,
          idempotencyKey: `sub-cancel-${subscriptionId}`,
          templateData: {
            planName: subscription.plan_name,
            amount: subscription.amount,
            currency: subscription.currency,
            customerName: subscription.customer_name,
          },
        },
      })
    } catch {
      // Email infra not set up yet — cancellation still succeeds
      console.log('Email sending skipped (infra not configured yet)')
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
