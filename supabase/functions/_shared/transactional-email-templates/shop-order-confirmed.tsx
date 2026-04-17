import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Img,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Adcure'
const LOGO_URL = 'https://uwncaohygevjvtgkazvv.supabase.co/storage/v1/object/public/email-assets/adcure-logo.png'

interface ShopOrderConfirmedProps {
  customerName?: string
  productName?: string
  amount?: number
  vat?: number
  total?: number
  currency?: string
  deliveryTime?: string
}

const fmt = (n: number, currency = 'EUR') =>
  `${currency === 'EUR' ? '€' : currency}${Number(n).toFixed(2)}`

const ShopOrderConfirmedEmail = ({
  customerName,
  productName,
  amount,
  vat = 0,
  total,
  currency = 'EUR',
  deliveryTime = 'within 1 hour',
}: ShopOrderConfirmedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {SITE_NAME} order is confirmed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img src={LOGO_URL} alt="Adcure Agency" width="180" height="auto" style={{ margin: '0' }} />
        </Section>

        <Heading style={h1}>Order Confirmed!</Heading>

        <Text style={text}>
          {customerName ? `Hi ${customerName},` : 'Hi,'}
        </Text>

        <Text style={text}>
          Thanks for your order! We've received your payment for{' '}
          <strong>{productName || 'your product'}</strong> and we're preparing your delivery.
        </Text>

        <Section style={detailsBox}>
          <Text style={detailLabel}>Product</Text>
          <Text style={detailValue}>{productName || '—'}</Text>

          {amount !== undefined ? (
            <>
              <Text style={detailLabel}>Subtotal</Text>
              <Text style={detailValue}>{fmt(amount, currency)}</Text>
            </>
          ) : null}

          {vat > 0 ? (
            <>
              <Text style={detailLabel}>VAT (21%)</Text>
              <Text style={detailValue}>{fmt(vat, currency)}</Text>
            </>
          ) : null}

          {total !== undefined ? (
            <>
              <Text style={detailLabel}>Total Paid</Text>
              <Text style={{ ...detailValue, fontWeight: '700' as const, fontSize: '17px' }}>
                {fmt(total, currency)}
              </Text>
            </>
          ) : null}

          <Text style={detailLabel}>Status</Text>
          <Text style={{ ...detailValue, color: '#22c55e' }}>Paid</Text>
        </Section>

        <Heading as="h2" style={h2}>What happens next?</Heading>

        <Text style={text}>
          You'll receive your product details by email <strong>{deliveryTime}</strong>.
          Our team is preparing everything to get you up and running as fast as possible.
        </Text>

        <Text style={text}>
          If you have any questions about your order, just reply to this email or
          contact us at{' '}
          <a href="mailto:support@adcure.agency" style={{ color: '#2563eb' }}>support@adcure.agency</a>.
        </Text>

        <Hr style={hr} />

        <Text style={footer}>
          Thanks for choosing {SITE_NAME}.
        </Text>

        <Text style={footerSmall}>
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ShopOrderConfirmedEmail,
  subject: (data: Record<string, any>) =>
    `Your ${SITE_NAME} order is confirmed — ${data?.productName || 'your purchase'}`,
  displayName: 'Shop order confirmed',
  previewData: {
    customerName: 'John Doe',
    productName: 'Facebook Vietnamese 3Line Account',
    amount: 30,
    vat: 6.3,
    total: 36.3,
    currency: 'EUR',
    deliveryTime: 'within 1 hour',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'DM Sans', 'Plus Jakarta Sans', Arial, sans-serif",
}
const container = { padding: '40px 25px', maxWidth: '560px', margin: '0 auto' }
const logoSection = { marginBottom: '24px' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#111827', margin: '0 0 24px', lineHeight: '1.3' }
const h2 = { fontSize: '18px', fontWeight: '600' as const, color: '#111827', margin: '24px 0 16px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 16px' }
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
const detailValue = { fontSize: '15px', color: '#111827', margin: '0 0 14px', fontWeight: '500' as const }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '14px', color: '#6b7280', lineHeight: '1.5', margin: '0 0 8px' }
const footerSmall = { fontSize: '12px', color: '#9ca3af', margin: '0' }
