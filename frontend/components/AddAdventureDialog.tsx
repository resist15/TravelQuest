"use client"

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import axios from "@/lib/axios"
import { AdventureDTO } from "@/types/AdventureDTO"
import { ScrollArea } from "@/components/ui/scroll-area"

type Props = {
  collectionId: number
  onAdded: () => void
}

export default function AddAdventureDialog({ collectionId, onAdded }: Props) {
  const [open, setOpen] = useState(false)
  const [adventures, setAdventures] = useState<AdventureDTO[]>([])
  const [loading, setLoading] = useState(false)

  const fetchUnassigned = async () => {
    setLoading(true)
    try {
      const res = await axios.get("/api/adventures?unassignedOnly=true")
      setAdventures(res.data)
    } catch (err) {
      console.error("Failed to fetch adventures", err)
    } finally {
      setLoading(false)
    }
  }

  const addToCollection = async (adventureId: number) => {
    try {
      await axios.post(`/api/collections/${collectionId}/adventures/${adventureId}`)
      onAdded()
      setOpen(false)
    } catch (err) {
      console.error("Failed to add adventure to collection", err)
    }
  }

  useEffect(() => {
    if (open) fetchUnassigned()
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Add Adventure</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Adventure</DialogTitle>
          <DialogDescription>Pick one to add to this collection.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-64 pr-4">
          {loading ? (
            <p>Loading...</p>
          ) : adventures.length === 0 ? (
            <p>No unassigned adventures available.</p>
          ) : (
            <ul className="space-y-2">
              {adventures.map((adv) => (
                <li
                  key={adv.id}
                  className="border rounded-md p-3 hover:bg-accent flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{adv.name}</p>
                    <p className="text-sm text-muted-foreground">{adv.location}</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => addToCollection(adv.id)}
                  >
                    Add
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
