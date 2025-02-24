interface EmailConfig {
  from: {
    email: string;
    name: string;
  };
  templates: {
    verification: {
      subject: string;
      buttonText: string;
    };
    passwordReset: {
      subject: string;
      buttonText: string;
    };
    passwordChanged: {
      subject: string;
    };
  };
  branding: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      text: string;
      background: string;
    };
    logo: {
      url: string;
      width: string;
    };
  };
  footer: {
    companyName: string;
    supportEmail: string;
    address: string;
    socialMedia: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
  };
}

export const emailConfig: EmailConfig = {
  from: {
    email: process.env.EMAIL_FROM || 'noreply@agrismart.com',
    name: process.env.EMAIL_FROM_NAME || 'AgriSmart',
  },
  templates: {
    verification: {
      subject: 'Verify Your Email - AgriSmart',
      buttonText: 'Verify Email',
    },
    passwordReset: {
      subject: 'Reset Your Password - AgriSmart',
      buttonText: 'Reset Password',
    },
    passwordChanged: {
      subject: 'Password Changed Successfully - AgriSmart',
    },
  },
  branding: {
    colors: {
      primary: '#4CAF50',
      secondary: '#2F855A',
      accent: '#DC2626',
      text: '#1A202C',
      background: '#FFFFFF',
    },
    logo: {
      url: '/images/logo.png',
      width: '200px',
    },
  },
  footer: {
    companyName: 'AgriSmart',
    supportEmail: 'support@agrismart.com',
    address: '123 Agriculture Street, Digital City, 1234',
    socialMedia: {
      facebook: 'https://facebook.com/agrismart',
      twitter: 'https://twitter.com/agrismart',
      instagram: 'https://instagram.com/agrismart',
      linkedin: 'https://linkedin.com/company/agrismart',
    },
  },
};