interface SendPasswordResetEmailParams {
  email: string;
  name: string;
  token: string;
}

export async function sendPasswordResetEmail({
  email,
  name,
  token,
}: SendPasswordResetEmailParams): Promise<void> {
  // Get the app URL from environment variables
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Create reset URL
  const resetUrl = `${appUrl}/reset-password/${token}`;

  // Email content
  const emailContent = {
    subject: 'Reset Your Password - AgriSmart',
    text: `Hi ${name},\n\nYou requested to reset your password. Click the following link to set a new password: ${resetUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't request this, you can safely ignore this email.`,
    html: `
      <div>
        <h1>Reset Your Password</h1>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <a 
          href="${resetUrl}" 
          style="
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          "
        >
          Reset Password
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <hr />
        <p style="color: #666; font-size: 0.8em;">
          For security reasons, never share this link with anyone.
          AgriSmart will never ask for your password via email.
        </p>
      </div>
    `,
  };

  // TODO: Implement email sending with your preferred service
  // For now, we'll just log it for development
  if (process.env.NODE_ENV === 'development') {
    console.log('=== Password Reset Email ===');
    console.log('To:', email);
    console.log('Subject:', emailContent.subject);
    console.log('Reset URL:', resetUrl);
    return;
  }

  // Example implementation with SendGrid
  // if (process.env.SENDGRID_API_KEY) {
  //   const sgMail = require('@sendgrid/mail');
  //   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  //   
  //   await sgMail.send({
  //     to: email,
  //     from: process.env.EMAIL_FROM,
  //     subject: emailContent.subject,
  //     text: emailContent.text,
  //     html: emailContent.html,
  //   });
  // }

  // Example implementation with NodeMailer
  // const transporter = nodemailer.createTransport({
  //   host: process.env.EMAIL_SERVER_HOST,
  //   port: process.env.EMAIL_SERVER_PORT,
  //   auth: {
  //     user: process.env.EMAIL_SERVER_USER,
  //     pass: process.env.EMAIL_SERVER_PASSWORD,
  //   },
  // });
  // 
  // await transporter.sendMail({
  //   from: process.env.EMAIL_FROM,
  //   to: email,
  //   subject: emailContent.subject,
  //   text: emailContent.text,
  //   html: emailContent.html,
  // });

  throw new Error('Email service not configured');
}