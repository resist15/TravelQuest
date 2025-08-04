"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SidebarFilterProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onApplyFilters?: (filters: {
        orderDirection: string;
        orderBy: string;
        searchTerm: string;
        pageNumber: number;
        pageSize: number;
    }) => void;
    pageNumber?: number;
    pageSize?: number;
}

export default function SidebarFilter({
    searchTerm,
    onSearchChange,
    onApplyFilters,
    pageNumber = 0,
    pageSize = 10,
}: SidebarFilterProps) {
    const [orderDirection, setOrderDirection] = useState("asc");
    const [orderBy, setOrderBy] = useState("name");

    const handleApplyFilters = () => {
        onApplyFilters?.({
            orderDirection,
            orderBy,
            searchTerm,
            pageNumber,
            pageSize,
        });
    };

    return (
        <div className="bg-background text-foreground p-4 w-full shrink-0 space-y-6 text-[15px]">
            <div className="space-y-2">
                <h2 className="text-lg font-semibold">Search</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name..."
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
                type="single"
                value={orderBy}
                onValueChange={(val) => val && setOrderBy(val)}
                className="grid grid-cols-2 gap-2"
                >
                <ToggleGroupItem
                value="name"
                className="w-full rounded-md border px-4 py-3 text-base"
                >
                Name
                </ToggleGroupItem>
                <ToggleGroupItem
                value="updatedAt"
                className="w-full rounded-md border px-4 py-3 text-base"
                >
                Updated
                </ToggleGroupItem>
                <ToggleGroupItem
                value="createdAt"
                className="w-full rounded-md border px-4 py-3 text-base"
                >
                Date
                </ToggleGroupItem>
                <ToggleGroupItem
                value="rating"
                className="w-full rounded-md border px-4 py-3 text-base"
                >
                Rating
                </ToggleGroupItem>
            </ToggleGroup>
            </div>

            <Button size="lg" className="w-full" onClick={handleApplyFilters}>Apply Filters</Button>
        </div>
    );
}
