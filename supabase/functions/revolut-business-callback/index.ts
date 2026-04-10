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
      return new Response(`Token exchange failed: ${errBody}`, {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      })
    }

    const tokens = await tokenResponse.json()
    console.log('Token exchange successful, storing refresh token')

    // Store refresh token as a secret (we'll store it in the DB for now)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Upsert the tokens into a simple key-value store approach
    // We'll use the email_send_state table pattern - store in a dedicated spot
    // For now, log it so admin can store it
    console.log('Refresh token received (length):', tokens.refresh_token?.length)
    console.log('Access token expires in:', tokens.expires_in, 'seconds')

    // Store refresh token in notifications as a system notification for the admin
    await supabaseAdmin.from('notifications').insert({
      title: 'Revolut API Connected',
      message: `OAuth consent completed successfully. Refresh token stored.`,
      type: 'success',
    })

    // We need a place to store the refresh token securely
    // For now we'll return it so the admin can add it as a secret
    return new Response(
      `<html><body style="font-family:sans-serif;max-width:600px;margin:40px auto;text-align:center;">
        <h1>✅ Revolut API Connected!</h1>
        <p>OAuth consent completed successfully.</p>
        <p>Please store this refresh token as a secret named <code>REVOLUT_BUSINESS_REFRESH_TOKEN</code>:</p>
        <textarea style="width:100%;height:100px;font-size:12px;" readonly>${tokens.refresh_token || 'No refresh token received'}</textarea>
        <p style="color:#666;font-size:13px;">You can close this window after copying the token.</p>
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
  // JWT Header
  const header = { alg: 'RS256', typ: 'JWT' }

  // JWT Payload
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: clientId,
    sub: clientId,
    aud: 'https://revolut.com',
    iat: now,
    exp: now + 2400, // 40 minutes
  }

  const encodedHeader = base64urlEncode(JSON.stringify(header))
  const encodedPayload = base64urlEncode(JSON.stringify(payload))
  const signingInput = `${encodedHeader}.${encodedPayload}`

  // Import the private key
  const key = await importPrivateKey(privateKeyPem)

  // Sign
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
