import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import SocketListener from "@/components/shared/SocketListener";
import "./globals.css";

export const metadata = {
  title: "GigForge - Connect Clients & Developers",
  description: "A marketplace to post projects, bid, collaborate, and get paid.",
  icons: {
    icon: [
      { url: "/favicon.ico", rel: "shortcut icon" },
      { url: "/icon0.svg", type: "image/svg+xml" },
      { url: "/icon1.png", type: "image/png" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180" },
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className="dark">
        <head>
          <link href="https://api.fontshare.com/v2/css?f[]=space-grotesk@400&display=swap" rel="stylesheet"></link>
          <meta name="theme-color" content="#0a0a0a" />
        </head>
        <body className="relative">
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <SocketListener />
          <script dangerouslySetInnerHTML={{__html: `
            // Capture beforeinstallprompt as early as possible (before React mounts)
            (function(){
              try {
                window.addEventListener('beforeinstallprompt', function(e){
                  e.preventDefault();
                  window.__deferredPWA = e;
                  window.dispatchEvent(new CustomEvent('pwa-available'));
                });
                window.addEventListener('appinstalled', function(){
                  window.__deferredPWA = null;
                  window.dispatchEvent(new CustomEvent('pwa-installed'));
                });
              } catch (err) { console.warn('PWA inline listener error', err); }
            })();
          `}} />
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}