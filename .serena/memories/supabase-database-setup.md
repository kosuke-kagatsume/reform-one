# Supabase PostgreSQL Database Setup

## Connection Details

- **Project ID**: lrlrrseflklqvkonsrhy
- **Region**: aws-1-ap-south-1
- **Session Pooler URL** (IPv4 compatible):
  ```
  postgresql://postgres.lrlrrseflklqvkonsrhy:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
  ```

## Important Notes

### Password Encoding
- Password contains `!` character which needs URL encoding as `%21`
- In `.env` files, use `%21` instead of `!`
- Example: `DandoriWork2025%21` instead of `DandoriWork2025!`

### Environment Files to Update
When setting up the database, update these files:
1. `/packages/database/.env` - For Prisma CLI operations
2. `/apps/web/.env.local` - For Next.js runtime
3. `/.env` (root) - For shared environment

### Session Pooler vs Direct Connection
- Use **Session Pooler** for IPv4 compatibility
- Direct connection uses IPv6 only and may fail on some networks
- Session Pooler URL format: `aws-1-ap-south-1.pooler.supabase.com:5432`

### Running Dev Server
For reliable operation, start the dev server with explicit DATABASE_URL:
```bash
DATABASE_URL="postgresql://postgres.lrlrrseflklqvkonsrhy:DandoriWork2025%21@aws-1-ap-south-1.pooler.supabase.com:5432/postgres" npm run dev
```

### Test User Credentials
- Email: admin@the-reform.co.jp
- Password: Admin123!

## Database Schema
Using PostgreSQL provider with Prisma:
- Tables are created via `prisma db push`
- Seed data via `npx ts-node prisma/seed.ts`
