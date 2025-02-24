interface GeoLocation {
  country: string;
  city?: string;
  region?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

interface GeoCache {
  [ip: string]: {
    data: GeoLocation;
    expires: number;
  };
}

// In-memory cache for geo lookups
const geoCache: GeoCache = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getLocationFromIp(ip: string): Promise<GeoLocation | null> {
  // Don't lookup private/local IPs
  if (isPrivateIP(ip) || ip === 'unknown') {
    return null;
  }

  // Check cache first
  const now = Date.now();
  const cached = geoCache[ip];
  if (cached && cached.expires > now) {
    return cached.data;
  }

  try {
    // Using ipapi.co service (free tier, 1000 requests/day)
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

    if (data.error) {
      console.error('GeoIP lookup error:', data.error);
      return null;
    }

    const location: GeoLocation = {
      country: data.country_name,
      city: data.city,
      region: data.region,
      timezone: data.timezone,
      latitude: data.latitude,
      longitude: data.longitude,
    };

    // Cache the result
    geoCache[ip] = {
      data: location,
      expires: now + CACHE_DURATION,
    };

    return location;
  } catch (error) {
    console.error('GeoIP lookup failed:', error);
    return null;
  }
}

function isPrivateIP(ip: string): boolean {
  // Check if IP is private/local
  return (
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('192.168.') ||
    ip === '127.0.0.1' ||
    ip === 'localhost'
  );
}

// Helper to format location string
export function formatLocation(location: GeoLocation | null): string {
  if (!location) return 'Unknown';
  
  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.region) parts.push(location.region);
  if (location.country) parts.push(location.country);
  
  return parts.join(', ');
}

// Clean expired entries from cache periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    Object.keys(geoCache).forEach(ip => {
      if (geoCache[ip].expires <= now) {
        delete geoCache[ip];
      }
    });
  }, CACHE_DURATION);
}