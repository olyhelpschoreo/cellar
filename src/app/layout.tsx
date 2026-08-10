import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CellarProvider } from "@/lib/cellar-provider";
import { SiteHeader } from "@/components/site-header";
import { PwaRegister } from "@/components/pwa-register";
import { ReminderRunner } from "@/components/reminder-runner";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Next doesn't apply basePath to metadata `manifest`/`icons` URLs, so prefix
// them ourselves (empty in dev, "/cellar" in the production GitHub Pages build).
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Cellar — your living plant collection",
  description:
    "A beautiful catalog of your plants that knows who needs water today and remembers how each one has grown.",
  manifest: `${base}/manifest.webmanifest`,
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Cellar" },
  icons: {
    icon: `${base}/icon.svg`,
    apple: `${base}/icon-192.png`,
  },
};

export const viewport: Viewport = {
  themeColor: "#3f7c4a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CellarProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <Toaster />
            <PwaRegister />
            <ReminderRunner />
          </CellarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
