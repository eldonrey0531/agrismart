import nodemailer from "nodemailer";
import path from "path";
import fs from "fs/promises";
import handlebars from "handlebars";

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

// Email templates directory
const TEMPLATES_DIR = path.join(__dirname, "../templates/emails");

// Initialize nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Cache for compiled templates
const templateCache: Record<string, handlebars.TemplateDelegate> = {};

/**
 * Load and compile an email template
 */
async function getTemplate(templateName: string): Promise<handlebars.TemplateDelegate> {
  if (templateCache[templateName]) {
    return templateCache[templateName];
  }

  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.hbs`);
  const templateContent = await fs.readFile(templatePath, "utf-8");
  const compiledTemplate = handlebars.compile(templateContent);
  templateCache[templateName] = compiledTemplate;
  return compiledTemplate;
}

/**
 * Send an email using a template
 */
export async function sendTemplatedEmail({
  to,
  subject,
  template,
  context,
}: EmailOptions): Promise<void> {
  try {
    const compiledTemplate = await getTemplate(template);
    const html = compiledTemplate(context);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email");
  }
}

// Verification email
export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  
  await sendTemplatedEmail({
    to,
    subject: "Verify Your Email Address",
    template: "verification",
    context: {
      name,
      verificationUrl,
      expiryHours: 24,
    },
  });
}

// Password reset email
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  
  await sendTemplatedEmail({
    to,
    subject: "Reset Your Password",
    template: "password-reset",
    context: {
      name,
      resetUrl,
      expiryHours: 1,
    },
  });
}