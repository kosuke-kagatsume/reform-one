import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    return res.status(200).json({
      status: 'ok',
      database: 'connected',
      userCount,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL
      }
    })
  } catch (error: any) {
    console.error('Health check error:', error)
    return res.status(500).json({
      status: 'error',
      database: 'failed',
      error: error.message,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL
      }
    })
  }
}
