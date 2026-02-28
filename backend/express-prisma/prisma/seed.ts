import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';
import { ALL_PERMISSIONS } from '../src/permissions/permissions';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create permissions
  const permissions = await Promise.all(
    ALL_PERMISSIONS.map((action) =>
      prisma.permission.upsert({
        where: { action },
        update: {},
        create: { action, description: action.replace(/\./g, ' ') },
      })
    )
  );

  console.log(`✅ Created ${permissions.length} permissions`);

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'Full access administrator' },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: 'editor' },
    update: {},
    create: { name: 'editor', description: 'Content editor' },
  });

  const authorRole = await prisma.role.upsert({
    where: { name: 'author' },
    update: {},
    create: { name: 'author', description: 'Article author' },
  });

  const readerRole = await prisma.role.upsert({
    where: { name: 'reader' },
    update: {},
    create: { name: 'reader', description: 'Read-only user' },
  });

  console.log('✅ Created roles');

  // Assign all permissions to admin
  for (const perm of permissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // Editor permissions
  const editorActions = [
    'article.create', 'article.read', 'article.update.own', 'article.update.any',
    'article.publish', 'article.archive', 'article.delete.own', 'article.lock',
    'article.force_unlock',
    'category.create', 'category.read', 'category.update', 'category.delete',
    'tag.create', 'tag.read', 'tag.update', 'tag.delete',
    'user.read',
  ];

  for (const action of editorActions) {
    const perm = permissions.find((p) => p.action === action);
    if (perm) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: editorRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: editorRole.id, permissionId: perm.id },
      });
    }
  }

  // Author permissions
  const authorActions = [
    'article.create', 'article.read', 'article.update.own', 'article.delete.own',
    'article.lock',
    'category.read',
    'tag.create', 'tag.read',
  ];

  for (const action of authorActions) {
    const perm = permissions.find((p) => p.action === action);
    if (perm) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: authorRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: authorRole.id, permissionId: perm.id },
      });
    }
  }

  // Reader permissions
  const readerActions = ['article.read', 'category.read', 'tag.read'];

  for (const action of readerActions) {
    const perm = permissions.find((p) => p.action === action);
    if (perm) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: readerRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: readerRole.id, permissionId: perm.id },
      });
    }
  }

  console.log('✅ Assigned role permissions');

  // Create admin user
  const adminPassword = await hashPassword('Admin123!');
  await prisma.user.upsert({
    where: { email: 'admin@cms.local' },
    update: {},
    create: {
      email: 'admin@cms.local',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      roleId: adminRole.id,
    },
  });

  // Create editor user
  const editorPassword = await hashPassword('Editor123!');
  await prisma.user.upsert({
    where: { email: 'editor@cms.local' },
    update: {},
    create: {
      email: 'editor@cms.local',
      password: editorPassword,
      firstName: 'Editor',
      lastName: 'User',
      roleId: editorRole.id,
    },
  });

  // Create author user
  const authorPassword = await hashPassword('Author123!');
  await prisma.user.upsert({
    where: { email: 'author@cms.local' },
    update: {},
    create: {
      email: 'author@cms.local',
      password: authorPassword,
      firstName: 'Author',
      lastName: 'User',
      roleId: authorRole.id,
    },
  });

  console.log('✅ Created seed users');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
