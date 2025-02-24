interface SendVerificationEmailParams {
  email: string;
  token: string;
}

export async function sendVerificationEmail({
  email,
  token,
}: SendVerificationEmailParams): Promise<void> {
  // Get the app URL from environment variables
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Create verification URL
  const verificationUrl = `${appUrl}/verify-email?token=${token}`;

  // Email content
  const emailContent = {
    subject: 'Verify Your Email - AgriSmart',
    text: `Please verify your email address by clicking the following link: ${verificationUrl}`,
    html: `
      <div>
        <h1>Welcome to AgriSmart!</h1>
        <p>Please verify your email address by clicking the button below:</p>
        <a 
          href="${verificationUrl}" 
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
          Verify Email
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  };

  // TODO: Implement email sending with your preferred service
  // For now, we'll just log it for development
  if (process.env.NODE_ENV === 'development') {
    console.log('=== Verification Email ===');
    console.log('To:', email);
    console.log('Subject:', emailContent.subject);
    console.log('Verification URL:', verificationUrl);
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