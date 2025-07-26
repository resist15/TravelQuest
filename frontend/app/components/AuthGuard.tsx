"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const PUBLIC_ROUTES = ["/login"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token && !PUBLIC_ROUTES.includes(pathname)) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [pathname]);

  if (!checked) return null;

  return <>{children}</>;
}
