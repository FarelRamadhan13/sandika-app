import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SANDIKA — Sandbox Anti-Hoax Interactive Platform",
  description:
    "Platform edukasi interaktif untuk melatih kemampuan berpikir kritis siswa dalam mendeteksi hoax dan disinformasi melalui simulasi investigasi jurnalistik.",
  keywords: [
    "anti-hoax",
    "berpikir kritis",
    "literasi media",
    "edukasi",
    "investigasi jurnalistik",
    "sandbox",
  ],
  authors: [{ name: "Tim SANDIKA" }],
  openGraph: {
    title: "SANDIKA — Sandbox Anti-Hoax Interactive Platform",
    description:
      "Latih kemampuan berpikir kritis dengan platform simulasi investigasi jurnalistik interaktif.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-surface-950 text-surface-50">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
