import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import {
  supabaseAdmin,
  STORAGE_BUCKET,
  validateImageFile,
  generateFileName,
  getImageUrl,
  IMAGE_FOLDERS,
  type ImageFolder,
} from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { success, error, methodNotAllowed, ErrorCodes } from '@/lib/api-response'

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}

// Parse form data
function parseForm(req: NextApiRequest): Promise<{
  fields: formidable.Fields
  files: formidable.Files
}> {
  const form = formidable({
    maxFileSize: 5 * 1024 * 1024, // 5MB
    keepExtensions: true,
  })

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST'])
  }

  try {
    // Check authentication (must be Reform Company staff)
    const sessionCookie = req.cookies.premier_session
    if (!sessionCookie) {
      return error(res, ErrorCodes.UNAUTHORIZED, '認証が必要です')
    }

    // Get user and check if admin
    const user = await prisma.user.findUnique({
      where: { id: sessionCookie },
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
      },
    })

    if (!user) {
      return error(res, ErrorCodes.UNAUTHORIZED, 'ユーザーが見つかりません')
    }

    // Check if user is Reform Company staff (PROVIDER organization)
    const isStaff = user.organizations.some(
      (uo) => uo.organization.type === 'PROVIDER'
    )

    if (!isStaff) {
      return error(
        res,
        ErrorCodes.FORBIDDEN,
        '画像のアップロードは管理者のみ可能です'
      )
    }

    // Parse form data
    const { fields, files } = await parseForm(req)

    // Get folder from fields
    const folderField = fields.folder
    const folder = (Array.isArray(folderField) ? folderField[0] : folderField) as ImageFolder

    if (!folder || !IMAGE_FOLDERS[folder]) {
      return error(
        res,
        ErrorCodes.VALIDATION_ERROR,
        'フォルダを指定してください',
        { validFolders: Object.keys(IMAGE_FOLDERS) }
      )
    }

    // Get uploaded file
    const fileField = files.file
    const file = Array.isArray(fileField) ? fileField[0] : fileField

    if (!file) {
      return error(res, ErrorCodes.VALIDATION_ERROR, 'ファイルを選択してください')
    }

    // Validate file
    const validation = validateImageFile({
      type: file.mimetype || '',
      size: file.size,
    })

    if (!validation.valid) {
      return error(res, ErrorCodes.VALIDATION_ERROR, validation.error!)
    }

    // Read file
    const fileBuffer = fs.readFileSync(file.filepath)

    // Generate unique filename
    const fileName = generateFileName(file.originalFilename || 'image.jpg', folder)

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype || 'image/jpeg',
        upsert: false,
      })

    // Clean up temp file
    fs.unlinkSync(file.filepath)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return error(
        res,
        ErrorCodes.INTERNAL_ERROR,
        'アップロードに失敗しました',
        { details: uploadError.message }
      )
    }

    // Get public URL
    const publicUrl = getImageUrl(data.path)

    // Log the upload
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'image.upload',
        resource: `storage:${data.path}`,
        metadata: JSON.stringify({
          folder,
          fileName: file.originalFilename,
          size: file.size,
          mimeType: file.mimetype,
        }),
      },
    })

    return success(res, {
      path: data.path,
      url: publicUrl,
      folder,
    }, '画像をアップロードしました')

  } catch (err) {
    console.error('Image upload error:', err)
    return error(
      res,
      ErrorCodes.INTERNAL_ERROR,
      'アップロード中にエラーが発生しました'
    )
  }
}
