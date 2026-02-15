# デプロイメントルール

## スキーマ変更時の手順

Prismaスキーマ (`packages/database/prisma/schema.prisma`) を変更した場合、**必ず以下の手順を実行すること**:

1. **スキーマファイルを同期**
   ```bash
   cp packages/database/prisma/schema.prisma apps/web/prisma/schema.prisma
   ```

2. **データベースにスキーマをプッシュ**
   ```bash
   cd apps/web && npx prisma db push
   ```

3. **ビルド確認**
   ```bash
   npm run build
   ```

4. **コミット & プッシュ**
   ```bash
   git add . && git commit -m "..." && git push
   ```

## 注意事項

- `prisma db push` を忘れると、Vercelデプロイ後に500エラーが発生する
- スキーマの同期は両方のファイルで行う必要がある:
  - `packages/database/prisma/schema.prisma` (マスター)
  - `apps/web/prisma/schema.prisma` (コピー)
