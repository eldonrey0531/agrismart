interface SecurityContext {
  to: string
  name?: string
  ipAddress: string
  userAgent?: string
  location?: string
  timestamp: Date
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

function getSecurityUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/dashboard/profile/security`
}

// Simple email sending functionality
async function sendEmail({
  to,
  subject,
  text,
  html
}: {
  to: string
  subject: string
  text: string
  html?: string
}) {
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 Email would be sent in production:')
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Content: ${text}`)
    return
  }

  // In production, implement your email sending logic here
  // Example: using AWS SES, SendGrid, etc.
  try {
    // For now, just log
    console.log(`📧 Email sent to ${to}: ${subject}`)
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}

// Security email templates
export async function sendPasswordChangedEmail(context: SecurityContext) {
  const { to, name, ipAddress, userAgent, location, timestamp } = context
  
  await sendEmail({
    to,
    subject: '🔐 Your password has been changed',
    text: `
Hello ${name || 'there'},

Your password was recently changed. Here are the details:

Time: ${formatDate(timestamp)}
Location: ${location || 'Unknown'}
IP Address: ${ipAddress}
Device: ${userAgent || 'Unknown'}

If you did not make this change, please secure your account immediately:
${getSecurityUrl()}

Best regards,
Security Team
    `.trim()
  })
}

export async function sendLoginAlertEmail(context: SecurityContext) {
  const { to, name, ipAddress, userAgent, location, timestamp } = context
  
  await sendEmail({
    to,
    subject: '🔔 New sign-in detected',
    text: `
Hello ${name || 'there'},

We detected a new sign-in to your account from:

Time: ${formatDate(timestamp)}
Location: ${location || 'Unknown'}
IP Address: ${ipAddress}
Device: ${userAgent || 'Unknown'}

If this wasn't you, please secure your account:
${getSecurityUrl()}

Best regards,
Security Team
    `.trim()
  })
}

export async function send2FAEnabledEmail(context: SecurityContext) {
  const { to, name, ipAddress, location, timestamp } = context
  
  await sendEmail({
    to,
    subject: '🔒 Two-factor authentication enabled',
    text: `
Hello ${name || 'there'},

Two-factor authentication has been enabled on your account.

Time: ${formatDate(timestamp)}
Location: ${location || 'Unknown'}
IP Address: ${ipAddress}

Your account is now more secure. If you did not make this change,
please contact support immediately.

Best regards,
Security Team
    `.trim()
  })
}

export async function send2FADisabledEmail(context: SecurityContext) {
  const { to, name, ipAddress, location, timestamp } = context
  
  await sendEmail({
    to,
    subject: '⚠️ Two-factor authentication disabled',
    text: `
Hello ${name || 'there'},

Two-factor authentication has been disabled on your account.

Time: ${formatDate(timestamp)}
Location: ${location || 'Unknown'}
IP Address: ${ipAddress}

This reduces your account security. If you did not make this change,
please secure your account immediately:
${getSecurityUrl()}

Best regards,
Security Team
    `.trim()
  })
}