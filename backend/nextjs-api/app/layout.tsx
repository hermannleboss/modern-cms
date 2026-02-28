import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modern CMS API",
  description: "Headless CMS API built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
