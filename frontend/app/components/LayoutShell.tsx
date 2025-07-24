"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const HIDE_NAVBAR_ROUTES = ["/login"];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar = HIDE_NAVBAR_ROUTES.includes(pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className="max-w-7xl mx-auto px-4 pt-6">{children}</main>
    </>
  );
}
