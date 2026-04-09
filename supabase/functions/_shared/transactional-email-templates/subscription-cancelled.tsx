import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Img,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Adcure'
const LOGO_URL = 'https://uwncaohygevjvtgkazvv.supabase.co/storage/v1/object/public/email-assets/adcure-logo.png'

interface SubscriptionCancelledProps {
  customerName?: string
  planName?: string
  amount?: number
  currency?: string
  isLateCancellation?: boolean
}

const SubscriptionCancelledEmail = ({
  customerName,
  planName,
  amount,
  currency = 'EUR',
  isLateCancellation = false,
}: SubscriptionCancelledProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {SITE_NAME} subscription has been cancelled</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img src={LOGO_URL} alt="Adcure Agency" width="180" height="auto" style={{ margin: '0' }} />
        </Section>

        <Heading style={h1}>
          Subscription Cancelled
        </Heading>

        <Text style={text}>
          {customerName ? `Hi ${customerName},` : 'Hi,'}
        </Text>

        <Text style={text}>
          Your <strong>{planName || 'subscription'}</strong> has been successfully cancelled.
          You will no longer be billed for this plan.
        </Text>

        {amount ? (
          <Section style={detailsBox}>
            <Text style={detailLabel}>Plan</Text>
            <Text style={detailValue}>{planName}</Text>
            <Text style={detailLabel}>Amount</Text>
            <Text style={detailValue}>{currency === 'EUR' ? '€' : currency}{Number(amount).toFixed(2)}/mo</Text>
            <Text style={detailLabel}>Status</Text>
            <Text style={{ ...detailValue, color: '#ef4444' }}>Cancelled</Text>
          </Section>
        ) : null}

        {isLateCancellation ? (
          <Section style={lateNoticeBox}>
            <Text style={{ ...text, color: '#92400e', margin: '0' }}>
              <strong>Please note:</strong> This cancellation was made within the 14-day notice period 
              before your next billing date. As per our subscription policy, the final billing cycle 
              will still apply. No further charges will occur after that.
            </Text>
          </Section>
        ) : null}

        <Text style={text}>
          If this was a mistake or you'd like to resubscribe, feel free to visit our website
          or reach out to our support team.
        </Text>

        <Hr style={hr} />

        <Text style={footer}>
          Thank you for being a {SITE_NAME} customer. We hope to see you again!
        </Text>

        <Text style={footerSmall}>
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SubscriptionCancelledEmail,
  subject: (data: Record<string, any>) =>
    `Your ${data?.planName || 'subscription'} has been cancelled`,
  displayName: 'Subscription cancelled',
  previewData: {
    customerName: 'John Doe',
    planName: 'Growth Advertiser',
    amount: 119,
    currency: 'EUR',
    isLateCancellation: false,
  },
} satisfies TemplateEntry

// Styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'DM Sans', 'Plus Jakarta Sans', Arial, sans-serif",
}

const container = {
  padding: '40px 25px',
  maxWidth: '560px',
  margin: '0 auto',
}

const logoSection = {
  marginBottom: '24px',
}

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

const lateNoticeBox = {
  backgroundColor: '#fffbeb',
  borderRadius: '12px',
  padding: '16px 20px',
  margin: '16px 0 24px',
  border: '1px solid #fde68a',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

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
