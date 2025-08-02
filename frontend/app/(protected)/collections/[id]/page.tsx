// app/collections/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import axios from "@/lib/axios"
import { AdventureDTO } from "@/types/AdventureDTO"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { format } from "date-fns"
import { MapPin } from "lucide-react"

interface CollectionDTO {
  id: number
  name: string
  description: string
  coverImage: string
  adventureCount: number
  startDate: string
  endDate: string
  existingAdventureIds: number[]
}

export default function CollectionDetailsPage() {
  const { id } = useParams()
  const [collection, setCollection] = useState<CollectionDTO | null>(null)
  const [adventures, setAdventures] = useState<AdventureDTO[]>([])

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const res = await axios.get(`/api/collections/${id}`)
        setCollection(res.data)

        if (res.data.existingAdventureIds.length > 0) {
          const advRes = await axios.get(`/api/collections/${id}/adventures`)
          setAdventures(advRes.data)
        }
      } catch (err) {
        console.error("Failed to load collection", err)
      }
    }

    if (id) fetchCollection()
  }, [id])

  if (!collection) return <p>Loading...</p>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Collection Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="w-32 h-32 relative rounded-lg overflow-hidden border shadow">
          <Image
            src={collection.coverImage}
            alt={collection.name}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{collection.name}</h1>
          <p className="text-sm text-muted-foreground">{collection.description}</p>
          {/* <p className="text-xs mt-1 text-muted-foreground"> */}
            {collection.startDate && collection.endDate && (
            <p className="text-muted-foreground text-sm">
                {format(new Date(collection.startDate), "dd MMMM yyyy")} -{" "}
                {format(new Date(collection.endDate), "dd MMMM yyyy")}
            </p>
            )}
          {/* </p> */}
        </div>
      </div>

      {/* Adventures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {adventures.map((adv) => (
        <Link key={adv.id} href={`/adventures/${adv.id}`}>
            <Card className="cursor-pointer hover:shadow-md transition duration-200 rounded-2xl overflow-hidden">
                <div className="w-full h-40 relative">
                <Image
                    src={adv.imageUrls?.[0] || "/adventure_place.webp"}
                    alt={adv.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-2xl"
                />
                </div>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">{adv.name}</CardTitle>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {adv.location}
                </p>
            </CardHeader>
            <CardContent>
                {adv.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {adv.tags.map((tag, index) => (
                    <span
                        key={index}
                        className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded"
                    >
                        {tag}
                    </span>
                    ))}
                </div>
                )}
            </CardContent>
            </Card>
        </Link>
        ))}


      </div>
    </div>
  )
}
