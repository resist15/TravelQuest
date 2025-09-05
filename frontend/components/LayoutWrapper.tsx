"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const AUTH_ROUTES = ["/login", "/register"];

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    if (!isAuthPage) {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!token || !refreshToken) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        router.replace("/login");
      }
    }
  }, [pathname, router, isAuthPage]);

  return <>{children}</>;
}
