import { NextResponse } from 'next/server'
import { createRouteHandlers, type ProtectedApiHandler } from '@/lib/auth/api-guard'
import { models } from '@/server/models'

interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
  language: string
}

// Get user settings
const getSettings: ProtectedApiHandler = async (req, auth) => {
  try {
    const settings = await models.User.findById(auth.userId)
      .select('settings')
      .lean()

    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// Update user settings
const updateSettings: ProtectedApiHandler = async (req, auth) => {
  try {
    const body = await req.json() as UserSettings

    // Validate settings
    if (!isValidSettings(body)) {
      return NextResponse.json(
        { error: 'Invalid settings data' },
        { status: 400 }
      )
    }

    // Update settings
    const updatedUser = await models.User.findByIdAndUpdate(
      auth.userId,
      { $set: { settings: body } },
      { new: true }
    ).select('settings').lean()

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

// Validate settings object
function isValidSettings(settings: any): settings is UserSettings {
  return (
    settings &&
    typeof settings === 'object' &&
    ['light', 'dark', 'system'].includes(settings.theme) &&
    typeof settings.notifications === 'boolean' &&
    typeof settings.language === 'string' &&
    settings.language.length >= 2
  )
}

// Create protected route handlers
export const { GET, PUT } = createRouteHandlers({
  GET: getSettings,
  PUT: updateSettings
})

// Example usage:
/*
// GET /api/user/settings
const response = await fetch('/api/user/settings')
const settings = await response.json()

// PUT /api/user/settings
const response = await fetch('/api/user/settings', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    theme: 'dark',
    notifications: true,
    language: 'en'
  })
})
const updated = await response.json()
*/