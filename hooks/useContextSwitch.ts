import { useState, useCallback, useEffect } from 'react';
import {
  ContextPriority,
  FeatureContext,
  ContextState,
  ContextMap,
  ContextEvent,
  ContextSwitchConfig,
  ContextSwitchOptions,
  ContextSwitchResult,
  ContextActivityLog
} from '../shared/types/context-switch';

const DEFAULT_CONFIG: ContextSwitchConfig = {
  maxReconnectAttempts: 3,
  reconnectInterval: 5000,
  inactivityTimeout: 300000, // 5 minutes
  backgroundPollingInterval: 60000, // 1 minute
  priorityThrottling: {
    [ContextPriority.HIGH]: 0,
    [ContextPriority.MEDIUM]: 1000,
    [ContextPriority.LOW]: 5000
  }
};

export function useContextSwitch(
  initialContext: FeatureContext,
  config: Partial<ContextSwitchConfig> = {}
) {
  const [contextMap, setContextMap] = useState<ContextMap>({});
  const [currentContext, setCurrentContext] = useState<FeatureContext>(initialContext);
  const [activityLog, setActivityLog] = useState<ContextActivityLog[]>([]);

  // Initialize configuration
  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...config
  };

  // Log context activity
  const logActivity = useCallback((
    context: FeatureContext,
    action: ContextActivityLog['action'],
    details?: any
  ) => {
    const activity: ContextActivityLog = {
      context,
      action,
      timestamp: new Date(),
      details
    };
    setActivityLog(prev => [...prev, activity]);
  }, []);

  // Activate a context
  const activateContext = useCallback((
    context: FeatureContext,
    priority: ContextPriority = ContextPriority.MEDIUM,
    options: ContextSwitchOptions = {}
  ) => {
    setContextMap(prev => ({
      ...prev,
      [context]: {
        active: true,
        priority,
        lastActive: new Date(),
        reconnectAttempts: 0
      }
    }));
    logActivity(context, 'activate', { priority, options });
  }, [logActivity]);

  // Deactivate a context
  const deactivateContext = useCallback((context: FeatureContext) => {
    setContextMap(prev => ({
      ...prev,
      [context]: {
        ...prev[context],
        active: false,
        lastActive: new Date()
      }
    }));
    logActivity(context, 'deactivate');
  }, [logActivity]);

  // Switch context with priority handling
  const switchContext = useCallback(async (
    newContext: FeatureContext,
    options: ContextSwitchOptions = {}
  ): Promise<ContextSwitchResult> => {
    try {
      const prevContext = currentContext;
      const prevState = contextMap[prevContext];
      const newState = contextMap[newContext];

      // Apply throttling based on priority
      if (newState?.priority) {
        const throttleTime = finalConfig.priorityThrottling[newState.priority];
        if (throttleTime > 0) {
          await new Promise(resolve => setTimeout(resolve, throttleTime));
        }
      }

      // Handle deactivation of current context
      if (prevContext !== newContext && prevState?.active) {
        await deactivateContext(prevContext);
      }

      // Activate new context
      await activateContext(newContext, newState?.priority || ContextPriority.MEDIUM, options);
      setCurrentContext(newContext);

      const result: ContextSwitchResult = {
        success: true,
        previousContext: prevContext,
        newContext,
        timestamp: new Date()
      };

      logActivity(newContext, 'switch', result);
      return result;
    } catch (error) {
      const result: ContextSwitchResult = {
        success: false,
        previousContext: currentContext,
        error: error as Error,
        timestamp: new Date()
      };

      logActivity(currentContext, 'error', { error });
      return result;
    }
  }, [currentContext, contextMap, finalConfig.priorityThrottling, activateContext, deactivateContext, logActivity]);

  // Get context metrics
  const getContextMetrics = useCallback((context: FeatureContext) => {
    const contextLogs = activityLog.filter(log => log.context === context);
    const activations = contextLogs.filter(log => log.action === 'activate');
    const switches = contextLogs.filter(log => log.action === 'switch');
    const errors = contextLogs.filter(log => log.action === 'error');

    const lastSwitchLog = switches[switches.length - 1];
    const lastSwitchTime = lastSwitchLog ? lastSwitchLog.timestamp : new Date();
    
    return {
      activeTime: calculateActiveTime(contextLogs),
      switchCount: switches.length,
      errorCount: errors.length,
      reconnectCount: activations.length - 1,
      lastSwitch: lastSwitchTime
    };
  }, [activityLog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.keys(contextMap).forEach(context => {
        if (contextMap[context].active) {
          deactivateContext(context as FeatureContext);
        }
      });
    };
  }, [contextMap, deactivateContext]);

  return {
    currentContext,
    contextMap,
    activityLog,
    activateContext,
    deactivateContext,
    switchContext,
    getContextMetrics
  };
}

// Helper to calculate active time
function calculateActiveTime(logs: ContextActivityLog[]): number {
  let totalTime = 0;
  let lastActivation: Date | null = null;

  for (const log of logs) {
    if (log.action === 'activate') {
      lastActivation = log.timestamp;
    } else if (log.action === 'deactivate' && lastActivation) {
      totalTime += new Date(log.timestamp).getTime() - new Date(lastActivation).getTime();
      lastActivation = null;
    }
  }

  // Add time for current activation if exists
  if (lastActivation) {
    totalTime += new Date().getTime() - new Date(lastActivation).getTime();
  }

  return totalTime;
}

export type UseContextSwitchReturn = ReturnType<typeof useContextSwitch>;