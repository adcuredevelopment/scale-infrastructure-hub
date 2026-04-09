import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { template as payoutInvoiceTemplate } from '../_shared/transactional-email-templates/payout-invoice.tsx'

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

    // Generate sequential invoice number
    const { data: seqData } = await supabaseAdmin.rpc('nextval_affiliate_invoice')
    const seqNum = seqData || Date.now()
    const invoiceNumber = `SBI-${String(seqNum).padStart(6, '0')}`
    const issuedAt = new Date().toISOString()

    // Generate PDF content (simple HTML-to-PDF using a text representation)
    const pdfContent = generateInvoicePDF({
      invoiceNumber,
      issuedAt,
      affiliateName: affiliate.display_name || affiliate.email,
      affiliateEmail: affiliate.email,
      companyName: affiliate.company_name,
      kvkNumber: affiliate.kvk_number,
      vatNumber: affiliate.vat_number,
      iban: affiliate.iban,
      billingAddress: affiliate.billing_address,
      amount: payout.amount,
      currency: payout.currency || 'EUR',
    })

    // Store PDF in storage
    const pdfPath = `${affiliate.id}/${invoiceNumber}.html`
    const { error: uploadError } = await supabaseAdmin.storage
      .from('affiliate-invoices')
      .upload(pdfPath, new Blob([pdfContent], { type: 'text/html' }), {
        contentType: 'text/html',
        upsert: true,
      })

    if (uploadError) {
      console.error('Failed to upload invoice:', uploadError)
    }

    // Store invoice record
    const { error: insertError } = await supabaseAdmin
      .from('affiliate_invoices')
      .insert({
        affiliate_id: affiliate.id,
        payout_id: payoutId,
        invoice_number: invoiceNumber,
        amount: payout.amount,
        currency: payout.currency || 'EUR',
        issued_at: issuedAt,
        pdf_path: pdfPath,
      })

    if (insertError) {
      console.error('Failed to insert invoice record:', insertError)
      return new Response(JSON.stringify({ error: 'Failed to create invoice record' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Send invoice email
    try {
      const templateData = {
        affiliateName: affiliate.display_name || affiliate.email,
        invoiceNumber,
        amount: payout.amount,
        currency: payout.currency || 'EUR',
        issuedAt,
      }

      const html = await renderAsync(
        React.createElement(payoutInvoiceTemplate.component, templateData)
      )
      const plainText = await renderAsync(
        React.createElement(payoutInvoiceTemplate.component, templateData),
        { plainText: true }
      )

      const resolvedSubject = typeof payoutInvoiceTemplate.subject === 'function'
        ? payoutInvoiceTemplate.subject(templateData)
        : payoutInvoiceTemplate.subject

      const messageId = crypto.randomUUID()
      const normalizedEmail = affiliate.email.toLowerCase()

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
        console.log('Email suppressed for:', normalizedEmail)
        unsubscribeToken = ''
      }

      if (unsubscribeToken) {
        await supabaseAdmin.from('email_send_log').insert({
          message_id: messageId,
          template_name: 'payout-invoice',
          recipient_email: affiliate.email,
          status: 'pending',
        })

        await supabaseAdmin.rpc('enqueue_email', {
          queue_name: 'transactional_emails',
          payload: {
            message_id: messageId,
            to: affiliate.email,
            from: 'scale-infrastructure-hub <noreply@adcure.agency>',
            sender_domain: 'notify.adcure.agency',
            subject: resolvedSubject,
            html,
            text: plainText,
            purpose: 'transactional',
            label: 'payout-invoice',
            idempotency_key: `payout-invoice-${payoutId}`,
            unsubscribe_token: unsubscribeToken,
            queued_at: new Date().toISOString(),
          },
        })

        console.log('Invoice email enqueued for:', affiliate.email)
      }
    } catch (e) {
      console.error('Invoice email sending failed:', e)
    }

    return new Response(JSON.stringify({ success: true, invoiceNumber }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Generate invoice error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function generateInvoicePDF(data: {
  invoiceNumber: string
  issuedAt: string
  affiliateName: string
  affiliateEmail: string
  companyName?: string | null
  kvkNumber?: string | null
  vatNumber?: string | null
  iban?: string | null
  billingAddress?: string | null
  amount: number
  currency: string
}) {
  const date = new Date(data.issuedAt).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const currencySymbol = data.currency === 'EUR' ? '€' : data.currency

  const supplierLines: string[] = []
  if (data.companyName) supplierLines.push(`<strong>${data.companyName}</strong>`)
  supplierLines.push(data.affiliateName)
  supplierLines.push(data.affiliateEmail)
  if (data.billingAddress) supplierLines.push(data.billingAddress)
  if (data.kvkNumber) supplierLines.push(`KVK: ${data.kvkNumber}`)
  if (data.vatNumber) supplierLines.push(`VAT: ${data.vatNumber}`)
  if (data.iban) supplierLines.push(`IBAN: ${data.iban}`)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Self-Billing Invoice ${data.invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; color: #333; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    .subtitle { color: #666; font-size: 13px; margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f9f9f9; font-size: 12px; text-transform: uppercase; color: #666; }
    .total { font-size: 18px; font-weight: bold; }
    .footer { margin-top: 40px; font-size: 12px; color: #999; }
    .label { font-size: 12px; color: #999; text-transform: uppercase; margin-bottom: 2px; }
    .value { font-size: 14px; margin-bottom: 14px; line-height: 1.6; }
  </style>
</head>
<body>
  <h1>Self-Billing Invoice</h1>
  <p class="subtitle">Invoice No: ${data.invoiceNumber} | Date: ${date}</p>
  
  <div style="display:flex;gap:60px;margin-bottom:30px;">
    <div>
      <p class="label">From (Buyer)</p>
      <p class="value"><strong>Adcure Agency</strong><br>The Netherlands</p>
    </div>
    <div>
      <p class="label">To (Supplier/Affiliate)</p>
      <p class="value">${supplierLines.join('<br>')}</p>
    </div>
  </div>

  <table>
    <thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>
      <tr>
        <td>Affiliate commission payout</td>
        <td style="text-align:right">${currencySymbol}${Number(data.amount).toFixed(2)}</td>
      </tr>
      <tr>
        <td><strong>Total</strong></td>
        <td style="text-align:right" class="total">${currencySymbol}${Number(data.amount).toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <p style="font-size:13px;color:#666;">
    This is a self-billing invoice issued by Adcure Agency on behalf of the affiliate 
    in accordance with Article 224 of the EU VAT Directive (2006/112/EC).
    The affiliate has agreed to the self-billing arrangement as part of the 
    Affiliate Terms of Service.
  </p>

  <div class="footer">
    <p>This invoice is deemed accepted unless a written objection is received within 14 days.</p>
    <p>Generated automatically by Adcure — retain for a minimum of 7 years.</p>
  </div>
</body>
</html>`
}
