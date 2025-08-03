"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import CreateCollectionDialog from "@/components/CreateCollectionDialog";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { CollectionDTO } from "@/types/CollectionDTO";
import { format, parseISO } from "date-fns";

export default function CollectionsPage() {
    const [collections, setCollections] = useState<CollectionDTO[]>([]);
    const router = useRouter();

    function formatDuration(days: number): string {
        if (days < 7) {
            return `${days} day${days > 1 ? "s" : ""}`
        } else if (days % 7 === 0 && days < 30) {
            const weeks = days / 7
            return `${weeks} week${weeks > 1 ? "s" : ""}`
        } else if (days % 30 === 0) {
            const months = days / 30
            return `${months} month${months > 1 ? "s" : ""}`
        } else {
            return `${days} days`
        }
    }

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const res = await axios.get("/api/collections")
                setCollections(res.data);
            } catch (err) {
                console.error("Failed to fetch collections")
            }
        }; fetchCollections();
    })

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
                                src={collection.coverImage ? collection.coverImage : "/adventure_place.webp"}
                                alt={collection.name}
                                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                        </div>
                        <div className="pt-0 px-4 pb-4">
                            <CardTitle className="flex justify-between items-center text-lg mb-2">
                                {collection.name}
                                <Badge variant="secondary" className="text-xs">
                                    {collection.adventureCount} trips
                                </Badge>
                            </CardTitle>

                            <p className="text-sm text-muted-foreground">{collection.description}</p>

                            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                {/* <div className="flex items-center gap-2 text-xs">
                                    <MapPin className="h-4 w-4" />
                                    <span>{collection.location}</span>
                                </div> */}
                                <div className="flex items-center gap-2 text-xs">
                                    <CalendarDays className="h-4 w-4" />
                                    <span>
                                          Duration: {formatDuration(collection.durationInDays)}
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
