"use client";

import {
    Card,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import CreateCollectionDialog from "@/components/CreateCollectionDialog";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { CollectionDTO } from "@/types/CollectionDTO";
import { AnimatePresence, motion } from "framer-motion";
import { formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function CollectionsPage() {
    const [collections, setCollections] = useState<CollectionDTO[]>([]);
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const fetchCollections = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/collections/my", {
                params: {
                    page,
                    size: 6,
                    searchTerm: searchTerm || undefined,
                }
            });
            setCollections(res.data);
        } catch (err) {
            console.error("Failed to fetch collections", err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchCollections();
    }, [page, searchTerm]);

    return (
        <div className="min-h-screen bg-background text-foreground px-6 py-8 md:px-12 lg:px-24">
            <motion.div
                className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >

            </motion.div>
            <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Collections</h1>
                    <p className="text-muted-foreground mt-1">
                        Grouped adventures by region or timeline.
                    </p>
                </div>
                {/* Desktop-only "+ Add New Collection" button */}
                <div className="hidden lg:block mt-4 lg:mt-0">
                    <CreateCollectionDialog onSuccess={() => fetchCollections()} />

                </div>
            </div>

            <div className="mb-6">
                <label htmlFor="search" className="block text-lg font-semibold text-foreground mb-2">
                    Search
                </label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        id="search"
                        type="text"
                        placeholder="Search by name..."
                        className="w-84 pl-10 pr-4 py-2 border border-input rounded-md text-sm bg-background text-foreground"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(0); // reset to page 0 when user types
                        }}
                    />
                </div>
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
            {/* Pagination */}
            <motion.div
                className="flex justify-center mt-6 space-x-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
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
                    disabled={collections.length < 6} // Disable if not a full page
                >
                    Next
                </Button>
            </motion.div>

            {/* Floating Create Button for Mobile */}
            <motion.div
                className="fixed bottom-4 right-4 z-50 lg:hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <CreateCollectionDialog onSuccess={fetchCollections} />
            </motion.div>
        </div>
    );
}
