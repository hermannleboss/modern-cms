import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { AuthProvider } from "@/lib/providers/AuthProvider";
import { getSession } from "@/lib/auth/session";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "Modern CMS",
  description: "Collaborative headless CMS",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <QueryProvider>
          <AuthProvider initialSession={session}>
            {session ? (
              <div className="flex min-h-screen flex-col">
                <Header />
                <div className="flex flex-1">
                  <Sidebar />
                  <main className="flex-1 bg-gray-50 p-6">{children}</main>
                </div>
              </div>
            ) : (
              <main className="min-h-screen bg-gray-50">{children}</main>
            )}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
