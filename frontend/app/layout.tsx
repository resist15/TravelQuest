"use client";

import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import Navbar from "./components/Navbar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar = ["/login", "/register"].includes(pathname);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {!hideNavbar && <Navbar />}
          <main className="max-w-7xl mx-auto px-4 pt-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
