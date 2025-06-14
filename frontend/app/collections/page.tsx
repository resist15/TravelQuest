"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import CreateCollectionDialog from "@/components/CreateCollectionDialog";

const collections = [
    {
        id: "1",
        name: "France 2024",
        description: "A journey through France – Paris, Nice, and Lyon.",
        coverImage:
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", // France
        startDate: "2024-04-10",
        endDate: "2024-04-25",
        location: "France",
        tripCount: 3,
    },
    {
        id: "2",
        name: "Japan Winter Tour",
        description: "Exploring Tokyo, Kyoto, and Sapporo in the snow.",
        coverImage:
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", // France
        startDate: "2023-12-15",
        endDate: "2024-01-02",
        location: "Japan",
        tripCount: 4,
    },
    {
        id: "3",
        name: "Italy Summer Roadtrip",
        description: "Driving across Rome, Florence, and Venice.",
        coverImage:
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", // France
        startDate: "2023-07-05",
        endDate: "2023-07-20",
        location: "Italy",
        tripCount: 5,
    },
];

export default function CollectionsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background text-foreground px-6 py-8 md:px-12 lg:px-24">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Your Collections</h1>
                <p className="text-muted-foreground mt-1">
                    Grouped adventures by region or timeline.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {collections.map((collection) => (
                    <Card
                        key={collection.id}
                        className="overflow-hidden cursor-pointer hover:shadow-xl transition-shadow p-0"
                        onClick={() => router.push(`/collections/${collection.id}`)}
                    >
                        <div className="relative h-43 w-full overflow-hidden">
                            <img
                                src={collection.coverImage}
                                alt={collection.name}
                                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                        </div>
                        <div className="pt-0 px-4 pb-4">
                            <CardTitle className="flex justify-between items-center text-lg mb-2">
                                {collection.name}
                                <Badge variant="secondary" className="text-xs">
                                    {collection.tripCount} trips
                                </Badge>
                            </CardTitle>

                            <p className="text-sm text-muted-foreground">{collection.description}</p>

                            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2 text-xs">
                                    <MapPin className="h-4 w-4" />
                                    <span>{collection.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <CalendarDays className="h-4 w-4" />
                                    <span>
                                        {collection.startDate} → {collection.endDate}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="mt-10 text-center">
                <CreateCollectionDialog />
            </div>
        </div>
    );
}
