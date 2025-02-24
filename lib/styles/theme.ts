export const themeConfig = {
  light: {
    colors: {
      // Light theme colors that complement the dark theme
      background: '#F8FAF9',
      surface: '#FFFFFF',
      primary: '#2C5F2D',
      accent: '#97BF04',
      interactive: '#2C5F2D',
      success: '#238636',
      border: '#E2E8E5',
      mutedText: '#64748B',
      darkText: '#1E293B',
      lightText: '#334155',
      primaryBorder: '#CBD5E1',
      secondaryBorder: '#E2E8F0',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #F1F5F3 0%, #E2EAE6 100%)',
      secondary: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAF9 100%)',
      accent: 'linear-gradient(135deg, #2C5F2D 0%, #3B7F3C 100%)',
      text: 'linear-gradient(180deg, #1E293B 0%, #334155 100%)',
      mist: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    }
  },
  dark: {
    colors: {
      // Green Mist UI dark theme
      background: '#0A0F14',
      surface: '#131920',
      primary: '#2C5F2D',
      accent: '#97BF04',
      interactive: '#FFB800',
      success: '#238636',
      border: '#3E5732',
      mutedText: '#8B949E',
      darkText: '#2B2B2B',
      lightText: '#EDEDED',
      primaryBorder: '#3E5732',
      secondaryBorder: '#2C4824',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #2C5F2D 0%, #3A7D3A 100%)',
      secondary: 'linear-gradient(180deg, rgba(19, 25, 32, 0.95) 0%, rgba(10, 15, 20, 0.95) 100%)',
      accent: 'linear-gradient(135deg, #97BF04 0%, #AFC726 100%)',
      text: 'linear-gradient(180deg, #EDEDED 0%, #D1D5DB 100%)',
      mist: 'linear-gradient(180deg, rgba(44, 95, 45, 0.1) 0%, rgba(44, 95, 45, 0.05) 100%)',
    },
    effects: {
      mistOverlay: {
        background: 'linear-gradient(180deg, rgba(44, 95, 45, 0.05) 0%, rgba(44, 95, 45, 0.02) 100%)',
        filter: 'blur(20px)',
      },
      glowHighlight: {
        boxShadow: '0 0 20px rgba(151, 191, 4, 0.15)',
      },
      depthShadow: {
        boxShadow: '0 4px 12px rgba(10, 15, 20, 0.5)',
      },
    }
  }
};

export const typography = {
  fontFamilies: {
    heading: 'Inter, sans-serif',
    body: 'system-ui, -apple-system, sans-serif',
  },
  fontWeights: {
    heading: 600,
    body: 400,
  },
  lineHeights: {
    heading: {
      sm: '1.2',
      md: '1.3',
      lg: '1.5',
    },
    body: {
      normal: '1.5',
      relaxed: '1.7',
    },
    compact: {
      sm: '1.2',
      md: '1.3',
    },
  },
  fontSize: {
    mobile: {
      min: '16px',
      max: '46px',
    },
    desktop: {
      min: '16px',
      max: '60px',
    },
  },
};

export const spacing = {
  base: '8px',
  scale: {
    1: '8px',
    2: '16px',
    3: '24px',
    4: '32px',
    5: '40px',
    6: '48px',
    7: '56px',
    8: '64px',
  },
  section: {
    min: '80px', // Reduced for layered depth effect
  },
};

export const animations = {
  durations: {
    fast: '150ms',
    default: '200ms',
    slow: '300ms',
    float: '3000ms',
  },
  timingFunctions: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.6, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  float: {
    keyframes: `
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    `,
    animation: '3000ms cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  mistFlow: {
    keyframes: `
      0% { opacity: 0.5; transform: translateY(0) scale(1); }
      50% { opacity: 0.7; transform: translateY(-15px) scale(1.02); }
      100% { opacity: 0.5; transform: translateY(0) scale(1); }
    `,
    animation: '4000ms cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
};