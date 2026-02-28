import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PERMISSIONS = [
  "article.create",
  "article.read",
  "article.update.own",
  "article.update.any",
  "article.publish",
  "article.archive",
  "user.read",
  "user.invite",
  "user.assign_role",
  "category.create",
  "category.update",
  "category.delete",
  "tag.create",
  "tag.update",
  "tag.delete",
];

async function main() {
  console.log("Seeding database...");

  // Create permissions
  const permissions = await Promise.all(
    PERMISSIONS.map((action) =>
      prisma.permission.upsert({
        where: { action },
        update: {},
        create: { action },
      })
    )
  );

  console.log(`Created ${permissions.length} permissions`);

  // Create admin role with all permissions
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  await Promise.all(
    permissions.map((p) =>
      prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: adminRole.id, permissionId: p.id },
      })
    )
  );

  // Create editor role
  const editorPerms = [
    "article.create",
    "article.read",
    "article.update.own",
    "article.publish",
    "article.archive",
    "category.create",
    "category.update",
    "tag.create",
    "tag.update",
  ];

  const editorRole = await prisma.role.upsert({
    where: { name: "editor" },
    update: {},
    create: { name: "editor" },
  });

  const editorPermIds = permissions
    .filter((p) => editorPerms.includes(p.action))
    .map((p) => p.id);

  await Promise.all(
    editorPermIds.map((permissionId) =>
      prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: editorRole.id, permissionId } },
        update: {},
        create: { roleId: editorRole.id, permissionId },
      })
    )
  );

  // Create author role
  const authorPerms = [
    "article.create",
    "article.read",
    "article.update.own",
    "tag.create",
  ];

  const authorRole = await prisma.role.upsert({
    where: { name: "author" },
    update: {},
    create: { name: "author" },
  });

  const authorPermIds = permissions
    .filter((p) => authorPerms.includes(p.action))
    .map((p) => p.id);

  await Promise.all(
    authorPermIds.map((permissionId) =>
      prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: authorRole.id, permissionId } },
        update: {},
        create: { roleId: authorRole.id, permissionId },
      })
    )
  );

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@cms.local" },
    update: {},
    create: {
      email: "admin@cms.local",
      password: hashedPassword,
      name: "Admin",
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  console.log("Admin user created: admin@cms.local / admin123");
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
