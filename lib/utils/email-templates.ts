interface TemplateData {
  name: string
  appName: string
  [key: string]: any
}

interface EmailTemplate {
  html: string
  text: string
}

type TemplateName = 'verification' | 'reset' | 'welcome' | '2fa' | 'recovery'

/**
 * Generate styled email template
 */
function generateStyledHtml(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            color: #333333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #f8f9fa;
          }
          .content {
            padding: 20px;
            background-color: #ffffff;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6c757d;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${content}
        </div>
      </body>
    </html>
  `
}

/**
 * Generate verification email template
 */
function verificationTemplate(data: TemplateData): EmailTemplate {
  const html = generateStyledHtml(`
    <div class="header">
      <h1>${data.appName}</h1>
    </div>
    <div class="content">
      <h2>Hello ${data.name}!</h2>
      <p>Please verify your email address by clicking the button below:</p>
      <div style="text-align: center;">
        <a href="${data.verificationUrl}" class="button">
          Verify Email
        </a>
      </div>
      <p>This link will expire in ${data.expiryHours} hours.</p>
      <p>If you didn't request this verification, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>This is an automated message from ${data.appName}. Please do not reply.</p>
    </div>
  `)

  const text = `
Hello ${data.name}!

Please verify your email address by clicking the link below:

${data.verificationUrl}

This link will expire in ${data.expiryHours} hours.

If you didn't request this verification, please ignore this email.

This is an automated message from ${data.appName}. Please do not reply.
  `.trim()

  return { html, text }
}

/**
 * Generate password reset email template
 */
function resetTemplate(data: TemplateData): EmailTemplate {
  const html = generateStyledHtml(`
    <div class="header">
      <h1>${data.appName}</h1>
    </div>
    <div class="content">
      <h2>Hello ${data.name}!</h2>
      <p>We received a request to reset your password. Click the button below to reset it:</p>
      <div style="text-align: center;">
        <a href="${data.resetUrl}" class="button">
          Reset Password
        </a>
      </div>
      <p>This link will expire in ${data.expiryHours} hours.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>This is an automated message from ${data.appName}. Please do not reply.</p>
    </div>
  `)

  const text = `
Hello ${data.name}!

We received a request to reset your password. Click the link below to reset it:

${data.resetUrl}

This link will expire in ${data.expiryHours} hours.

If you didn't request this password reset, please ignore this email.

This is an automated message from ${data.appName}. Please do not reply.
  `.trim()

  return { html, text }
}

// Template mapping
const templates: Record<TemplateName, (data: TemplateData) => EmailTemplate> = {
  verification: verificationTemplate,
  reset: resetTemplate,
  welcome: (data) => ({ html: '', text: '' }), // TODO: Implement
  '2fa': (data) => ({ html: '', text: '' }), // TODO: Implement
  recovery: (data) => ({ html: '', text: '' }) // TODO: Implement
}

/**
 * Generate email template
 */
export function generateEmailTemplate(
  template: TemplateName,
  data: TemplateData
): EmailTemplate {
  const templateFn = templates[template]
  if (!templateFn) {
    throw new Error(`Template "${template}" not found`)
  }
  return templateFn(data)
}