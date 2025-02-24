import type { SecurityEventType, SecurityEventSeverity, SecureUser, SecurityEventMetadata } from '@/types/server';

interface SecurityNotificationParams {
  user: SecureUser;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  metadata: SecurityEventMetadata;
}

interface NotificationTemplate {
  subject: string;
  body: string;
}

const NOTIFICATION_TEMPLATES: Record<SecurityEventType, (metadata: SecurityEventMetadata) => NotificationTemplate> = {
  login: (metadata) => ({
    subject: 'New Login to Your Account',
    body: `A new login was detected from ${metadata.device} in ${metadata.location || 'Unknown Location'}.`
  }),
  logout: () => ({
    subject: 'Logged Out of Your Account',
    body: 'You have been successfully logged out of your account.'
  }),
  password_change: (metadata) => ({
    subject: 'Password Changed',
    body: `Your password was changed from ${metadata.device} in ${metadata.location || 'Unknown Location'}.`
  }),
  password_reset: () => ({
    subject: 'Password Reset Requested',
    body: 'A password reset was requested for your account.'
  }),
  two_factor_enabled: () => ({
    subject: 'Two-Factor Authentication Enabled',
    body: 'Two-factor authentication has been enabled for your account.'
  }),
  two_factor_disabled: () => ({
    subject: 'Two-Factor Authentication Disabled',
    body: 'Two-factor authentication has been disabled for your account.'
  }),
  account_locked: (metadata) => ({
    subject: 'Account Locked',
    body: `Your account has been locked due to ${metadata.reason}. It will be unlocked in ${metadata.expiryTime ? new Date(metadata.expiryTime).toLocaleString() : 'some time'}.`
  }),
  account_unlocked: () => ({
    subject: 'Account Unlocked',
    body: 'Your account has been unlocked. You can now log in.'
  }),
  failed_login: (metadata) => ({
    subject: 'Failed Login Attempt',
    body: `A failed login attempt was detected from ${metadata.device} in ${metadata.location || 'Unknown Location'}.`
  }),
  suspicious_activity: (metadata) => ({
    subject: 'Suspicious Activity Detected',
    body: `Suspicious activity was detected on your account: ${metadata.reason}`
  }),
  new_device: (metadata) => ({
    subject: 'New Device Detected',
    body: `A new device (${metadata.device}) was used to access your account from ${metadata.location || 'Unknown Location'}.`
  }),
  new_location: (metadata) => ({
    subject: 'New Login Location',
    body: `Your account was accessed from a new location: ${metadata.location || 'Unknown Location'}`
  }),
  session_expired: () => ({
    subject: 'Session Expired',
    body: 'Your session has expired. Please log in again.'
  }),
  multiple_failures: (metadata) => ({
    subject: 'Multiple Failed Login Attempts',
    body: `Multiple failed login attempts (${metadata.attempts}) have been detected on your account.`
  })
};

/**
 * Send a security notification email to the user
 */
export async function sendSecurityNotification({
  user,
  type,
  severity,
  metadata
}: SecurityNotificationParams): Promise<void> {
  try {
    // Skip if user has notifications disabled
    if (!user.securityPreferences?.loginNotifications) {
      return;
    }

    const template = NOTIFICATION_TEMPLATES[type](metadata);

    // TODO: Replace with your email service implementation
    await sendEmail({
      to: user.email,
      subject: `[${severity.toUpperCase()}] ${template.subject}`,
      html: `
        <h2>${template.subject}</h2>
        <p>${template.body}</p>
        <hr />
        <p><strong>Device:</strong> ${metadata.device || 'Unknown'}</p>
        <p><strong>Location:</strong> ${metadata.location || 'Unknown'}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>IP Address:</strong> ${metadata.ipAddress}</p>
        <hr />
        <p>If you didn't perform this action, please secure your account immediately.</p>
      `
    });
  } catch (error) {
    console.error('Failed to send security notification:', error);
  }
}

// Placeholder email sending function - replace with your implementation
async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<void> {
  // TODO: Implement your email sending logic
  console.log('Sending email:', { to, subject, html });
}