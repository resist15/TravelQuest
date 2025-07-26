"use client";

import { useCallback, useEffect, useState } from "react";
import SidebarFilter from "@/components/SidebarFilter";
import AdventureCard from "@/components/AdventureCard";
import AddAdventureButton from "@/components/AddAdventureDialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import axios from "@/lib/axios";
import Link from "next/link";

interface Adventure {
  id: number;
  name: string;
  location: string;
  tags: string[];
  imageUrls: string[];
  latitude: number;
  longitude: number;
}

export default function AdventuresPage() {
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [page, setPage] = useState(0); // ✅ New: current page
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState<string>("");

  const fetchAdventures = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get<Adventure[]>("/api/adventures/my", {
        params: {
          page,
          size: 6, // ✅ New: 6 adventures per page
        },
      });
      setAdventures(response.data);
    } catch (err) {
      console.error("Failed to load adventures", err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAdventures();
  }, [fetchAdventures]);

  return (
    <div className="flex flex-col lg:flex-row bg-background min-h-screen text-foreground">
      {/* Sidebar: visible on large screens */}
      <aside className="hidden lg:block lg:w-64">
        <SidebarFilter />
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-4 sm:p-6">
        {/* Mobile Filter Button */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <h1 className="text-2xl font-bold">My Adventures</h1>
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Filter Adventures</DrawerTitle>
              </DrawerHeader>
              <div className="p-4">
                <SidebarFilter />
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        {/* Desktop Title */}
        <div className="hidden lg:block mb-6">
          <h1 className="text-2xl font-bold">My Adventures</h1>
          <p className="text-muted-foreground text-sm">
            {adventures.length} result{adventures.length !== 1 && "s"} matching your search
          </p>
        </div>

        {/* Adventures grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p>Loading adventures...</p>
          ) : adventures.length === 0 ? (
            <p>No adventures found.</p>
          ) : (
            adventures.map((adv) => (
              <Link key={adv.id} href={`/adventures/${adv.id}`} passHref>
                <AdventureCard adventure={adv} />
              </Link>
            ))
          )}
        </div>

        {/* ✅ Pagination controls */}
        <div className="flex justify-center mt-6 space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={adventures.length < 6}
          >
            Next
          </Button>
        </div>
      </main>

      {/* Floating Add Adventure Button for mobile */}
      <div className="fixed bottom-4 right-4 z-50 lg:static lg:bottom-auto lg:right-auto">
        <Link href="/adventures/new" passHref>
          <Button>+ Add Adventure</Button>
        </Link>
      </div>
    </div>
  );
}
