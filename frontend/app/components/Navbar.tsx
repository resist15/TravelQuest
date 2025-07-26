"use client";

import { useEffect, useState } from "react";
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
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const [userName, setUserName] = useState<string>("User");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        JSON.parse(atob(token.split(".")[1]));
        const userRes = await api.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserName(userRes.data.name || "User");
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 401) router.push("/login");
      }
    };

    fetchData();
  }, [router]);

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
    <motion.nav
      className="w-full bg-background text-foreground border-b border-border"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold flex items-center space-x-2">
          <span>🌍 TravelQuest</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-4">
          {navLinks.map(({ href, icon, label }) => (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button variant="ghost" className="flex gap-1 items-center">
                  {icon} {label}
                </Button>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Avatar + ModeToggle + Logout */}
        <div className="flex items-center gap-3">
          <ModeToggle />
          <motion.div whileHover={{ scale: 1.1 }}>
            <Avatar>
              <AvatarImage src="/avatar.png" alt="user" />
              <AvatarFallback>{userName[0]}</AvatarFallback>
            </Avatar>
          </motion.div>
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
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden px-4 pb-4 space-y-2"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {navLinks.map(({ href, icon, label }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start flex gap-2">
                  {icon} {label}
                </Button>
              </Link>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start flex gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
