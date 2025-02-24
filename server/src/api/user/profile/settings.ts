import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlers, type ProtectedApiHandler } from '@/lib/auth/api-guard'
import { models } from '@/server/models'

// GET user settings
const getSettings: ProtectedApiHandler = async (req, auth) => {
  try {
    const user = await models.User.findById(auth.userId)
      .select('settings notifications preferences')
      .lean()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// PUT update user settings
const updateSettings: ProtectedApiHandler = async (req, auth) => {
  try {
    const body = await req.json()

    // Validate request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Update user settings
    const updatedUser = await models.User.findByIdAndUpdate(
      auth.userId,
      {
        $set: {
          settings: body.settings,
          notifications: body.notifications,
          preferences: body.preferences
        }
      },
      { new: true }
    ).select('settings notifications preferences').lean()

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user settings:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// Create protected route handlers
const handlers = createRouteHandlers({
  GET: getSettings,
  PUT: updateSettings
})

// Export the handlers
export const { GET, PUT } = handlers