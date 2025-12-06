import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// Track databook download and return download URL
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  const { userId } = req.body

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid databook ID' })
  }

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' })
  }

  try {
    // Get the databook
    const databook = await prisma.databook.findUnique({
      where: { id, isPublished: true }
    })

    if (!databook) {
      return res.status(404).json({ error: 'Databook not found' })
    }

    // Record the download
    await prisma.databookDownload.create({
      data: {
        databookId: id,
        userId
      }
    })

    // Also log to activity log
    await prisma.activityLog.create({
      data: {
        userId,
        activityType: 'databook_download',
        resourceType: 'databook',
        resourceId: id
      }
    })

    return res.status(200).json({
      pdfUrl: databook.pdfUrl,
      title: databook.title
    })
  } catch (error) {
    console.error('Download databook error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
