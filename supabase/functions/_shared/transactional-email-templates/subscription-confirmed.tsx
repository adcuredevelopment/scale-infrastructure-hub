import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Img, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Adcure'
const LOGO_URL = 'https://uwncaohygevjvtgkazvv.supabase.co/storage/v1/object/public/email-assets/adcure-logo.png'
const PORTAL_URL = 'https://portal.adcure.agency/login?from_url=https%3A%2F%2Fportal.adcure.agency%2F'

interface SubscriptionConfirmedProps {
  customerName?: string
  planName?: string
  amount?: number
  currency?: string
}

const SubscriptionConfirmedEmail = ({
  customerName,
  planName,
  amount,
  currency = 'EUR',
}: SubscriptionConfirmedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Thank you for subscribing to {SITE_NAME}!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img src={LOGO_URL} alt="Adcure Agency" width="180" height="auto" style={{ margin: '0' }} />
        </Section>

        <Heading style={h1}>
          Thank You for Subscribing!
        </Heading>

        <Text style={text}>
          {customerName ? `Hi ${customerName},` : 'Hi,'}
        </Text>

        <Text style={text}>
          Your <strong>{planName || 'subscription'}</strong> payment was successful. Welcome to {SITE_NAME}!
        </Text>

        {amount ? (
          <Section style={detailsBox}>
            <Text style={detailLabel}>Plan</Text>
            <Text style={detailValue}>{planName}</Text>
            <Text style={detailLabel}>Amount</Text>
            <Text style={detailValue}>{currency === 'EUR' ? '€' : currency}{Number(amount).toFixed(2)}/mo</Text>
            <Text style={detailLabel}>Status</Text>
            <Text style={{ ...detailValue, color: '#22c55e' }}>Active</Text>
          </Section>
        ) : null}

        <Heading as="h2" style={h2}>What's Next?</Heading>

        <Section style={stepRow}>
          <Text style={stepNumber}>1</Text>
          <Section>
            <Text style={stepTitle}>Create your account</Text>
            <Text style={stepDesc}>
              Click the button below to sign up on our platform. Use the same email you used for payment.
            </Text>
          </Section>
        </Section>

        <Section style={stepRow}>
          <Text style={stepNumber}>2</Text>
          <Section>
            <Text style={stepTitle}>Wait for admin approval</Text>
            <Text style={stepDesc}>
              After signing up, an admin will review and approve your account. You'll receive a confirmation email once approved.
            </Text>
          </Section>
        </Section>

        <Section style={stepRow}>
          <Text style={stepNumber}>3</Text>
          <Section>
            <Text style={stepTitle}>Start scaling</Text>
            <Text style={stepDesc}>
              Once approved, log in and start using your ad accounts, structures, and all premium features.
            </Text>
          </Section>
        </Section>

        <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
          <Button style={button} href={PORTAL_URL}>
            Sign Up on Our Platform
          </Button>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          Welcome aboard! If you have any questions, contact us at{' '}
          <a href="mailto:support@adcure.agency" style={{ color: '#2563eb' }}>support@adcure.agency</a>
        </Text>

        <Text style={footerSmall}>
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SubscriptionConfirmedEmail,
  subject: (data: Record<string, any>) =>
    `Welcome to Adcure — your ${data?.planName || 'subscription'} is active!`,
  displayName: 'Subscription confirmed',
  previewData: {
    customerName: 'John Doe',
    planName: 'Growth Advertiser',
    amount: 119,
    currency: 'EUR',
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

const h2 = {
  fontSize: '18px',
  fontWeight: '600' as const,
  color: '#111827',
  margin: '24px 0 16px',
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

const stepRow = {
  margin: '0 0 16px',
  padding: '0',
}

const stepNumber = {
  display: 'inline-block' as const,
  width: '28px',
  height: '28px',
  lineHeight: '28px',
  textAlign: 'center' as const,
  backgroundColor: '#eff6ff',
  color: '#2563eb',
  borderRadius: '50%',
  fontSize: '14px',
  fontWeight: '700' as const,
  margin: '0 12px 0 0',
  verticalAlign: 'top' as const,
}

const stepTitle = {
  fontSize: '15px',
  fontWeight: '600' as const,
  color: '#111827',
  margin: '0 0 4px',
}

const stepDesc = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '1.5',
  margin: '0 0 0',
}

const button = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  fontSize: '15px',
  borderRadius: '12px',
  padding: '14px 28px',
  textDecoration: 'none',
  fontWeight: '600' as const,
  display: 'inline-block' as const,
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
