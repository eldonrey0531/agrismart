import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import type { ProfileFormData } from '@/lib/validations/profile'

interface ProfileData {
  id: string
  name: string
  email: string
  role: string
  lastPasswordChange?: Date
  profile: {
    bio?: string
    location?: string
    website?: string
    company?: string
    title?: string
    twitter?: string
    github?: string
    linkedin?: string
  } | null
}

interface SecurityUpdateData {
  currentPassword: string
  newPassword: string
}

export function useProfile() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<ProfileData | null>(null)

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile')
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }
      const result = await response.json()
      setData(result.user)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'))
    } finally {
      setLoading(false)
    }
  }

  // Update profile data
  const updateProfile = async (formData: Partial<ProfileFormData>) => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const result = await response.json()
      setData(result.user)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update profile'))
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update security settings
  const updateSecurity = async (data: SecurityUpdateData) => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile/security', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to update security settings')
      }

      const result = await response.json()
      setData(prev => prev ? { ...prev, lastPasswordChange: new Date() } : null)
      return result
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update security settings'))
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Fetch profile on mount if logged in
  useEffect(() => {
    if (session) {
      fetchProfile()
    }
  }, [session])

  return {
    loading,
    error,
    data,
    updateProfile,
    updateSecurity,
    refresh: fetchProfile
  }
}