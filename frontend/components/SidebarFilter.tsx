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
import { Search } from "lucide-react"; // Import Search icon

interface SidebarFilterProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onApplyFilters?: (filters: {
        orderDirection: string;
        orderBy: string;
        visitedStatus: string;
        categories: string[]; // Pass selected categories names
        searchTerm: string;
    }) => void;
}

export default function SidebarFilter({ searchTerm, onSearchChange, onApplyFilters }: SidebarFilterProps) {
    const [orderDirection, setOrderDirection] = useState("desc"); // Default to desc for more recent items
    const [orderBy, setOrderBy] = useState("updated"); // Default order by 'updated'
    const [visitedStatus, setVisitedStatus] = useState("all"); // Changed "All" to "all" for consistency
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // To store names of selected categories
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryEmoji, setNewCategoryEmoji] = useState("");

    const handleApplyFilters = () => {
        onApplyFilters?.({
            orderDirection,
            orderBy,
            visitedStatus,
            categories: selectedCategories,
            searchTerm,
        });
    };

    return (
        <div className="bg-background text-foreground p-4 w-full shrink-0 space-y-6 text-[15px]">
            <div className="space-y-2">
                <h2 className="text-lg font-semibold">Search</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by location..."
                        className="w-full pl-9"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <h2 className="text-lg font-semibold">Sort Order</h2>
                <ToggleGroup
                    variant="outline"
                    type="single"
                    value={orderDirection}
                    onValueChange={(val) => val && setOrderDirection(val)}
                    className="flex w-full"
                >
                    <ToggleGroupItem value="asc" className="flex-1">Ascending</ToggleGroupItem>
                    <ToggleGroupItem value="desc" className="flex-1">Descending</ToggleGroupItem>
                </ToggleGroup>
            </div>

            <div className="space-y-2">
                <h2 className="text-lg font-semibold">Order By</h2>
                <ToggleGroup
                    variant="outline"
                    type="single"
                    value={orderBy}
                    onValueChange={(val) => val && setOrderBy(val)}
                    className="grid grid-cols-2 sm:grid-cols-2 gap-2"
                >
                    <ToggleGroupItem value="updated" className="w-full">Updated</ToggleGroupItem>
                    <ToggleGroupItem value="name" className="w-full">Name</ToggleGroupItem>
                    <ToggleGroupItem value="date" className="w-full">Date</ToggleGroupItem>
                    <ToggleGroupItem value="rating" className="w-full">Rating</ToggleGroupItem>
                </ToggleGroup>
            </div>

            <div className="space-y-2">
                <h2 className="text-lg font-semibold">Status</h2>
                <ToggleGroup
                    variant="outline"
                    type="single"
                    value={visitedStatus}
                    onValueChange={(val) => val && setVisitedStatus(val)}
                    className="flex w-full"
                >
                    <ToggleGroupItem value="all" className="flex-1">All</ToggleGroupItem>
                    <ToggleGroupItem value="visited" className="flex-1">Visited</ToggleGroupItem>
                    <ToggleGroupItem value="planned" className="flex-1">Planned</ToggleGroupItem>
                </ToggleGroup>
            </div>

            <Button size="lg" className="w-full" onClick={handleApplyFilters}>Apply Filters</Button>
        </div>
    );
}