"use client"
import { useState } from "react";
import ToggleButton from "./ToggleButton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Toggle } from "./ui/toggle";

export default function SidebarFilters() {
    const [orderDirection, setOrderDirection] = useState("Ascending");
    const [visitedStatus, setVisitedStatus] = useState("All");

    return (
        <div className="bg-black text-white p-4 w-64 space-y-6">
            <h2 className="text-lg font-semibold">Sort</h2>

            <ToggleGroup variant="outline" type="single">
                <ToggleGroupItem value="a">Ascending</ToggleGroupItem>
                <ToggleGroupItem value="b">Descending</ToggleGroupItem>
            </ToggleGroup>
            {/* <ToggleButton
                options={["Ascending", "Descending"]}
                value={orderDirection}
                onChange={setOrderDirection}
            />

            <h2 className="text-lg font-semibold mt-4">Visited</h2>
            <ToggleButton
                options={["All", "Visited", "Not Visited"]}
                value={visitedStatus}
                onChange={setVisitedStatus}
            /> */}
            <h2 className="text-lg font-semibold">Order By</h2>
            <div className="flex flex-wrap gap-2">
                <Toggle size="lg" variant="outline">Updated</Toggle>
                <Toggle size="lg" variant="outline">Name </Toggle>
                <Toggle size="lg" variant="outline">Date</Toggle>
                <Toggle size="lg" variant="outline">Rating</Toggle>
            </div>
        </div>
    );
}
