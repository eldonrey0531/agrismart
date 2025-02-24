import { emailConfig } from '../config/email';

const { colors, logo } = emailConfig.branding;

interface EmailTemplateProps {
  preheaderText: string;
  content: string;
}

// Base email layout template
const baseEmailTemplate = ({ preheaderText, content }: EmailTemplateProps): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${emailConfig.from.name}</title>
  <span style="display: none !important; visibility: hidden; mso-hide: all; font-size: 1px; color: #ffffff; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">${preheaderText}</span>
</head>
<body style="
  background-color: ${colors.background};
  color: ${colors.text};
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
">
  <div style="
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  ">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px;">
      <img 
        src="${logo.url}" 
        alt="${emailConfig.from.name} Logo" 
        style="max-width: ${logo.width}; height: auto;"
      />
    </div>

    <!-- Content -->
    ${content}

    <!-- Footer -->
    <div style="
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #666;
      font-size: 12px;
      text-align: center;
    ">
      <p>
        © ${new Date().getFullYear()} ${emailConfig.footer.companyName}. All rights reserved.
      </p>
      <p>
        ${emailConfig.footer.address}
      </p>
      <p>
        Need help? Contact us at 
        <a href="mailto:${emailConfig.footer.supportEmail}" style="color: ${colors.primary};">
          ${emailConfig.footer.supportEmail}
        </a>
      </p>
      <div style="margin-top: 20px;">
        ${Object.entries(emailConfig.footer.socialMedia)
          .map(([platform, url]) => `
            <a href="${url}" style="
              display: inline-block;
              margin: 0 10px;
              color: ${colors.primary};
              text-decoration: none;
            ">
              ${platform.charAt(0).toUpperCase() + platform.slice(1)}
            </a>
          `).join('')}
      </div>
    </div>
  </div>
</body>
</html>
`;

interface ButtonProps {
  text: string;
  url: string;
}

const button = ({ text, url }: ButtonProps): string => `
  <a 
    href="${url}" 
    style="
      display: inline-block;
      background-color: ${colors.primary};
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    "
  >
    ${text}
  </a>
`;

// Email-specific templates
export const verificationEmail = (name: string, verificationUrl: string): string => {
  const content = `
    <h1 style="color: ${colors.secondary};">Welcome to ${emailConfig.from.name}!</h1>
    <p>Hi ${name},</p>
    <p>Please verify your email address by clicking the button below:</p>
    ${button({ text: emailConfig.templates.verification.buttonText, url: verificationUrl })}
    <p>Or copy and paste this link in your browser:</p>
    <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
    <p>This link will expire in 24 hours.</p>
    <p>If you didn't create an account, you can safely ignore this email.</p>
  `;

  return baseEmailTemplate({
    preheaderText: "Welcome to AgriSmart! Please verify your email address.",
    content,
  });
};

export const passwordResetEmail = (name: string, resetUrl: string): string => {
  const content = `
    <h1 style="color: ${colors.secondary};">Reset Your Password</h1>
    <p>Hi ${name},</p>
    <p>You requested to reset your password. Click the button below to set a new password:</p>
    ${button({ text: emailConfig.templates.passwordReset.buttonText, url: resetUrl })}
    <p>Or copy and paste this link in your browser:</p>
    <p style="color: #666; word-break: break-all;">${resetUrl}</p>
    <p>This link will expire in 24 hours.</p>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <div style="
      margin-top: 20px;
      padding: 15px;
      background-color: #FEF2F2;
      border-radius: 5px;
      color: ${colors.accent};
    ">
      For security reasons, never share this link with anyone.
      ${emailConfig.from.name} will never ask for your password via email.
    </div>
  `;

  return baseEmailTemplate({
    preheaderText: "You requested to reset your password.",
    content,
  });
};

export const passwordChangedEmail = (name: string): string => {
  const content = `
    <h1 style="color: ${colors.secondary};">Password Changed Successfully</h1>
    <p>Hi ${name},</p>
    <p>Your password has been changed successfully.</p>
    <div style="
      margin-top: 20px;
      padding: 15px;
      background-color: #FEF2F2;
      border-radius: 5px;
      color: ${colors.accent};
      font-weight: bold;
    ">
      If you didn't make this change, please contact support immediately.
    </div>
  `;

  return baseEmailTemplate({
    preheaderText: "Your password has been changed successfully.",
    content,
  });
};