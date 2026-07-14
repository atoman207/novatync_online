import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yuco — Full-Stack & AI Engineer",
  description:
    "Portfolio of Yuco, a Full-Stack & AI Engineer with 7+ years of experience building SaaS platforms, AI-powered applications, automation systems and modern web products with React, Next.js, Node.js, Laravel and Python.",
  keywords: [
    "Full-Stack Developer",
    "AI Engineer",
    "SaaS",
    "Automation",
    "LLM",
    "RAG",
    "Next.js",
    "React",
    "Node.js",
    "Laravel",
    "Python",
    "Portfolio",
  ],
  openGraph: {
    title: "Yuco — Full-Stack & AI Engineer",
    description:
      "7+ years building SaaS platforms, AI-powered applications and automation systems — React, Next.js, Node.js, Laravel, Python & AI integrations.",
    type: "website",
  },
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
