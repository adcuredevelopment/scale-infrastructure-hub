import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { template as cancelledTemplate } from '../_shared/transactional-email-templates/subscription-cancelled.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const REVOLUT_API_URL = 'https://merchant.revolut.com/api'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const revolutApiKey = Deno.env.get('REVOLUT_API_SECRET_KEY')

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

    // Cancel the subscription in Revolut FIRST — only proceed locally if Revolut confirms
    if (!subscription.revolut_subscription_id) {
      return new Response(JSON.stringify({ error: 'No Revolut subscription ID linked — cannot cancel' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!revolutApiKey) {
      return new Response(JSON.stringify({ error: 'Revolut API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const revolutRes = await fetch(
      `${REVOLUT_API_URL}/subscriptions/${subscription.revolut_subscription_id}/cancel`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${revolutApiKey}`,
          'Content-Type': 'application/json',
          'Revolut-Api-Version': '2024-09-01',
        },
      }
    )
    const revolutBody = await revolutRes.text()

    if (!revolutRes.ok) {
      console.error('Revolut cancel failed:', revolutRes.status, revolutBody)
      return new Response(JSON.stringify({
        error: `Failed to cancel in Revolut (${revolutRes.status}): ${revolutBody}`,
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Revolut subscription cancelled:', subscription.revolut_subscription_id)

    const now = new Date().toISOString()

    // Cancel the subscription in DB
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

    // Send cancellation email by enqueuing directly (avoids JWT issues with cross-function calls)
    try {
      const templateData = {
        planName: subscription.plan_name,
        amount: subscription.amount,
        currency: subscription.currency,
        customerName: subscription.customer_name,
      }

      const html = await renderAsync(
        React.createElement(cancelledTemplate.component, templateData)
      )
      const plainText = await renderAsync(
        React.createElement(cancelledTemplate.component, templateData),
        { plainText: true }
      )

      const resolvedSubject = typeof cancelledTemplate.subject === 'function'
        ? cancelledTemplate.subject(templateData)
        : cancelledTemplate.subject

      const messageId = crypto.randomUUID()
      const normalizedEmail = subscription.customer_email.toLowerCase()

      // Get or create unsubscribe token
      let unsubscribeToken: string
      const { data: existingToken } = await supabaseAdmin
        .from('email_unsubscribe_tokens')
        .select('token, used_at')
        .eq('email', normalizedEmail)
        .maybeSingle()

      if (existingToken && !existingToken.used_at) {
        unsubscribeToken = existingToken.token
      } else if (!existingToken) {
        const bytes = new Uint8Array(32)
        crypto.getRandomValues(bytes)
        unsubscribeToken = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
        await supabaseAdmin
          .from('email_unsubscribe_tokens')
          .upsert({ token: unsubscribeToken, email: normalizedEmail }, { onConflict: 'email', ignoreDuplicates: true })
        const { data: storedToken } = await supabaseAdmin
          .from('email_unsubscribe_tokens')
          .select('token')
          .eq('email', normalizedEmail)
          .maybeSingle()
        unsubscribeToken = storedToken?.token || unsubscribeToken
      } else {
        // Token used = suppressed, skip sending
        console.log('Email suppressed for:', normalizedEmail)
        unsubscribeToken = ''
      }

      if (unsubscribeToken) {
        await supabaseAdmin.from('email_send_log').insert({
          message_id: messageId,
          template_name: 'subscription-cancelled',
          recipient_email: subscription.customer_email,
          status: 'pending',
        })

        const { error: enqueueError } = await supabaseAdmin.rpc('enqueue_email', {
          queue_name: 'transactional_emails',
          payload: {
            message_id: messageId,
            to: subscription.customer_email,
            from: 'scale-infrastructure-hub <noreply@adcure.agency>',
            sender_domain: 'notify.adcure.agency',
            subject: resolvedSubject,
            html,
            text: plainText,
            purpose: 'transactional',
            label: 'subscription-cancelled',
            idempotency_key: `sub-cancel-${subscriptionId}`,
            unsubscribe_token: unsubscribeToken,
            queued_at: new Date().toISOString(),
          },
        })

        if (enqueueError) {
          console.error('Failed to enqueue cancellation email:', enqueueError)
        } else {
          console.log('Cancellation email enqueued for:', subscription.customer_email)
        }
      }
    } catch (e) {
      console.error('Email sending failed:', e)
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
