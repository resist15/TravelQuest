"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const AUTH_ROUTES = ["/login", "/register"];

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isAuthPage) {
      setReady(true);
      return;
    }

    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!token || !refreshToken) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      router.replace("/login");
      return;
    }

    setReady(true);
  }, [pathname, isAuthPage, router]);

  if (!ready) return null;
  
  return <>{children}</>;
}
