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
  kvk: '89821211',
  vat: 'NL003924266B58',
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

// Note: explicit space between currency symbol and amount so the € glyph
// doesn't visually collide with the digits in pdf-lib's Helvetica.
function fmtMoney(n: number, currency = 'EUR') {
  const sym = currency === 'EUR' ? '€' : currency
  return `${sym} ${Number(n).toFixed(2)}`
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

  // Color palette — premium minimal
  const ink = rgb(0.07, 0.09, 0.12)        // near-black
  const muted = rgb(0.45, 0.47, 0.52)       // grey label
  const subtle = rgb(0.62, 0.64, 0.68)      // very light grey
  const hairline = rgb(0.88, 0.89, 0.91)    // divider
  const surface = rgb(0.975, 0.978, 0.982)  // table header bg

  const text = (
    s: string,
    x: number,
    y: number,
    size = 10,
    bold = false,
    color = ink,
  ) => {
    page.drawText(s, { x, y, size, font: bold ? fontBold : font, color })
  }

  const textRight = (
    s: string,
    rightX: number,
    y: number,
    size = 10,
    bold = false,
    color = ink,
  ) => {
    const f = bold ? fontBold : font
    const w = f.widthOfTextAtSize(s, size)
    page.drawText(s, { x: rightX - w, y, size, font: f, color })
  }

  const margin = 50
  const contentW = width - margin * 2

  // ───────── Header ─────────
  let headerTop = height - margin
  let logoBottom = headerTop

  // Logo (left)
  try {
    const logoRes = await fetch(LOGO_URL)
    if (logoRes.ok) {
      const logoBytes = new Uint8Array(await logoRes.arrayBuffer())
      const logo = await pdf.embedPng(logoBytes).catch(() => null)
      if (logo) {
        const targetW = 120
        const scale = targetW / logo.width
        const h = logo.height * scale
        page.drawImage(logo, {
          x: margin,
          y: headerTop - h,
          width: targetW,
          height: h,
        })
        logoBottom = headerTop - h
      }
    }
  } catch (e) {
    console.warn('Logo embed failed', e)
  }

  // Right header — INVOICE + meta
  textRight('INVOICE', width - margin, headerTop - 4, 26, true, ink)
  textRight(`No. ${opts.invoiceNumber}`, width - margin, headerTop - 26, 10, false, muted)
  textRight(fmtDate(opts.issuedAt), width - margin, headerTop - 40, 10, false, muted)

  // Hairline under header
  const dividerY = Math.min(logoBottom, headerTop - 60) - 18
  page.drawLine({
    start: { x: margin, y: dividerY },
    end: { x: width - margin, y: dividerY },
    thickness: 0.6,
    color: hairline,
  })

  // ───────── From / Bill to ─────────
  let y = dividerY - 28
  const colLeftX = margin
  const colRightX = margin + contentW / 2

  text('FROM', colLeftX, y, 8, true, subtle)
  text('BILL TO', colRightX, y, 8, true, subtle)
  y -= 16

  text(COMPANY.name, colLeftX, y, 11, true, ink)
  text(opts.customerName || opts.customerEmail, colRightX, y, 11, true, ink)
  y -= 14

  let leftY = y
  let rightY = y
  for (const line of COMPANY.addressLines) {
    text(line, colLeftX, leftY, 9.5, false, muted)
    leftY -= 13
  }
  if (COMPANY.kvk) {
    text(`KVK ${COMPANY.kvk}`, colLeftX, leftY, 9.5, false, muted)
    leftY -= 13
  }
  if (COMPANY.vat) {
    text(`VAT ${COMPANY.vat}`, colLeftX, leftY, 9.5, false, muted)
    leftY -= 13
  }
  text(COMPANY.email, colLeftX, leftY, 9.5, false, muted)
  leftY -= 13

  text(opts.customerEmail, colRightX, rightY, 9.5, false, muted)
  rightY -= 13
  if (opts.country) {
    text(opts.country, colRightX, rightY, 9.5, false, muted)
    rightY -= 13
  }

  // ───────── Items table ─────────
  y = Math.min(leftY, rightY) - 28
  const tableX = margin
  const tableW = contentW
  const headerH = 26

  // Header row
  page.drawRectangle({
    x: tableX,
    y: y - headerH,
    width: tableW,
    height: headerH,
    color: surface,
  })
  text('DESCRIPTION', tableX + 14, y - 17, 9, true, muted)
  textRight('AMOUNT', tableX + tableW - 14, y - 17, 9, true, muted)
  y -= headerH + 18

  // Single item row
  text(opts.productName, tableX + 14, y, 11, false, ink)
  textRight(fmtMoney(opts.subtotal, opts.currency), tableX + tableW - 14, y, 11, false, ink)
  y -= 22

  // Divider
  page.drawLine({
    start: { x: tableX, y },
    end: { x: tableX + tableW, y },
    thickness: 0.5,
    color: hairline,
  })
  y -= 22

  // ───────── Totals ─────────
  const totalsRight = tableX + tableW - 14
  const labelRight = totalsRight - 110

  textRight('Subtotal', labelRight, y, 10, false, muted)
  textRight(fmtMoney(opts.subtotal, opts.currency), totalsRight, y, 10, false, ink)
  y -= 16

  const vatLabel =
    opts.vatRate > 0 ? `VAT (${(opts.vatRate * 100).toFixed(0)}%)` : 'VAT (0%)'
  textRight(vatLabel, labelRight, y, 10, false, muted)
  textRight(fmtMoney(opts.vatAmount, opts.currency), totalsRight, y, 10, false, ink)
  y -= 14

  // Hairline above TOTAL
  page.drawLine({
    start: { x: labelRight - 30, y: y - 4 },
    end: { x: totalsRight, y: y - 4 },
    thickness: 0.6,
    color: hairline,
  })
  y -= 22

  textRight('TOTAL', labelRight, y, 13, true, ink)
  textRight(fmtMoney(opts.total, opts.currency), totalsRight, y, 14, true, ink)
  y -= 18

  // Subtle paid line (replaces green box)
  textRight(
    `Paid via ${opts.paymentMethod} · ${fmtDate(opts.issuedAt)}`,
    totalsRight,
    y,
    8.5,
    false,
    subtle,
  )

  // ───────── Footer ─────────
  // Thin line
  page.drawLine({
    start: { x: margin, y: 110 },
    end: { x: width - margin, y: 110 },
    thickness: 0.5,
    color: hairline,
  })

  const centerText = (s: string, yy: number, size: number, bold = false, color = ink) => {
    const f = bold ? fontBold : font
    const w = f.widthOfTextAtSize(s, size)
    page.drawText(s, { x: (width - w) / 2, y: yy, size, font: f, color })
  }

  centerText('Thank you for your business.', 88, 11, true, ink)
  centerText(`Questions? Contact ${COMPANY.email}`, 70, 9, false, muted)
  centerText(
    `${COMPANY.name} · KVK ${COMPANY.kvk} · VAT ${COMPANY.vat}`,
    54,
    8,
    false,
    subtle,
  )

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
