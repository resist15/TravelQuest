"use client";

import Link from "next/link";
import { Github, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function Footer() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <footer className="border-t mt-20 bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        
        <div>
        <h2 className="text-xl font-semibold">TravelQuest</h2>
        <p className="text-sm text-muted-foreground mt-2">
            Your journey, beautifully remembered. Plan, log, and revisit your adventures.
            <br className="mb-1" />
            <span className="font-semibold block mt-2">Made with ❤️ at CDAC</span>
        </p>
        </div>

        <div className="flex flex-col space-y-2 text-sm">
          <Link href="/aboutus" className="hover:text-primary transition-colors">About</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
        </div>

        <div className="flex flex-col items-start md:items-end space-y-4">
          <span className="text-sm text-muted-foreground">Follow us</span>
          <div className="flex items-center space-x-4">
            <Link
              href="https://github.com/resist15/TravelQuest"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              <Github className="h-5 w-5" />
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="Toggle theme"
              className="p-0 h-5 w-5"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} TravelQuest. All rights reserved.
      </div>
    </footer>
  );
}
