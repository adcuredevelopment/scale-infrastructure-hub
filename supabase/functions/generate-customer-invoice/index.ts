import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const LOGO_URL = 'https://uwncaohygevjvtgkazvv.supabase.co/storage/v1/object/public/email-assets/adcure-logo.png'

const COMPANY = {
  name: 'Adcure Agency',
  addressLines: ['The Netherlands'],
  email: 'support@adcure.agency',
  kvk: '',
  vat: '',
}

interface Body {
  paymentId: string
  type: 'shop_order' | 'subscription_initial' | 'subscription_renewal'
}

function pad(n: number, width: number) {
  return n.toString().padStart(width, '0')
}

function formatInvoiceNumber(seq: number): string {
  return `INV-${new Date().getFullYear()}-${pad(seq, 6)}`
}

function fmtMoney(n: number, currency = 'EUR') {
  const sym = currency === 'EUR' ? '€' : currency + ' '
  return `${sym}${Number(n).toFixed(2)}`
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

async function buildPdf(opts: {
  invoiceNumber: string
  issuedAt: Date
  customerName: string | null
  customerEmail: string
  country: string | null
  productName: string
  subtotal: number
  vatAmount: number
  vatRate: number
  total: number
  currency: string
  paymentMethod: string
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([595.28, 841.89]) // A4
  const { width, height } = page.getSize()

  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)

  const text = (s: string, x: number, y: number, size = 10, bold = false, color = rgb(0.1, 0.12, 0.15)) => {
    page.drawText(s, { x, y, size, font: bold ? fontBold : font, color })
  }

  const margin = 50
  let y = height - margin

  // Logo
  try {
    const logoRes = await fetch(LOGO_URL)
    if (logoRes.ok) {
      const logoBytes = new Uint8Array(await logoRes.arrayBuffer())
      const logo = await pdf.embedPng(logoBytes).catch(() => null)
      if (logo) {
        const scale = 110 / logo.width
        page.drawImage(logo, { x: margin, y: y - logo.height * scale, width: logo.width * scale, height: logo.height * scale })
      }
    }
  } catch (e) {
    console.warn('Logo embed failed', e)
  }

  // Right top: Invoice block
  text('INVOICE', width - margin - 100, y, 22, true)
  y -= 30
  text(`Invoice No: ${opts.invoiceNumber}`, width - margin - 160, y, 9)
  y -= 14
  text(`Date: ${fmtDate(opts.issuedAt)}`, width - margin - 160, y, 9)

  // Reset y to below logo
  y = height - margin - 90

  // From / To
  text('FROM', margin, y, 9, true, rgb(0.45, 0.45, 0.5))
  text('BILL TO', width / 2, y, 9, true, rgb(0.45, 0.45, 0.5))
  y -= 16
  text(COMPANY.name, margin, y, 11, true)
  text(opts.customerName || opts.customerEmail, width / 2, y, 11, true)
  y -= 14
  for (const line of COMPANY.addressLines) {
    text(line, margin, y, 10)
    y -= 12
  }
  if (COMPANY.kvk) { text(`KVK: ${COMPANY.kvk}`, margin, y, 10); y -= 12 }
  if (COMPANY.vat) { text(`VAT: ${COMPANY.vat}`, margin, y, 10); y -= 12 }

  // Customer side
  let cy = height - margin - 120
  text(opts.customerEmail, width / 2, cy, 10)
  cy -= 12
  if (opts.country) { text(opts.country, width / 2, cy, 10) }

  // Items table
  y = Math.min(y, cy) - 30
  const tableTop = y
  const tableX = margin
  const tableW = width - margin * 2

  // Header bar
  page.drawRectangle({ x: tableX, y: y - 22, width: tableW, height: 24, color: rgb(0.95, 0.96, 0.97) })
  text('Description', tableX + 12, y - 16, 10, true, rgb(0.3, 0.32, 0.36))
  text('Amount', tableX + tableW - 70, y - 16, 10, true, rgb(0.3, 0.32, 0.36))
  y -= 38

  // Row
  text(opts.productName, tableX + 12, y, 11)
  text(fmtMoney(opts.subtotal, opts.currency), tableX + tableW - 70, y, 11)
  y -= 26

  // Divider
  page.drawLine({ start: { x: tableX + 12, y }, end: { x: tableX + tableW - 12, y }, thickness: 0.5, color: rgb(0.85, 0.86, 0.88) })
  y -= 18

  // Totals
  const labelX = tableX + tableW - 200
  const valueX = tableX + tableW - 70
  text('Subtotal', labelX, y, 10, false, rgb(0.4, 0.42, 0.46))
  text(fmtMoney(opts.subtotal, opts.currency), valueX, y, 10)
  y -= 16

  if (opts.vatRate > 0) {
    text(`VAT (${(opts.vatRate * 100).toFixed(0)}%)`, labelX, y, 10, false, rgb(0.4, 0.42, 0.46))
    text(fmtMoney(opts.vatAmount, opts.currency), valueX, y, 10)
    y -= 16
  } else {
    text('VAT', labelX, y, 10, false, rgb(0.4, 0.42, 0.46))
    text(fmtMoney(0, opts.currency), valueX, y, 10)
    y -= 16
  }

  page.drawLine({ start: { x: labelX, y: y + 4 }, end: { x: valueX + 60, y: y + 4 }, thickness: 0.5, color: rgb(0.85, 0.86, 0.88) })
  y -= 8
  text('TOTAL', labelX, y, 12, true)
  text(fmtMoney(opts.total, opts.currency), valueX, y, 12, true)
  y -= 36

  // Payment status box
  page.drawRectangle({ x: margin, y: y - 32, width: tableW, height: 36, color: rgb(0.94, 0.98, 0.95), borderColor: rgb(0.6, 0.85, 0.65), borderWidth: 0.5 })
  text('Payment status: PAID', margin + 14, y - 20, 11, true, rgb(0.1, 0.55, 0.25))
  text(`Payment method: ${opts.paymentMethod}`, margin + 220, y - 20, 10, false, rgb(0.25, 0.45, 0.3))
  y -= 60

  // Footer
  text('Thank you for your business.', margin, 80, 11, true)
  text(`Questions? Contact ${COMPANY.email}`, margin, 64, 9, false, rgb(0.45, 0.45, 0.5))
  text(`This invoice was generated automatically by ${COMPANY.name}.`, margin, 50, 8, false, rgb(0.6, 0.6, 0.65))

  return await pdf.save()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { paymentId, type } = (await req.json()) as Body
    if (!paymentId || !type) {
      return new Response(JSON.stringify({ error: 'paymentId and type required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Idempotency check
    const { data: existingInv } = await supabase
      .from('customer_invoices')
      .select('id, invoice_number, pdf_path')
      .eq('payment_id', paymentId)
      .maybeSingle()

    if (existingInv) {
      console.log(`Invoice already exists for payment ${paymentId}: ${existingInv.invoice_number}`)
      return new Response(JSON.stringify({ ok: true, invoice: existingInv, skipped: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Load payment
    const { data: payment, error: payErr } = await supabase
      .from('payments').select('*').eq('id', paymentId).maybeSingle()
    if (payErr || !payment) {
      return new Response(JSON.stringify({ error: 'Payment not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const payload = (payment.payload || {}) as any
    const email: string | undefined = payload.email
    if (!email) {
      return new Response(JSON.stringify({ error: 'No email in payment payload' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const isShop = type === 'shop_order' || payload.type === 'shop_order'
    const productName: string = isShop
      ? (payload.product || 'Adcure Shop Order')
      : (payload.plan || 'Adcure Subscription')

    const customerName: string | null = payload.firstName && payload.lastName
      ? `${payload.firstName} ${payload.lastName}` : (payload.name || null)
    const country: string | null = payload.country || null

    // Money — re-derive to be safe
    const subtotal = Number(payload.amount || 0)
    let vatAmount = Number(payload.vat || 0)
    let total = Number(payload.total || (subtotal + vatAmount) || subtotal)
    
    let vatRate = subtotal > 0 ? Math.round((vatAmount / subtotal) * 100) / 100 : 0
    if (vatAmount === 0 && country === 'NL' && !isShop) {
      vatRate = 0
    }

    // Subscription type override based on prior completed payments for same email+plan
    let finalType = type
    if (!isShop) {
      const { count } = await supabase
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed')
        .filter('payload->>email', 'eq', email)
        .filter('payload->>plan', 'eq', productName)
      finalType = (count && count > 1) ? 'subscription_renewal' : 'subscription_initial'
    }

    // Generate invoice number
    const { data: seqData, error: seqErr } = await supabase.rpc('nextval_customer_invoice')
    if (seqErr) throw seqErr
    const invoiceNumber = formatInvoiceNumber(Number(seqData))
    const issuedAt = new Date()

    // Build PDF
    const pdfBytes = await buildPdf({
      invoiceNumber,
      issuedAt,
      customerName,
      customerEmail: email,
      country,
      productName,
      subtotal: subtotal || total,
      vatAmount,
      vatRate,
      total: total || subtotal,
      currency: 'EUR',
      paymentMethod: 'Revolut',
    })

    // Upload
    const safeEmail = email.replace(/[^a-zA-Z0-9@._-]/g, '_')
    const pdfPath = `${safeEmail}/${invoiceNumber}.pdf`
    const { error: upErr } = await supabase.storage
      .from('customer-invoices')
      .upload(pdfPath, pdfBytes, { contentType: 'application/pdf', upsert: true })
    if (upErr) throw upErr

    // Insert invoice record
    const { data: invRow, error: invErr } = await supabase
      .from('customer_invoices')
      .insert({
        invoice_number: invoiceNumber,
        customer_email: email,
        customer_name: customerName,
        type: finalType,
        product_name: productName,
        subtotal: subtotal || total,
        vat_amount: vatAmount,
        vat_rate: vatRate,
        total: total || subtotal,
        currency: 'EUR',
        country,
        payment_id: paymentId,
        pdf_path: pdfPath,
        issued_at: issuedAt.toISOString(),
      })
      .select()
      .single()
    if (invErr) throw invErr

    // Signed URL for email (7 days)
    const { data: signed } = await supabase.storage
      .from('customer-invoices')
      .createSignedUrl(pdfPath, 60 * 60 * 24 * 7)
    const downloadUrl = signed?.signedUrl

    // Send email
    try {
      await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'customer-invoice',
          recipientEmail: email,
          idempotencyKey: `invoice-${invoiceNumber}`,
          templateData: {
            customerName,
            invoiceNumber,
            productName,
            total: total || subtotal,
            currency: 'EUR',
            downloadUrl,
            issuedAt: fmtDate(issuedAt),
          },
        },
      })
    } catch (e) {
      console.error('Failed to send invoice email', e)
    }

    return new Response(JSON.stringify({ ok: true, invoice: invRow }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('generate-customer-invoice error', err)
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
