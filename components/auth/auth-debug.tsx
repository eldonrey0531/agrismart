'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePathname } from 'next/navigation';

export function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState({
    pathname: '',
    timestamp: ''
  });
  const pathname = usePathname();

  useEffect(() => {
    setDebugInfo({
      pathname,
      timestamp: new Date().toISOString()
    });
  }, [pathname]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert>
        <AlertDescription>
          <div className="font-mono text-xs">
            <div>Path: {debugInfo.pathname}</div>
            <div>Time: {debugInfo.timestamp}</div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}