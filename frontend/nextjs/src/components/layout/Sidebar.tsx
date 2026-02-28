"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

const navItems = [
  { href: "/articles", label: "Articles", permission: "article.read" as const },
  {
    href: "/categories",
    label: "Categories",
    permission: "article.read" as const,
  },
  { href: "/tags", label: "Tags", permission: "article.read" as const },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-gray-200 bg-gray-50">
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <PermissionGuard key={item.href} permission={item.permission}>
              <Link
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            </PermissionGuard>
          );
        })}
      </nav>
    </aside>
  );
}
