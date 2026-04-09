import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MobileNav, Sidebar } from "@/components/layout/Sidebar";
import { StoreInitializer } from "@/components/StoreInitializer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { OnboardingModal } from "@/components/OnboardingModal";

export const metadata: Metadata = {
  title: "FinTrack Teakillah — Personal Finance Tracker",
  description: "Lacak keuangan pribadimu dengan logika deterministik dan psikologi perilaku. Tanpa AI.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FinTrack",
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#059669" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ("serviceWorker" in navigator) {
                window.addEventListener("load", function() {
                  navigator.serviceWorker.register("/sw.js");
                });
              }
            `,
          }}
        />
      </head>
      <body className="bg-[#0a0a0a] text-white font-sans antialiased">
        <ThemeProvider>
          <StoreInitializer />
          <OnboardingModal />
          <Sidebar />
          <div className="lg:ml-60">
            <main className="min-h-screen pb-28 lg:pb-0">{children}</main>
          </div>
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
