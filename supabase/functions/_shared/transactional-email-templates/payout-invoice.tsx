import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Img,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Adcure'
const LOGO_URL = 'https://uwncaohygevjvtgkazvv.supabase.co/storage/v1/object/public/email-assets/adcure-logo.png'

interface PayoutInvoiceProps {
  affiliateName?: string
  invoiceNumber?: string
  amount?: number
  currency?: string
  issuedAt?: string
}

const PayoutInvoiceEmail = ({
  affiliateName,
  invoiceNumber,
  amount,
  currency = 'EUR',
  issuedAt,
}: PayoutInvoiceProps) => {
  const currencySymbol = currency === 'EUR' ? '€' : currency
  const dateStr = issuedAt
    ? new Date(issuedAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your {SITE_NAME} commission payout invoice {invoiceNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img src={LOGO_URL} alt="Adcure Agency" width="180" height="auto" style={{ margin: '0' }} />
          </Section>

          <Heading style={h1}>Commission Payout Processed</Heading>

          <Text style={text}>
            {affiliateName ? `Hi ${affiliateName},` : 'Hi,'}
          </Text>

          <Text style={text}>
            Your affiliate commission payout has been processed. A self-billing invoice 
            has been generated for your records.
          </Text>

          <Section style={detailsBox}>
            <Text style={detailLabel}>Invoice Number</Text>
            <Text style={detailValue}>{invoiceNumber || 'N/A'}</Text>
            <Text style={detailLabel}>Amount</Text>
            <Text style={detailValue}>{currencySymbol}{amount ? Number(amount).toFixed(2) : '0.00'}</Text>
            <Text style={detailLabel}>Date</Text>
            <Text style={detailValue}>{dateStr}</Text>
          </Section>

          <Text style={text}>
            This self-billing invoice was issued by {SITE_NAME} on your behalf in accordance 
            with the self-billing arrangement agreed upon in the Affiliate Terms of Service 
            and Article 224 of the EU VAT Directive.
          </Text>

          <Text style={text}>
            The invoice is deemed accepted unless you raise a written objection within 14 days. 
            Please retain this for your records (minimum 7 years as per Dutch requirements).
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Thank you for being an {SITE_NAME} affiliate partner!
          </Text>

          <Text style={footerSmall}>
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: PayoutInvoiceEmail,
  subject: (data: Record<string, any>) =>
    `Commission Payout Invoice ${data?.invoiceNumber || ''}`.trim(),
  displayName: 'Payout invoice (self-billing)',
  previewData: {
    affiliateName: 'Jane Doe',
    invoiceNumber: 'SBI-000001',
    amount: 125.40,
    currency: 'EUR',
    issuedAt: '2026-04-01T00:00:00Z',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'DM Sans', 'Plus Jakarta Sans', Arial, sans-serif",
}

const container = {
  padding: '40px 25px',
  maxWidth: '560px',
  margin: '0 auto',
}

const logoSection = { marginBottom: '24px' }

const h1 = {
  fontSize: '24px',
  fontWeight: '700' as const,
  color: '#111827',
  margin: '0 0 24px',
  lineHeight: '1.3',
}

const text = {
  fontSize: '15px',
  color: '#4b5563',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const detailsBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  padding: '20px 24px',
  margin: '24px 0',
  border: '1px solid #e5e7eb',
}

const detailLabel = {
  fontSize: '12px',
  color: '#9ca3af',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  margin: '0 0 2px',
  fontWeight: '600' as const,
}

const detailValue = {
  fontSize: '15px',
  color: '#111827',
  margin: '0 0 14px',
  fontWeight: '500' as const,
}

const hr = { borderColor: '#e5e7eb', margin: '24px 0' }

const footer = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '1.5',
  margin: '0 0 8px',
}

const footerSmall = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '0',
}
