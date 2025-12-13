import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, File } from 'formidable'
import fs from 'fs'
import path from 'path'
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
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Only REFORM_COMPANY employees can upload files
  const isAdmin = auth.userType === 'EMPLOYEE'
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
    })

    const { files } = await new Promise<{ files: { file?: File | File[] } }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        resolve({ files: files as { file?: File | File[] } })
      })
    })

    const file = Array.isArray(files.file) ? files.file[0] : files.file
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Generate unique filename
    const timestamp = Date.now().toString(36)
    const ext = path.extname(file.originalFilename || '')
    const baseName = path.basename(file.originalFilename || 'file', ext)
      .replace(/[^a-zA-Z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf_-]/g, '_')
      .substring(0, 50)
    const newFilename = `${baseName}_${timestamp}${ext}`
    const newPath = path.join(uploadDir, newFilename)

    // Move file to final location
    fs.renameSync(file.filepath, newPath)

    const url = `/uploads/${newFilename}`
    return res.status(200).json({ url, filename: newFilename })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ error: 'Upload failed' })
  }
}
