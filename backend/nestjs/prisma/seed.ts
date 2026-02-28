import { PrismaClient } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PERMISSIONS = [
  'article.create',
  'article.read',
  'article.update.own',
  'article.update.any',
  'article.publish',
  'article.archive',
  'user.read',
  'user.invite',
  'user.assign_role',
  'category.create',
  'category.update',
  'category.delete',
  'tag.create',
  'tag.update',
  'tag.delete',
];

async function main() {
  // Create permissions
  const permissions = await Promise.all(
    PERMISSIONS.map((action) =>
      prisma.permission.upsert({
        where: { action },
        update: {},
        create: { action, description: `Permission to ${action.replace(/\./g, ' ')}` },
      }),
    ),
  );

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'Administrator with full access' },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: 'editor' },
    update: {},
    create: { name: 'editor', description: 'Editor with article management' },
  });

  const authorRole = await prisma.role.upsert({
    where: { name: 'author' },
    update: {},
    create: { name: 'author', description: 'Author with own article management' },
  });

  // Assign all permissions to admin
  for (const perm of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // Assign editor permissions
  const editorPermissions = [
    'article.create',
    'article.read',
    'article.update.own',
    'article.update.any',
    'article.publish',
    'article.archive',
    'category.create',
    'category.update',
    'tag.create',
    'tag.update',
  ];

  for (const action of editorPermissions) {
    const perm = permissions.find((p) => p.action === action);
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: editorRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: { roleId: editorRole.id, permissionId: perm.id },
      });
    }
  }

  // Assign author permissions
  const authorPermissions = [
    'article.create',
    'article.read',
    'article.update.own',
    'tag.create',
  ];

  for (const action of authorPermissions) {
    const perm = permissions.find((p) => p.action === action);
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: authorRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: { roleId: authorRole.id, permissionId: perm.id },
      });
    }
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@cms.local' },
    update: {},
    create: {
      email: 'admin@cms.local',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      roleId: adminRole.id,
    },
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
