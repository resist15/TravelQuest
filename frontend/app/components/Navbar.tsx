"use client";

import { useState } from "react";
import {
  AtSign,
  Compass,
  Layers,
  Globe,
  Map,
  Calendar,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ModeToggle from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const navLinks = [
    { href: "/adventures", icon: <Compass className="w-4 h-4" />, label: "Adventures" },
    { href: "/collections", icon: <Layers className="w-4 h-4" />, label: "Collections" },
    { href: "/map", icon: <Map className="w-4 h-4" />, label: "Map" },
    { href: "/calendar", icon: <Calendar className="w-4 h-4" />, label: "Calendar" },
    { href: "/aboutus", icon: <AtSign className="w-4 h-4" />, label: "About Us" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <nav className="w-full bg-background text-foreground border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold flex items-center space-x-2">
          <span>🌍 TravelQuest</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-4">
          {navLinks.map(({ href, icon, label }) => (
            <Link key={href} href={href}>
              <Button variant="ghost" className="flex gap-1 items-center">
                {icon} {label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Avatar + ModeToggle + Logout */}
        <div className="flex items-center gap-3">
          <ModeToggle />
          <Avatar>
            <AvatarImage src="/avatar.png" alt="user" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav Links */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          {navLinks.map(({ href, icon, label }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start flex gap-2">
                {icon} {label}
              </Button>
            </Link>
          ))}
          <Button variant="ghost" className="w-full justify-start flex gap-2" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      )}
    </nav>
  );
}
