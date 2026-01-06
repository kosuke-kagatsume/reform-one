import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma, resetConnection } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Test database connection using raw query
    const result = await prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM "User"`
    const userCount = Number(result[0].count)
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
    // prepared statement エラーの場合は接続をリセットして再試行
    if (error.message?.includes('prepared statement')) {
      console.log('Resetting Prisma connection due to prepared statement error...')
      await resetConnection()
      try {
        const result = await prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM "User"`
        const userCount = Number(result[0].count)
        return res.status(200).json({
          status: 'ok',
          database: 'connected (after reset)',
          userCount,
          env: {
            hasDbUrl: !!process.env.DATABASE_URL,
            hasDirectUrl: !!process.env.DIRECT_URL
          }
        })
      } catch (retryError: any) {
        console.error('Health check retry error:', retryError)
      }
    }
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
