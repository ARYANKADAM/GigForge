import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import SocketListener from "@/components/shared/SocketListener";
import "./globals.css";

export const metadata = {
  title: "GigForge - Connect Clients & Developers",
  description: "A marketplace to post projects, bid, collaborate, and get paid.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className="dark">
        <body className="relative">
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <SocketListener />
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}