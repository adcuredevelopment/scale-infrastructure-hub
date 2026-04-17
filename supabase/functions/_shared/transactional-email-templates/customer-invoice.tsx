import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Adcure'
const LOGO_URL = 'https://uwncaohygevjvtgkazvv.supabase.co/storage/v1/object/public/email-assets/adcure-logo.png'

interface CustomerInvoiceProps {
  customerName?: string
  invoiceNumber?: string
  productName?: string
  total?: number
  currency?: string
  downloadUrl?: string
  issuedAt?: string
}

const fmt = (n: number, currency = 'EUR') =>
  `${currency === 'EUR' ? '€' : currency}${Number(n).toFixed(2)}`

const CustomerInvoiceEmail = ({
  customerName,
  invoiceNumber,
  productName,
  total,
  currency = 'EUR',
  downloadUrl,
  issuedAt,
}: CustomerInvoiceProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {SITE_NAME} invoice {invoiceNumber || ''} is ready</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={{ marginBottom: '24px' }}>
          <Img src={LOGO_URL} alt="Adcure" width="180" height="auto" style={{ margin: 0 }} />
        </Section>

        <Heading style={h1}>Your invoice is ready</Heading>

        <Text style={text}>
          {customerName ? `Hi ${customerName},` : 'Hi,'}
        </Text>

        <Text style={text}>
          Thanks for your payment. Your invoice for <strong>{productName || 'your purchase'}</strong> is attached below as a PDF.
        </Text>

        <Section style={detailsBox}>
          <Text style={label}>Invoice number</Text>
          <Text style={value}>{invoiceNumber || '—'}</Text>

          {issuedAt ? (<>
            <Text style={label}>Date</Text>
            <Text style={value}>{issuedAt}</Text>
          </>) : null}

          {total !== undefined ? (<>
            <Text style={label}>Amount</Text>
            <Text style={{ ...value, fontSize: '17px', fontWeight: '700' as const }}>{fmt(total, currency)}</Text>
          </>) : null}
        </Section>

        {downloadUrl ? (
          <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
            <Button href={downloadUrl} style={btn}>Download Invoice (PDF)</Button>
            <Text style={hint}>Link is valid for 7 days. Save the PDF for your records.</Text>
          </Section>
        ) : null}

        <Hr style={hr} />

        <Text style={footer}>
          Questions about this invoice? Reply to this email or contact{' '}
          <a href="mailto:support@adcure.agency" style={{ color: '#2563eb' }}>support@adcure.agency</a>.
        </Text>

        <Text style={footerSmall}>
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CustomerInvoiceEmail,
  subject: (data: Record<string, any>) =>
    `Invoice ${data?.invoiceNumber || ''} from ${SITE_NAME}`.trim(),
  displayName: 'Customer invoice',
  previewData: {
    customerName: 'John Doe',
    invoiceNumber: 'INV-2026-000123',
    productName: 'Facebook Vietnamese 3Line Account',
    total: 36.30,
    currency: 'EUR',
    downloadUrl: 'https://example.com/invoice.pdf',
    issuedAt: '17 April 2026',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', 'Plus Jakarta Sans', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#111827', margin: '0 0 24px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 16px' }
const detailsBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  padding: '20px 24px',
  margin: '24px 0',
  border: '1px solid #e5e7eb',
}
const label = {
  fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase' as const,
  letterSpacing: '0.05em', margin: '0 0 2px', fontWeight: '600' as const,
}
const value = { fontSize: '15px', color: '#111827', margin: '0 0 14px', fontWeight: '500' as const }
const btn = {
  backgroundColor: '#111827', color: '#ffffff', padding: '14px 28px',
  borderRadius: '10px', textDecoration: 'none', fontWeight: '600' as const, fontSize: '15px',
}
const hint = { fontSize: '12px', color: '#9ca3af', margin: '12px 0 0' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '14px', color: '#6b7280', lineHeight: '1.5', margin: '0 0 8px' }
const footerSmall = { fontSize: '12px', color: '#9ca3af', margin: '0' }
