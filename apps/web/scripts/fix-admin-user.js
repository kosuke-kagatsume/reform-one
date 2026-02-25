const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 現在の状態を確認
  const user = await prisma.user.findUnique({
    where: { email: 'admin@the-reform.co.jp' },
    include: {
      organizations: {
        include: { organization: true }
      }
    }
  });

  if (!user) {
    console.log('ユーザーが見つかりません');
    return;
  }

  console.log('現在の状態:');
  console.log('- Email:', user.email);
  console.log('- userType:', user.userType);
  console.log('- 組織:', user.organizations.map(o => o.organization.name + ' (' + o.organization.type + ')').join(', '));

  // 組織タイプを更新
  if (user.organizations.length > 0) {
    const orgId = user.organizations[0].organizationId;
    await prisma.organization.update({
      where: { id: orgId },
      data: { type: 'REFORM_COMPANY' }
    });
    console.log('\n組織タイプを REFORM_COMPANY に更新しました');
  }

  // ユーザータイプを更新
  await prisma.user.update({
    where: { email: 'admin@the-reform.co.jp' },
    data: { userType: 'EMPLOYEE' }
  });
  console.log('ユーザータイプを EMPLOYEE に更新しました');

  console.log('\n完了！再ログインしてください。');
}

main().catch(console.error).finally(() => prisma.$disconnect());
