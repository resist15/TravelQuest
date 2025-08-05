// app/collections/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import axios from "@/lib/axios"
import { AdventureDTO } from "@/types/AdventureDTO"
import Link from "next/link"
import { CalendarDays } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion";
import AdventureCard from "@/components/AdventureCard"
import { Badge } from "@/components/ui/badge"
import { formatDuration } from "@/lib/utils"
import { CollectionDTO } from "@/types/CollectionDTO"
import { Button } from "@/components/ui/button"
import AddAdventureDialog from "@/components/AddAdventureDialog"
import EditCollectionDialog from "@/components/EditCollectionDialog"
import { toast } from "react-toastify"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export default function CollectionDetailsPage() {
  const { id } = useParams()
  const [collection, setCollection] = useState<CollectionDTO | null>(null)
  const [adventures, setAdventures] = useState<AdventureDTO[]>([])
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 6;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const router = useRouter();

  const fetchCollection = async () => {
    setLoading(true);

    try {
      const res = await axios.get(`/api/collections/${id}`)
      setCollection(res.data)

      if (res.data.existingAdventureIds.length > 0) {
        const advRes = await axios.get(`/api/collections/${id}/adventures`)
        setAdventures(advRes.data)
      } else {
        setAdventures([])
      }
    } catch (err) {
      console.error("Failed to load collection", err)
      toast.error("Failed to load collection")
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
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
          <h1 className="text-2xl font-bold mb-2">{collection.name}</h1>
          <p className="text-sm text-muted-foreground mb-4">{collection.description}</p>
          {/* <p className="text-xs mt-1 text-muted-foreground"> */}
          {/* </p> */}
          <div className="flex items-center gap-2 text-xs">
            <CalendarDays className="h-4 w-4" />
            <span>
              Duration: {formatDuration(collection.durationInDays)}
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center items-end ml-auto gap-2">
          <Badge variant="secondary" className="text-xl sm:mr-2">
            {collection.adventureCount} trips
          </Badge>

          <div className="flex gap-2">
            <EditCollectionDialog collection={collection} onUpdated={fetchCollection} />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this collection?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All links to this collection will stop working.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={async () => {
                      try {
                        await axios.delete(`/api/collections/${collection.id}`);
                        toast.success("Collection deleted");
                        router.push("/collections");
                      } catch (err) {
                        console.error("Failed to delete collection", err);
                        toast.error("Failed to delete collection");
                      }
                    }}
                  >
                    Yes, delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>



      </div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Adventures</h1>
          <p className="hidden lg:block text-muted-foreground text-sm">
            {adventures.length} adventure{adventures.length !== 1 && "s"}
          </p>
        </div>
        <AddAdventureDialog collectionId={collection.id} onAdded={fetchCollection} />

      </div>


      {/* Adventures */}
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
          ) : adventures.length === 0 ? (
            <p>No adventures found.</p>
          ) : (
            adventures.slice(0, visibleCount).map((adv, index) => (
              <motion.div
                key={adv.id}
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
                <div className="relative group">
                  <Link href={`/adventures/${adv.id}`} passHref>
                    <AdventureCard adventure={adv} />
                  </Link>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={async (e) => {
                      e.preventDefault()
                      try {
                        await axios.delete(`/api/collections/${collection.id}/adventures/${adv.id}`)
                        await fetchCollection()
                      } catch (err) {
                        console.error("Failed to remove adventure from collection", err)
                      }
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>
      {visibleCount < adventures.length && (
        <div className="text-center mt-6">
          <Button onClick={() => setVisibleCount(visibleCount + PAGE_SIZE)}>
            Load More
          </Button>

        </div>
      )}

    </div>
  )
}
