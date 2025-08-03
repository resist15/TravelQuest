"use client";

import {
    Card,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import CreateCollectionDialog from "@/components/CreateCollectionDialog";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { CollectionDTO } from "@/types/CollectionDTO";
import { AnimatePresence, motion } from "framer-motion";
import { formatDuration } from "@/lib/utils";

export default function CollectionsPage() {
    const [collections, setCollections] = useState<CollectionDTO[]>([]);
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const fetchCollections = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/collections")
            setCollections(res.data);
        } catch (err) {
            console.error("Failed to fetch collections");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground px-6 py-8 md:px-12 lg:px-24">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Your Collections</h1>
                <p className="text-muted-foreground mt-1">
                    Grouped adventures by region or timeline.
                </p>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    // key={page + searchTerm}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                >
                    {loading ? (
                        <p>Loading adventures...</p>
                    ) : collections.length === 0 ? (
                        <p>No collections found.</p>
                    ) : (collections.map((collection, index) => (
                        <motion.div
                            key={collection.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{
                                duration: 0.3,
                                delay: index * 0.05,
                            }}
                            whileHover={{
                                scale: 1.03,
                                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
                            }}
                        >
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
                        </motion.div>

                    )))}
                </motion.div>
            </AnimatePresence>
            <div className="mt-10 text-center">
                <CreateCollectionDialog onSuccess={() => fetchCollections()} />
            </div>
        </div>
    );
}
