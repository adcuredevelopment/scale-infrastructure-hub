import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EXPIRY_MINUTES = 10

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const cutoff = new Date(Date.now() - EXPIRY_MINUTES * 60 * 1000).toISOString()

    // Find pending payments older than 10 minutes
    const { data: stalePayments, error: fetchError } = await supabase
      .from('payments')
      .select('id, created_at, payload')
      .eq('status', 'pending')
      .lt('created_at', cutoff)

    if (fetchError) throw fetchError

    if (!stalePayments || stalePayments.length === 0) {
      return new Response(JSON.stringify({ expired: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let expired = 0
    for (const payment of stalePayments) {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'expired' })
        .eq('id', payment.id)
        .eq('status', 'pending') // prevent race condition

      if (!error) expired++
    }

    console.log(`Expired ${expired} stale pending payments (cutoff: ${cutoff})`)

    return new Response(JSON.stringify({ expired, checked: stalePayments.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Expire payments error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
