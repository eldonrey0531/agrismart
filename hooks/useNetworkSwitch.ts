import { useState, useCallback, useEffect } from 'react';
import { ContextPriority } from '../shared/types/context-switch';
import { useContextSwitch } from './useContextSwitch';

interface NetworkState {
  online: boolean;
  type: 'wifi' | '4g' | '3g' | '2g' | 'slow-2g' | 'none';
  effectiveType: 'fast' | 'medium' | 'slow';
  downlink: number;
  downlinkMax: number;
  rtt: number;
  saveData: boolean;
}

interface NetworkMetrics {
  bandwidth: number;
  latency: number;
  reliability: number;
  stability: number;
}

const DEFAULT_NETWORK_STATE: NetworkState = {
  online: true,
  type: 'wifi',
  effectiveType: 'fast',
  downlink: 10,
  downlinkMax: 10,
  rtt: 50,
  saveData: false
};

export function useNetworkSwitch() {
  const [networkState, setNetworkState] = useState<NetworkState>(DEFAULT_NETWORK_STATE);
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    bandwidth: 1,
    latency: 1,
    reliability: 1,
    stability: 1
  });
  
  const { switchContext } = useContextSwitch('notification');

  // Calculate network quality score (0-1)
  const calculateNetworkScore = useCallback((state: NetworkState): number => {
    const scores = {
      type: state.type === 'wifi' ? 1 : 
            state.type === '4g' ? 0.8 :
            state.type === '3g' ? 0.6 :
            state.type === '2g' ? 0.3 : 0.1,
      speed: Math.min(state.downlink / 10, 1),
      latency: Math.max(0, 1 - (state.rtt / 1000)),
      online: state.online ? 1 : 0
    };

    return (scores.type + scores.speed + scores.latency + scores.online) / 4;
  }, []);

  // Update metrics based on network state
  const updateMetrics = useCallback((state: NetworkState) => {
    setMetrics({
      bandwidth: state.downlink / state.downlinkMax,
      latency: Math.max(0, 1 - (state.rtt / 1000)),
      reliability: state.online ? 1 : 0,
      stability: state.type === 'wifi' ? 1 : 0.7
    });
  }, []);

  // Update context priority based on network conditions
  const updateContextPriority = useCallback(async (state: NetworkState) => {
    const networkScore = calculateNetworkScore(state);
    let priority = ContextPriority.HIGH;
    let options = {
      autoReconnect: true,
      keepAlive: true,
      backgroundSync: true,
      throttleInterval: 0
    };

    if (!state.online) {
      priority = ContextPriority.LOW;
      options = {
        autoReconnect: false,
        keepAlive: false,
        backgroundSync: true,
        throttleInterval: 30000 // 30 seconds
      };
    } else if (state.saveData || networkScore < 0.3) {
      priority = ContextPriority.LOW;
      options = {
        autoReconnect: true,
        keepAlive: false,
        backgroundSync: true,
        throttleInterval: 10000 // 10 seconds
      };
    } else if (networkScore < 0.7) {
      priority = ContextPriority.MEDIUM;
      options = {
        autoReconnect: true,
        keepAlive: true,
        backgroundSync: true,
        throttleInterval: 5000 // 5 seconds
      };
    }

    // Switch context based on network conditions
    if (state.online) {
      await switchContext('chat', options);
    } else {
      await switchContext('notification', {
        ...options,
        throttleInterval: 30000
      });
    }

    return priority;
  }, [calculateNetworkScore, switchContext]);

  // Network change handler
  const handleNetworkChange = useCallback(() => {
    if (!navigator.onLine) {
      const offlineState: NetworkState = {
        ...DEFAULT_NETWORK_STATE,
        online: false,
        type: 'none',
        effectiveType: 'slow'
      };
      setNetworkState(offlineState);
      updateMetrics(offlineState);
      updateContextPriority(offlineState);
      return;
    }

    // Get connection info if available
    const connection = (navigator as any).connection ||
                      (navigator as any).mozConnection ||
                      (navigator as any).webkitConnection;

    if (connection) {
      const state: NetworkState = {
        online: true,
        type: connection.type || 'wifi',
        effectiveType: getEffectiveType(connection),
        downlink: connection.downlink || 10,
        downlinkMax: connection.downlinkMax || 10,
        rtt: connection.rtt || 50,
        saveData: connection.saveData || false
      };
      setNetworkState(state);
      updateMetrics(state);
      updateContextPriority(state);
    }
  }, [updateMetrics, updateContextPriority]);

  // Initialize network monitoring
  useEffect(() => {
    handleNetworkChange();

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', handleNetworkChange);
    }

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      
      if (connection) {
        connection.removeEventListener('change', handleNetworkChange);
      }
    };
  }, [handleNetworkChange]);

  return {
    networkState,
    metrics,
    isOnline: networkState.online,
    isOffline: !networkState.online,
    isSaveData: networkState.saveData,
    connectionType: networkState.type,
    connectionQuality: networkState.effectiveType,
    networkScore: calculateNetworkScore(networkState)
  };
}

// Helper function to determine effective connection type
function getEffectiveType(connection: any): NetworkState['effectiveType'] {
  if (!connection) return 'fast';

  const { effectiveType, downlink, rtt } = connection;

  if (effectiveType === '4g' || (downlink >= 5 && rtt <= 100)) {
    return 'fast';
  } else if (effectiveType === '3g' || (downlink >= 1 && rtt <= 500)) {
    return 'medium';
  }
  return 'slow';
}

export type UseNetworkSwitchReturn = ReturnType<typeof useNetworkSwitch>;