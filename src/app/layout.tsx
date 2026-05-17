import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeaderAuth, HeaderAuthLinks } from "@/components/header-auth";
import { auth } from "@/lib/auth";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrackCourse",
  description: "View Trackman courses with slope and course rating",
};

async function HeaderSession() {
  const session = await auth();
  if (!session?.user) return <HeaderAuthLinks />;
  return <HeaderAuth user={session.user} />;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          defer
          src="https://analytics.markcirineo.com/script.js"
          data-website-id="30b3d908-c090-4e99-bc53-0b60a92dcdb5"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <header className="border-b">
            <nav className="container mx-auto flex h-14 items-center gap-6 px-4">
              <Link href="/" className="font-semibold">
                TrackCourse
              </Link>
              <Link href="/courses" className="text-muted-foreground hover:text-foreground">
                List
              </Link>
              <Link href="/courses/map" className="text-muted-foreground hover:text-foreground">
                Map
              </Link>
              <div className="ml-auto flex items-center gap-4">
                <ThemeToggle />
                <HeaderSession />
              </div>
            </nav>
          </header>
          {children}
          <Toaster position="bottom-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
