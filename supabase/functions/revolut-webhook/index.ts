import { corsHeaders } from '@supabase/supabase-js/cors'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    
    console.log('Revolut webhook received:', JSON.stringify(payload))

    const { event, order_id, merchant_order_ext_ref } = payload

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (event === 'ORDER_COMPLETED' || event === 'ORDER_AUTHORISED') {
      // Store the successful payment
      const { error } = await supabase.from('payments').insert({
        revolut_order_id: order_id,
        merchant_ref: merchant_order_ext_ref,
        status: event === 'ORDER_COMPLETED' ? 'completed' : 'authorised',
        payload: payload,
      })

      if (error) {
        console.error('Error storing payment:', error)
      } else {
        console.log(`Payment ${order_id} stored successfully`)
      }
    } else if (event === 'ORDER_PAYMENT_FAILED') {
      const { error } = await supabase.from('payments').insert({
        revolut_order_id: order_id,
        merchant_ref: merchant_order_ext_ref,
        status: 'failed',
        payload: payload,
      })

      if (error) {
        console.error('Error storing failed payment:', error)
      }
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
