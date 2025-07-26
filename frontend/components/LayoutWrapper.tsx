"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const AUTH_ROUTES = ["/login", "/register"];

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!isAuthPage) {
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const decoded: { exp: number } = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          router.replace("/login");
        }
      } catch (e) {
        localStorage.removeItem("token");
        router.replace("/login");
      }
    }
  }, [pathname, router, isAuthPage]);

  return <>{children}</>;
}
