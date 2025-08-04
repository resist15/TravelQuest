"use client"

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import axios from "@/lib/axios"
import { CollectionDTO } from "@/types/CollectionDTO"
import TripDurationSelector from "./TripDurationSelector"
import { toast } from "react-toastify"
import { ChevronRightIcon } from "lucide-react"

export default function EditCollectionDialog({
  collection,
  onUpdated
}: {
  collection: CollectionDTO
  onUpdated: () => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(collection.name)
  const [description, setDescription] = useState(collection.description)
  const [durationInDays, setDurationInDays] = useState(collection.durationInDays)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append(
        "data",
        new Blob(
          [JSON.stringify({ name, description, durationInDays })],
          { type: "application/json" }
        )
      )

      if (imageFile) {
        formData.append("image", imageFile)
      }
      
      await axios.put(`/api/collections/${collection.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      onUpdated()
      setOpen(false)
      toast.success("Collection updated successfully")
    } catch (err) {
      console.error("Failed to update collection", err)
      toast.error("Failed to update collection: ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">Edit      <ChevronRightIcon /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
          <TripDurationSelector initialDays={durationInDays} onDurationChange={setDurationInDays} />
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
