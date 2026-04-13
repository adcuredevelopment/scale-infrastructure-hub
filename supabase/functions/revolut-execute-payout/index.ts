import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const REVOLUT_CLIENT_ID = 'mFSdR4-p8_f-lpKeT9ZF55RiSEXFwG2JUTD7WyLVTME'
const REVOLUT_BASE_URL = 'https://b2b.revolut.com/api/1.0'

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

    const { payoutId } = await req.json()
    if (!payoutId) {
      return new Response(JSON.stringify({ error: 'payoutId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get the payout
    const { data: payout, error: payoutError } = await supabaseAdmin
      .from('affiliate_payouts')
      .select('*')
      .eq('id', payoutId)
      .single()

    if (payoutError || !payout) {
      return new Response(JSON.stringify({ error: 'Payout not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (payout.status !== 'pending' && payout.status !== 'processing') {
      return new Response(JSON.stringify({ error: `Payout is already ${payout.status}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get the affiliate
    const { data: affiliate, error: affError } = await supabaseAdmin
      .from('affiliates')
      .select('*')
      .eq('id', payout.affiliate_id)
      .single()

    if (affError || !affiliate) {
      return new Response(JSON.stringify({ error: 'Affiliate not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!affiliate.iban) {
      return new Response(JSON.stringify({ error: 'Affiliate has no IBAN configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Mark as processing
    await supabaseAdmin
      .from('affiliate_payouts')
      .update({ status: 'processing' })
      .eq('id', payoutId)

    // Get Revolut access token
    const accessToken = await getRevolutAccessToken()

    // Create or find counterparty
    const counterpartyId = await getOrCreateCounterparty(accessToken, affiliate)

    // Execute payment
    const requestId = crypto.randomUUID()
    const payResponse = await fetch(`${REVOLUT_BASE_URL}/pay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request_id: requestId,
        account_id: await getRevolutAccountId(accessToken, payout.currency || 'EUR'),
        receiver: {
          counterparty_id: counterpartyId,
          account_id: null, // Use the default account of counterparty
        },
        amount: Number(payout.amount),
        currency: payout.currency || 'EUR',
        reference: `Affiliate payout ${payout.id.slice(0, 8)}`,
      }),
    })

    if (!payResponse.ok) {
      const errBody = await payResponse.text()
      console.error('Payment failed:', payResponse.status, errBody)

      await supabaseAdmin
        .from('affiliate_payouts')
        .update({ status: 'failed', notes: `Revolut error: ${errBody.slice(0, 200)}` })
        .eq('id', payoutId)

      return new Response(JSON.stringify({ error: `Payment failed: ${errBody}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const payResult = await payResponse.json()
    console.log('Payment created:', payResult.id, payResult.state)

    // Update payout with transaction ID and mark as paid
    await supabaseAdmin
      .from('affiliate_payouts')
      .update({
        status: 'paid',
        payout_date: new Date().toISOString(),
        revolut_transaction_id: payResult.id,
      })
      .eq('id', payoutId)

    // Generate invoice
    try {
      await supabaseAdmin.functions.invoke('generate-self-billing-invoice', {
        body: { payoutId },
        headers: { Authorization: authHeader },
      })
      console.log('Invoice generated for payout:', payoutId)
    } catch (e) {
      console.error('Invoice generation failed (non-blocking):', e)
    }

    // Mark approved referrals as paid
    await supabaseAdmin
      .from('affiliate_referrals')
      .update({ status: 'paid' })
      .eq('affiliate_id', payout.affiliate_id)
      .eq('status', 'approved')

    return new Response(JSON.stringify({
      success: true,
      transactionId: payResult.id,
      state: payResult.state,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Execute payout error:', error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// ── Revolut API helpers ──

async function getRevolutAccessToken(): Promise<string> {
  const refreshToken = Deno.env.get('REVOLUT_BUSINESS_REFRESH_TOKEN')
  const privateKeyPem = Deno.env.get('REVOLUT_BUSINESS_PRIVATE_KEY')

  if (!refreshToken || !privateKeyPem) {
    throw new Error('Revolut Business API credentials not configured')
  }

  const jwt = await generateClientAssertionJWT(privateKeyPem, REVOLUT_CLIENT_ID)

  const response = await fetch(`${REVOLUT_BASE_URL}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: REVOLUT_CLIENT_ID,
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: jwt,
    }),
  })

  if (!response.ok) {
    const errBody = await response.text()
    console.error('Token refresh failed:', response.status, errBody)
    throw new Error(`Failed to get access token: ${errBody}`)
  }

  const tokens = await response.json()
  return tokens.access_token
}

async function getRevolutAccountId(accessToken: string, currency: string): Promise<string> {
  const response = await fetch(`${REVOLUT_BASE_URL}/accounts`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Revolut accounts')
  }

  const accounts = await response.json()
  const account = accounts.find((a: any) => a.currency === currency && a.state === 'active')

  if (!account) {
    throw new Error(`No active ${currency} account found in Revolut`)
  }

  return account.id
}

async function getOrCreateCounterparty(
  accessToken: string,
  affiliate: any
): Promise<string> {
  // Check existing counterparties by IBAN
  const listResponse = await fetch(`${REVOLUT_BASE_URL}/counterparties`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  })

  if (listResponse.ok) {
    const counterparties = await listResponse.json()
    const existing = counterparties.find((cp: any) =>
      cp.accounts?.some((acc: any) => acc.iban === affiliate.iban)
    )
    if (existing) {
      console.log('Using existing counterparty:', existing.id)
      return existing.id
    }
  }

  // Create new counterparty
  const nameParts = (affiliate.display_name || affiliate.email.split('@')[0]).split(' ')
  const firstName = nameParts[0] || 'Affiliate'
  const lastName = nameParts.slice(1).join(' ') || affiliate.affiliate_code

  const createBody: any = {
    ...(affiliate.company_name
      ? {
          company_name: affiliate.company_name,
          profile_type: 'business',
        }
      : {
          individual_name: { first_name: firstName, last_name: lastName },
          profile_type: 'personal',
        }),
    bank_country: extractCountryFromIBAN(affiliate.iban),
    currency: 'EUR',
    iban: affiliate.iban,
  }

  const createResponse = await fetch(`${REVOLUT_BASE_URL}/counterparty`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createBody),
  })

  if (!createResponse.ok) {
    const errBody = await createResponse.text()
    console.error('Create counterparty failed:', createResponse.status, errBody)
    throw new Error(`Failed to create counterparty: ${errBody}`)
  }

  const counterparty = await createResponse.json()
  console.log('Created counterparty:', counterparty.id)
  return counterparty.id
}

function extractCountryFromIBAN(iban: string): string {
  return iban.replace(/\s/g, '').substring(0, 2).toUpperCase()
}

// ── JWT / Crypto helpers (reused from revolut-business-callback) ──

async function generateClientAssertionJWT(privateKeyPem: string, clientId: string): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: 'uwncaohygevjvtgkazvv.supabase.co',
    sub: clientId,
    aud: 'https://revolut.com',
    iat: now,
    exp: now + 2400,
  }

  const encodedHeader = base64urlEncode(JSON.stringify(header))
  const encodedPayload = base64urlEncode(JSON.stringify(payload))
  const signingInput = `${encodedHeader}.${encodedPayload}`

  const key = await importPrivateKey(privateKeyPem)
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    new TextEncoder().encode(signingInput)
  )

  return `${signingInput}.${base64urlEncode(signature)}`
}

function base64urlEncode(input: string | ArrayBuffer): string {
  let bytes: Uint8Array
  if (typeof input === 'string') {
    bytes = new TextEncoder().encode(input)
  } else {
    bytes = new Uint8Array(input)
  }
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/-----BEGIN RSA PRIVATE KEY-----/, '')
    .replace(/-----END RSA PRIVATE KEY-----/, '')
    .replace(/\s/g, '')

  const binaryString = atob(pemContents)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return crypto.subtle.importKey(
    'pkcs8',
    bytes.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )
}
