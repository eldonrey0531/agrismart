import { useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UserSettings, UpdateSettingsPayload } from '@/types/settings'
import { DEFAULT_SETTINGS } from '@/types/settings'

const SETTINGS_QUERY_KEY = ['user', 'settings']

/**
 * Fetch user settings from API
 */
async function fetchSettings(): Promise<UserSettings> {
  const response = await fetch('/api/user/settings')
  if (!response.ok) {
    throw new Error('Failed to fetch settings')
  }
  return response.json()
}

/**
 * Update user settings via API
 */
async function updateSettings(payload: UpdateSettingsPayload): Promise<UserSettings> {
  const response = await fetch('/api/user/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    throw new Error('Failed to update settings')
  }
  return response.json()
}

/**
 * React hook for managing user settings
 */
export function useSettings() {
  const queryClient = useQueryClient()
  const [error, setError] = useState<Error | null>(null)

  // Fetch settings query
  const { 
    data: settings = DEFAULT_SETTINGS,
    isLoading,
    isError,
    error: queryError
  } = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: fetchSettings
  })

  // Update settings mutation
  const {
    mutate: saveSettings,
    isLoading: isSaving
  } = useMutation({
    mutationFn: updateSettings,
    onSuccess: (newSettings) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEY, newSettings)
      setError(null)
    },
    onError: (error: Error) => {
      setError(error)
    }
  })

  // Theme helpers
  const setTheme = useCallback((theme: UserSettings['theme']) => {
    saveSettings({ theme })
  }, [saveSettings])

  // Language helpers
  const setLanguage = useCallback((language: UserSettings['language']) => {
    saveSettings({ language })
  }, [saveSettings])

  // Notification helpers
  const updateNotifications = useCallback((
    notifications: Partial<UserSettings['notifications']>
  ) => {
    saveSettings({
      notifications: {
        ...settings.notifications,
        ...notifications
      }
    })
  }, [settings, saveSettings])

  // Privacy helpers
  const updatePrivacy = useCallback((
    privacy: Partial<UserSettings['privacy']>
  ) => {
    saveSettings({
      privacy: {
        ...settings.privacy,
        ...privacy
      }
    })
  }, [settings, saveSettings])

  // UI preference helpers
  const updateUIPreferences = useCallback((
    ui: Partial<UserSettings['ui']>
  ) => {
    saveSettings({
      ui: {
        ...settings.ui,
        ...ui
      }
    })
  }, [settings, saveSettings])

  // Feature flag helpers
  const toggleFeature = useCallback((
    feature: keyof UserSettings['features']
  ) => {
    saveSettings({
      features: {
        ...settings.features,
        [feature]: !settings.features[feature]
      }
    })
  }, [settings, saveSettings])

  return {
    // Data
    settings,
    error: error || queryError,
    
    // Status
    isLoading,
    isError,
    isSaving,

    // Update methods
    saveSettings,
    setTheme,
    setLanguage,
    updateNotifications,
    updatePrivacy,
    updateUIPreferences,
    toggleFeature,
    
    // Reset helper
    resetSettings: () => saveSettings(DEFAULT_SETTINGS)
  }
}