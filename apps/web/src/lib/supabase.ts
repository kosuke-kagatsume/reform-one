import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side client with service role (for API routes)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Storage bucket name
export const STORAGE_BUCKET = 'images'

// Allowed file types
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Max file size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024

// Image folders
export const IMAGE_FOLDERS = {
  seminars: 'seminars',
  archives: 'archives',
  community: 'community',
  profiles: 'profiles',
  general: 'general',
} as const

export type ImageFolder = keyof typeof IMAGE_FOLDERS

// Get public URL for an image
export function getImageUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path // Already a full URL

  const { data } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path)

  return data.publicUrl
}

// Validate file before upload
export function validateImageFile(file: {
  type: string
  size: number
}): { valid: boolean; error?: string } {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `対応していないファイル形式です。JPG, PNG, WebPのみ対応しています。`,
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。`,
    }
  }

  return { valid: true }
}

// Generate unique filename
export function generateFileName(originalName: string, folder: ImageFolder): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'

  return `${IMAGE_FOLDERS[folder]}/${timestamp}-${randomStr}.${extension}`
}
