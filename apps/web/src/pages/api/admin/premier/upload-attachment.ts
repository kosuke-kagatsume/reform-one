import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, File } from 'formidable'
import fs from 'fs'
import { supabaseAdmin, STORAGE_BUCKET, validateAttachmentFile, IMAGE_FOLDERS } from '@/lib/supabase'
import { verifyAuth } from '@/lib/auth'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await verifyAuth(req)
  if (!auth) {
    return res.status(401).json({ error: '認証が必要です' })
  }

  try {
    const form = new IncomingForm({
      maxFileSize: 10 * 1024 * 1024, // 10MB
    })

    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve([fields, files])
      })
    })

    const file = Array.isArray(files.file) ? files.file[0] : files.file
    if (!file) {
      return res.status(400).json({ error: 'ファイルが見つかりません' })
    }

    // Validate file
    const validation = validateAttachmentFile({
      type: file.mimetype || '',
      size: file.size,
    })

    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }

    // Read file
    const fileBuffer = fs.readFileSync(file.filepath)

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const originalName = file.originalFilename || 'attachment'
    const extension = originalName.split('.').pop()?.toLowerCase() || 'pdf'
    const fileName = `${IMAGE_FOLDERS.attachments}/${timestamp}-${randomStr}.${extension}`

    // Upload to Supabase
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype || 'application/octet-stream',
        upsert: false,
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return res.status(500).json({ error: 'ファイルのアップロードに失敗しました' })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path)

    // Clean up temp file
    fs.unlinkSync(file.filepath)

    return res.status(200).json({
      url: urlData.publicUrl,
      path: data.path,
      fileName: originalName,
      size: file.size,
      type: file.mimetype
    })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ error: 'ファイルのアップロードに失敗しました' })
  }
}
