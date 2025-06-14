"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function SidebarFilters() {
  const [orderDirection, setOrderDirection] = useState("asc");
  const [visitedStatus, setVisitedStatus] = useState("All");
  const [categories, setCategories] = useState([
    { name: "Attraction", emoji: "🎢" },
    { name: "Hill", emoji: "⛰️" },
    { name: "National Park", emoji: "🌲" },
  ]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryEmoji, setNewCategoryEmoji] = useState("");

  const handleAddCategory = () => {
    if (
      newCategoryName.trim() &&
      newCategoryEmoji.trim() &&
      !categories.some((c) => c.name === newCategoryName)
    ) {
      setCategories([
        ...categories,
        { name: newCategoryName.trim(), emoji: newCategoryEmoji.trim() },
      ]);
      setNewCategoryName("");
      setNewCategoryEmoji("");
    }
  };

  const handleRemove = (catName: string) => {
    setCategories(categories.filter((c) => c.name !== catName));
  };

  return (
    <div className="bg-background text-foreground p-4 w-64 space-y-6 text-[15px]">
      {/* Manage Categories Modal */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full bg-muted text-foreground" variant="outline">
            Manage Categories
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-background text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="flex items-center justify-between bg-muted px-3 py-2 rounded"
              >
                <span>
                  {cat.emoji} {cat.name}
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemove(cat.name)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Input
                placeholder="Emoji"
                className="w-16"
                value={newCategoryEmoji}
                onChange={(e) => setNewCategoryEmoji(e.target.value)}
              />
              <Input
                placeholder="New Category"
                className="flex-1"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Button onClick={handleAddCategory}>Add</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sort Order */}
      <h2 className="text-lg font-semibold">Sort</h2>
      <ToggleGroup
        variant="outline"
        type="single"
        value={orderDirection}
        onValueChange={(val) => {
          if (val) setOrderDirection(val);
        }}
        className="w-full"
      >
        <ToggleGroupItem value="asc" className="w-1/2">
          Ascending
        </ToggleGroupItem>
        <ToggleGroupItem value="desc" className="w-1/2">
          Descending
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Order By */}
      <h2 className="text-lg font-semibold">Order By</h2>
      <div className="flex flex-wrap gap-2">
        <Toggle size="lg" variant="outline">
          Updated
        </Toggle>
        <Toggle size="lg" variant="outline">
          Name
        </Toggle>
        <Toggle size="lg" variant="outline">
          Date
        </Toggle>
        <Toggle size="lg" variant="outline">
          Rating
        </Toggle>
      </div>

      <Button size="lg" className="w-full">
        Filter
      </Button>
    </div>
  );
}
