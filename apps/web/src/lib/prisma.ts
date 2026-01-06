import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
  // eslint-disable-next-line no-var
  var prismaConnected: boolean | undefined
}

// Prismaクライアントの作成
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['warn', 'error']
      : ['error'],
  })
  return client
}

// シングルトンパターン
export const prisma = global.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

// 接続をリセットする関数（prepared statement エラー対策）
export async function resetConnection() {
  try {
    // 全てのprepared statementsを解放
    await prisma.$executeRawUnsafe('DEALLOCATE ALL')
  } catch (e) {
    console.error('Failed to deallocate statements:', e)
    try {
      await prisma.$disconnect()
      await prisma.$connect()
    } catch (e2) {
      console.error('Failed to reset connection:', e2)
    }
  }
}
