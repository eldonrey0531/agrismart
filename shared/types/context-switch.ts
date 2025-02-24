/**
 * Context switching management for socket connections and real-time features
 */

// Priority levels for context switching
export enum ContextPriority {
  HIGH = 'high',      // Critical features like auth and payments
  MEDIUM = 'medium',  // Important features like chat
  LOW = 'low'        // Non-critical features like post updates
}

// Feature context types
export type FeatureContext = 'chat' | 'post' | 'marketplace' | 'notification';

// Context state interface
export interface ContextState {
  active: boolean;
  priority: ContextPriority;
  lastActive: Date;
  reconnectAttempts: number;
}

// Context map for feature states
export interface ContextMap {
  [key: string]: ContextState;
}

// Context switch event types
export enum ContextEvent {
  ACTIVATE = 'context:activate',
  DEACTIVATE = 'context:deactivate',
  SWITCH = 'context:switch',
  ERROR = 'context:error'
}

// Context switch configuration
export interface ContextSwitchConfig {
  maxReconnectAttempts: number;
  reconnectInterval: number;
  inactivityTimeout: number;
  backgroundPollingInterval: number;
  priorityThrottling: {
    [ContextPriority.HIGH]: number;
    [ContextPriority.MEDIUM]: number;
    [ContextPriority.LOW]: number;
  };
}

// Context switch options
export interface ContextSwitchOptions {
  autoReconnect?: boolean;
  keepAlive?: boolean;
  backgroundSync?: boolean;
  throttleInterval?: number;
}

// Context switch result
export interface ContextSwitchResult {
  success: boolean;
  previousContext?: FeatureContext;
  newContext?: FeatureContext;
  error?: Error;
  timestamp: Date;
}

// Context activity log
export interface ContextActivityLog {
  context: FeatureContext;
  action: 'activate' | 'deactivate' | 'switch' | 'error';
  timestamp: Date;
  details?: any;
}

// Context metrics
export interface ContextMetrics {
  activeTime: number;
  switchCount: number;
  errorCount: number;
  reconnectCount: number;
  lastSwitch: Date;
}