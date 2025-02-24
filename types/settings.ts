/**
 * User theme preferences
 */
export type Theme = 'light' | 'dark' | 'system'

/**
 * Available languages for the application
 */
export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'zh'

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  email: boolean
  push: boolean
  inApp: boolean
}

/**
 * Privacy settings
 */
export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts'
  activityVisibility: 'public' | 'private' | 'contacts'
  showOnlineStatus: boolean
}

/**
 * User interface preferences
 */
export interface UIPreferences {
  theme: Theme
  fontSize: 'small' | 'medium' | 'large'
  reducedMotion: boolean
  highContrast: boolean
}

/**
 * Complete user settings object
 */
export interface UserSettings {
  // Display preferences
  theme: Theme
  language: Language
  
  // Notifications
  notifications: NotificationPreferences
  
  // Privacy
  privacy: PrivacySettings
  
  // UI preferences
  ui: UIPreferences
  
  // Feature flags and preferences
  features: {
    betaFeatures: boolean
    experimentalFeatures: boolean
  }
  
  // Customization
  customization: {
    accentColor?: string
    avatar?: string
    banner?: string
  }
  
  // Last updated timestamp
  updatedAt: Date
}

/**
 * Settings update payload (partial update allowed)
 */
export type UpdateSettingsPayload = Partial<UserSettings>

/**
 * Default settings
 */
export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    inApp: true
  },
  privacy: {
    profileVisibility: 'public',
    activityVisibility: 'contacts',
    showOnlineStatus: true
  },
  ui: {
    theme: 'system',
    fontSize: 'medium',
    reducedMotion: false,
    highContrast: false
  },
  features: {
    betaFeatures: false,
    experimentalFeatures: false
  },
  customization: {},
  updatedAt: new Date()
}

/**
 * Validation helpers
 */
export const isValidTheme = (theme: unknown): theme is Theme => {
  return typeof theme === 'string' && ['light', 'dark', 'system'].includes(theme)
}

export const isValidLanguage = (lang: unknown): lang is Language => {
  return typeof lang === 'string' && ['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh'].includes(lang)
}

export const isValidNotificationPreferences = (prefs: unknown): prefs is NotificationPreferences => {
  if (typeof prefs !== 'object' || !prefs) return false
  const { email, push, inApp } = prefs as NotificationPreferences
  return typeof email === 'boolean' &&
         typeof push === 'boolean' &&
         typeof inApp === 'boolean'
}

export const isValidPrivacySettings = (settings: unknown): settings is PrivacySettings => {
  if (typeof settings !== 'object' || !settings) return false
  const { profileVisibility, activityVisibility, showOnlineStatus } = settings as PrivacySettings
  return ['public', 'private', 'contacts'].includes(profileVisibility) &&
         ['public', 'private', 'contacts'].includes(activityVisibility) &&
         typeof showOnlineStatus === 'boolean'
}