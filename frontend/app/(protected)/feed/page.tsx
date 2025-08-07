"use client"

import { useEffect, useState } from "react"
import axios from "@/lib/axios"
import { AdventureDTO } from "@/types/AdventureDTO"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, MapPin } from "lucide-react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion";

export default function AdventureFeedsPage() {
    const [adventures, setAdventures] = useState<AdventureDTO[]>([])
    const [visibleCount, setVisibleCount] = useState(6)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchAdventures = async () => {
            setLoading(true)
            try {
                const res = await axios.get("/api/adventures/feed")
                setAdventures(res.data)
            } catch (err) {
                console.error("Failed to fetch adventures", err)
            } finally {
                setLoading(false)
            }
        }

        fetchAdventures()
    }, [])

    const handleViewMore = () => {
        setVisibleCount((prev) => prev + 6)
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            {/* Title and tagline */}
            <div className="text-center mb-13">
                <h1 className="text-3xl font-bold mb-2">🌍 Explore Adventures</h1>
                <p className="text-muted-foreground">
                    Dive into stories, locations, and experiences shared by fellow adventurers.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {adventures.slice(0, visibleCount).map((adventure, index) => (
                            <motion.div
                                key={adventure.id}
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

                                <Card key={adventure.id} className="flex flex-col overflow-hidden pt-0 hover:shadow-xl transition-shadow">
                                    <img
                                        src={
                                            adventure.imageUrls.length > 0 && adventure.imageUrls[0]
                                                ? adventure.imageUrls[0]
                                                : "/adventure_place.webp"
                                        }
                                        alt={adventure.name}
                                        className="h-48 w-full object-cover rounded-t-xl transition-transform duration-300 hover:scale-105"
                                    />

                                    <CardHeader>
                                        <CardTitle className="text-xl font-semibold">
                                            {adventure.name}
                                        </CardTitle>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="w-4 h-4" />
                                            <span>{adventure.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <CalendarDays className="w-4 h-4" />
                                            <span>{new Date(adventure.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex flex-col gap-2">
                                        <p className="text-sm line-clamp-3">{adventure.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {adventure.tags.map((tag, index) => (
                                                <Badge key={index} variant="outline">
                                                    #{tag}
                                                </Badge>
                                            ))}
                                        </div>

                                        <div className="mt-4 flex justify-between items-center">
                                            <Link href={`/feed/${adventure.id}`}>
                                                <Button size="sm" variant="outline">
                                                    View Details
                                                </Button>
                                            </Link>
                                            <span className="text-sm font-semibold">
                                                ⭐ {adventure.rating.toFixed(1)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* View More Button */}
                    {visibleCount < adventures.length && (
                        <div className="flex justify-center mt-10">
                            <Button onClick={handleViewMore}>View More</Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
