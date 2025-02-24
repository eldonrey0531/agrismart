import { emailStyles, wrapEmailContent, createButton, createCodeBox } from './styles'
import type {
  EmailTemplate,
  TemplateDataMap,
  EmailTemplateType
} from './types'

/**
 * Verification email template
 */
function createVerificationEmail(data: TemplateDataMap['verification']): EmailTemplate {
  const html = wrapEmailContent(`
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h1 style="${emailStyles.heading}">${data.appName}</h1>
      </div>
      
      <div style="${emailStyles.content}">
        <h2 style="${emailStyles.heading}">Verify Your Email</h2>
        <p style="${emailStyles.paragraph}">
          Hello ${data.name},
        </p>
        <p style="${emailStyles.paragraph}">
          Please verify your email address by clicking the button below:
        </p>
        
        ${createButton('Verify Email', data.verificationUrl)}
        
        <div style="${emailStyles.infoBox}">
          <p style="${emailStyles.paragraph}">
            This link will expire in ${data.expiryHours} hours.
          </p>
        </div>
        
        <p style="${emailStyles.paragraph}">
          If you didn't request this verification, you can safely ignore this email.
        </p>
      </div>
      
      <div style="${emailStyles.footer}">
        <p>This is an automated message from ${data.appName}. Please do not reply.</p>
      </div>
    </div>
  `)

  const text = `
    Hello ${data.name},

    Please verify your email address by clicking the link below:

    ${data.verificationUrl}

    This link will expire in ${data.expiryHours} hours.

    If you didn't request this verification, you can safely ignore this email.

    This is an automated message from ${data.appName}. Please do not reply.
  `.trim()

  return { html, text }
}

/**
 * Two-factor authentication email template
 */
function create2FAEmail(data: TemplateDataMap['2fa']): EmailTemplate {
  const html = wrapEmailContent(`
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h1 style="${emailStyles.heading}">${data.appName}</h1>
      </div>
      
      <div style="${emailStyles.content}">
        <h2 style="${emailStyles.heading}">Two-Factor Authentication Code</h2>
        <p style="${emailStyles.paragraph}">
          Hello ${data.name},
        </p>
        <p style="${emailStyles.paragraph}">
          Here is your two-factor authentication code:
        </p>
        
        ${createCodeBox(data.code)}
        
        <div style="${emailStyles.warningBox}">
          <p style="${emailStyles.paragraph}">
            This code will expire in ${data.expiryMinutes} minutes.
          </p>
        </div>
        
        <p style="${emailStyles.paragraph}">
          If you didn't request this code, please change your password immediately.
        </p>
      </div>
      
      <div style="${emailStyles.footer}">
        <p>This is an automated message from ${data.appName}. Please do not reply.</p>
      </div>
    </div>
  `)

  const text = `
    Hello ${data.name},

    Here is your two-factor authentication code:

    ${data.code}

    This code will expire in ${data.expiryMinutes} minutes.

    If you didn't request this code, please change your password immediately.

    This is an automated message from ${data.appName}. Please do not reply.
  `.trim()

  return { html, text }
}

/**
 * Recovery codes email template
 */
function createRecoveryEmail(data: TemplateDataMap['recovery']): EmailTemplate {
  const html = wrapEmailContent(`
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h1 style="${emailStyles.heading}">${data.appName}</h1>
      </div>
      
      <div style="${emailStyles.content}">
        <h2 style="${emailStyles.heading}">Your Recovery Codes</h2>
        <p style="${emailStyles.paragraph}">
          Hello ${data.name},
        </p>
        <p style="${emailStyles.paragraph}">
          Here are your recovery codes. Keep them in a safe place:
        </p>
        
        <div style="${emailStyles.codeBox}">
          ${data.codes.join('<br />')}
        </div>
        
        <div style="${emailStyles.warningBox}">
          <p style="${emailStyles.paragraph}">
            Recovery codes generated on: ${data.setupDate}
          </p>
          <p style="${emailStyles.paragraph}">
            Each code can only be used once. Keep these codes safe and accessible.
          </p>
        </div>
      </div>
      
      <div style="${emailStyles.footer}">
        <p>This is an automated message from ${data.appName}. Please do not reply.</p>
      </div>
    </div>
  `)

  const text = `
    Hello ${data.name},

    Here are your recovery codes. Keep them in a safe place:

    ${data.codes.join('\n')}

    Recovery codes generated on: ${data.setupDate}
    Each code can only be used once. Keep these codes safe and accessible.

    This is an automated message from ${data.appName}. Please do not reply.
  `.trim()

  return { html, text }
}

/**
 * Template map
 */
const templates: Record<EmailTemplateType, Function> = {
  verification: createVerificationEmail,
  '2fa': create2FAEmail,
  recovery: createRecoveryEmail,
  reset: () => ({ html: '', text: '' }), // TODO: Implement
  welcome: () => ({ html: '', text: '' }) // TODO: Implement
}

/**
 * Generate email template
 */
export function generateEmailTemplate<T extends EmailTemplateType>(
  type: T,
  data: TemplateDataMap[T]
): EmailTemplate {
  const template = templates[type]
  if (!template) {
    throw new Error(`Template "${type}" not found`)
  }
  return template(data)
}

export type { EmailTemplate, EmailTemplateType }