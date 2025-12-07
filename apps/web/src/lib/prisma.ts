import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Serverless環境向けに接続プール設定を最適化
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  // データソースURLにpgbouncerパラメータが含まれている場合は
  // Prismaが自動的にトランザクションモードを調整
})

// 開発環境でもグローバルにキャッシュ（Hot Reload対策）
globalForPrisma.prisma = prisma
