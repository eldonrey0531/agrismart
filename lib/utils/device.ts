interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown';
  browser: string;
  os: string;
  device: string;
}

export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase();

  // Initialize default response
  const info: DeviceInfo = {
    type: 'unknown',
    browser: 'unknown',
    os: 'unknown',
    device: 'unknown'
  };

  // Detect device type
  if (/bot|crawler|spider|crawling/i.test(ua)) {
    info.type = 'bot';
  } else if (
    /mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|webos|windows phone|iemobile|symbian/i.test(
      ua
    )
  ) {
    info.type = 'mobile';
  } else if (/ipad|tablet|playbook|silk/i.test(ua)) {
    info.type = 'tablet';
  } else if (/desktop|windows|macintosh|linux/i.test(ua)) {
    info.type = 'desktop';
  }

  // Detect browser
  if (ua.includes('firefox')) {
    info.browser = 'Firefox';
  } else if (ua.includes('edg')) {
    info.browser = 'Edge';
  } else if (ua.includes('chrome')) {
    info.browser = 'Chrome';
  } else if (ua.includes('safari')) {
    info.browser = 'Safari';
  } else if (ua.includes('opera') || ua.includes('opr')) {
    info.browser = 'Opera';
  } else if (ua.includes('msie') || ua.includes('trident')) {
    info.browser = 'Internet Explorer';
  }

  // Detect OS
  if (ua.includes('windows')) {
    info.os = 'Windows';
  } else if (ua.includes('macintosh') || ua.includes('mac os')) {
    info.os = 'macOS';
  } else if (ua.includes('linux')) {
    info.os = 'Linux';
  } else if (ua.includes('android')) {
    info.os = 'Android';
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    info.os = 'iOS';
  }

  // Detect specific device models
  if (ua.includes('iphone')) {
    info.device = 'iPhone';
  } else if (ua.includes('ipad')) {
    info.device = 'iPad';
  } else if (ua.includes('pixel')) {
    info.device = 'Google Pixel';
  } else if (ua.includes('samsung')) {
    info.device = 'Samsung';
  } else {
    info.device = info.type === 'desktop' ? 'Computer' : 'Unknown Device';
  }

  return info;
}

export function formatDeviceInfo(info: DeviceInfo): string {
  if (info.type === 'bot') {
    return 'Bot/Crawler';
  }

  const parts = [];
  
  if (info.device !== 'unknown') {
    parts.push(info.device);
  }
  
  if (info.browser !== 'unknown') {
    parts.push(info.browser);
  }
  
  if (info.os !== 'unknown' && info.device !== info.os) {
    parts.push(info.os);
  }

  return parts.length ? parts.join(' - ') : 'Unknown Device';
}

// Cache for device fingerprints
const deviceCache: Map<string, { fingerprint: string; timestamp: number }> = new Map();

export function generateDeviceFingerprint(userAgent: string, ip: string): string {
  const cacheKey = `${userAgent}|${ip}`;
  const now = Date.now();
  const cached = deviceCache.get(cacheKey);

  if (cached && now - cached.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
    return cached.fingerprint;
  }

  const info = parseUserAgent(userAgent);
  const fingerprint = btoa(JSON.stringify({
    ...info,
    timestamp: now,
    hash: Math.random().toString(36).substring(7)
  }));

  deviceCache.set(cacheKey, { fingerprint, timestamp: now });
  return fingerprint;
}

// Clean cache periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    Array.from(deviceCache.entries()).forEach(([key, value]) => {
      if (now - value.timestamp > 24 * 60 * 60 * 1000) {
        deviceCache.delete(key);
      }
    });
  }, 60 * 60 * 1000); // Clean every hour
}