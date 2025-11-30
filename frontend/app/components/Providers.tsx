"use client";

import { usePathname, useRouter } from "next/navigation";
import { ThemeProvider } from "./theme-provider";
import Navbar from "./Navbar";
import { useEffect, useState } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";
import { ToastProvider } from "@/components/ToastProvider";
import Footer from "./Footer";
import { initAuth } from "@/lib/axios";

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

    const isValid = initAuth();
    if (!isValid) {
      router.replace("/login");
      return;
    }

    setLoading(false);
  }, [isProtected, router]);

  if (loading && isProtected) {
    return null; // you can replace with a spinner
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <LayoutWrapper>
        {!hideNavbar && <Navbar />}
        <main className="max-w-7xl mx-auto px-4 pt-6">
          {isProtected ? <>{children}</> : children}
        </main>
        <ToastProvider />
        {!hideNavbar && <Footer />}
      </LayoutWrapper>
    </ThemeProvider>
  );
}
