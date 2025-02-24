declare module 'alerts' {
  export type Severity = 'critical' | 'warning' | 'info'
  export type AlertChannel = 'email' | 'slack' | 'webhook'

  export interface AlertConfig {
    threshold: number
    channels: AlertChannel[]
    cooldown: number
  }

  export interface AlertsConfig {
    critical: AlertConfig
    warning: AlertConfig
    info: AlertConfig
  }

  export interface EmailConfig {
    from: string
    to: string[]
    smtp: {
      host: string
      port: number
      secure: boolean
      auth: {
        user: string
        pass: string
      }
    }
  }

  export interface SlackConfig {
    token: string
    channel: string
  }

  export interface WebhookConfig {
    url: string
  }

  export interface Config {
    alerts: AlertsConfig
    email: EmailConfig
    slack: SlackConfig
    webhook: WebhookConfig
  }

  export interface AlertState {
    lastAlerts: Record<string, number>
    muted: Record<string, boolean | number>
  }

  export interface MetricData {
    current: number
    baseline: number
    metric: string
    recommendation?: string
    url?: string
  }

  export interface BenchmarkResults {
    [benchmark: string]: {
      [metric: string]: MetricData
    }
  }
}

declare module '@slack/web-api' {
  export class WebClient {
    constructor(token: string)
    chat: {
      postMessage(params: {
        channel: string
        attachments?: Array<{
          color?: string
          text?: string
          footer?: string
        }>
      }): Promise<any>
    }
  }
}

declare module 'nodemailer' {
  interface TransportOptions {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
  }

  interface MailOptions {
    from: string
    to: string
    subject: string
    html?: string
    text?: string
  }

  interface Transporter {
    sendMail(options: MailOptions): Promise<any>
  }

  export function createTransport(options: TransportOptions): Transporter
}