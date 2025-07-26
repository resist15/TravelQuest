// app/components/Providers.tsx
"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "./theme-provider";
import Navbar from "./Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LayoutWrapper from "@/components/LayoutWrapper";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hideNavbar = ["/login", "/register"].includes(pathname);
  const isProtected = !hideNavbar;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isProtected) {
      setLoading(false);
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const parts = token.split(".");
      if (parts.length !== 3) throw new Error("Invalid token format");

      const payload = JSON.parse(atob(parts[1]));
      const now = Date.now() / 1000;

      if (payload.exp < now) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }
    } catch (err) {
      console.error("JWT parsing failed:", err);
      localStorage.removeItem("token");
      router.replace("/login");
      return;
    }

    setLoading(false);
  }, [router, isProtected]);

  if (loading && isProtected) {
    return null; // or show a loading spinner
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {!hideNavbar && <Navbar />}
      <main className="max-w-7xl mx-auto px-4 pt-6">
        {isProtected ? <LayoutWrapper>{children}</LayoutWrapper> : children}
      </main>
    </ThemeProvider>
  );
}
