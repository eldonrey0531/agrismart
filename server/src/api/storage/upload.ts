import { NextRequest } from 'next/server'
import { gridfs } from '@/lib/storage/gridfs'
import { FilePurpose } from '@/lib/storage/gridfs'
import { getServerSession } from 'next-auth'
import { auth } from '@/auth.config'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = {
  avatar: ['image/jpeg', 'image/png', 'image/webp'],
  listing: ['image/jpeg', 'image/png', 'image/webp'],
  document: ['application/pdf', 'image/jpeg', 'image/png'],
  chat: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(auth)
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const purpose = formData.get('purpose') as FilePurpose
    const filename = formData.get('filename') as string

    // Validation
    if (!file) {
      return new Response('No file provided', { status: 400 })
    }

    if (!purpose || !ALLOWED_FILE_TYPES[purpose]) {
      return new Response('Invalid file purpose', { status: 400 })
    }

    if (!ALLOWED_FILE_TYPES[purpose].includes(file.type)) {
      return new Response('Invalid file type', { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response('File too large', { status: 400 })
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to GridFS
    const fileId = await gridfs.uploadFile(buffer, {
      filename: filename || file.name,
      contentType: file.type,
      userId: session.user.id,
      purpose
    })

    // Get the file metadata
    const metadata = await gridfs.getFileMetadata(fileId)

    return new Response(JSON.stringify({
      success: true,
      fileId,
      metadata
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('File upload error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(auth)
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return new Response('No file ID provided', { status: 400 })
    }

    // Check file ownership
    const metadata = await gridfs.getFileMetadata(fileId)
    if (metadata.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 403 })
    }

    // Delete file
    await gridfs.deleteFile(fileId)

    return new Response(JSON.stringify({
      success: true
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('File deletion error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}