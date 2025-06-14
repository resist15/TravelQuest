"use client";

import { useState } from "react";
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

const adventures = [
  {
    id: 1,
    name: "Mar del Plata",
    location: "Mar del Plata, Buenos Aires, AR",
    tags: ["General 🌍", "Planned", "Private"],
    image: null,
  },
  {
    id: 2,
    name: "Hawai‘i County",
    location: "Hawai‘i County, Hawaii, US",
    tags: ["General 🌍", "Planned", "Private"],
    image: null,
  },
  {
    id: 3,
    name: "Sequoia National Park",
    location: "Tulare County, California, US",
    tags: ["National Park 🌍", "Visited", "Private"],
    image: null,
  },
];

export default function AdventuresPage() {
  const [open, setOpen] = useState(false);

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
            8 results matching your search
          </p>
        </div>

        {/* Adventures grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adventures.map((adv) => (
            <AdventureCard key={adv.id} adventure={adv} />
          ))}
        </div>
      </main>

      {/* Floating Add Adventure Button for mobile */}
      <div className="fixed bottom-4 right-4 z-50 lg:static lg:bottom-auto lg:right-auto">
        <AddAdventureButton />
      </div>
    </div>
  );
}
