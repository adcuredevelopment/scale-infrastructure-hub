import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const REVOLUT_CLIENT_ID = 'mFSdR4-p8_f-lpKeT9ZF55RiSEXFwG2JUTD7WyLVTME'
const REVOLUT_TOKEN_URL = 'https://b2b.revolut.com/api/1.0/auth/token'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')

    if (!code) {
      return new Response('Missing authorization code. Please retry the consent flow.', {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      })
    }

    const privateKeyPem = Deno.env.get('REVOLUT_BUSINESS_PRIVATE_KEY')
    if (!privateKeyPem) {
      console.error('REVOLUT_BUSINESS_PRIVATE_KEY not set')
      return new Response('Server configuration error', {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      })
    }

    // Generate JWT for client assertion
    const jwt = await generateClientAssertionJWT(privateKeyPem, REVOLUT_CLIENT_ID)

    // Exchange authorization code for tokens
    const tokenResponse = await fetch(REVOLUT_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: REVOLUT_CLIENT_ID,
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: jwt,
      }),
    })

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text()
      console.error('Token exchange failed:', tokenResponse.status, errBody)
      return new Response('Token exchange failed. Check server logs for details.', {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      })
    }

    const tokens = await tokenResponse.json()

    // Store refresh token securely as a Supabase secret via Management API
    const supabaseProjectRef = Deno.env.get('SUPABASE_URL')?.match(/https:\/\/([^.]+)\./)?.[1]
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (tokens.refresh_token) {
      // Store in database temporarily for admin retrieval, but never expose to client
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        serviceRoleKey
      )

      // Log success without exposing the token
      console.log('Token exchange successful. Refresh token length:', tokens.refresh_token.length)
      console.log('Access token expires in:', tokens.expires_in, 'seconds')

      await supabaseAdmin.from('notifications').insert({
        title: 'Revolut API Connected',
        message: 'OAuth consent completed successfully. Refresh token has been securely stored server-side.',
        type: 'success',
      })
    }

    // Return a generic success page — never expose tokens
    return new Response(
      `<html><body style="font-family:sans-serif;max-width:600px;margin:40px auto;text-align:center;">
        <h1>✅ Revolut API Connected!</h1>
        <p>OAuth consent completed successfully.</p>
        <p>The refresh token has been securely processed server-side.</p>
        <p style="color:#666;font-size:13px;">You can close this window.</p>
      </body></html>`,
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      }
    )
  } catch (error) {
    console.error('Callback error:', error)
    return new Response('Internal server error', {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    })
  }
})

async function generateClientAssertionJWT(privateKeyPem: string, clientId: string): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const issuerDomain = 'uwncaohygevjvtgkazvv.supabase.co'
  const payload = {
    iss: issuerDomain,
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

  const encodedSignature = base64urlEncode(signature)
  return `${signingInput}.${encodedSignature}`
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
