"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { AdventureDTO } from "@/types/AdventureDTO";
import { toast } from "react-toastify";
import TripDurationSelector from "./TripDurationSelector";

export default function CreateCollectionDialog() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAdventures, setSelectedAdventures] = useState<number[]>([]);
  const [adventures, setAdventures] = useState<AdventureDTO[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [durationDays, setDurationInDays] = useState(1)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const fetchAdventures = async () => {
      try {
        const res = await axios.get("/api/adventures?unassignedOnly=true");
        setAdventures(res.data);
      } catch (err) {
        console.error("Failed to fetch adventures", err);
      }
    };
    fetchAdventures();
  }, []);

  const toggleSelect = (id: number) => {
    setSelectedAdventures((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      ...formData,
      durationInDays: durationDays,
      existingAdventureIds: selectedAdventures,
    };

    const form = new FormData();
    form.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    if (imageFile) {
      form.append("image", imageFile);
    }

    try {
      await axios.post("/api/collections", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Collection created!");
      // Reset form
      setFormData({
        name: "",
        description: "",
      });
      setSelectedAdventures([]);
      setStep(1);
      setImageFile(null);

      const res = await axios.get("/api/adventures?unassignedOnly=true");
      setAdventures(res.data);
    } catch (err) {
      console.error("Failed to create collection", err);
      toast.error("Failed to create collection");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>+ Add New Collection</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Select Adventures</DialogTitle>
              <DialogDescription>
                Choose at least one adventure to include in this collection.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-64 overflow-y-auto mt-2">
              {adventures.map((adv) => (
                <div
                  key={adv.id}
                  className="flex items-center justify-between border rounded-lg px-3 py-2"
                >
                  <span>{adv.name}</span>
                  <Checkbox
                    checked={selectedAdventures.includes(adv.id)}
                    onCheckedChange={() => toggleSelect(adv.id)}
                  />
                </div>
              ))}
            </div>
              <Button
                className="mt-4 w-full"
                disabled={selectedAdventures.length === 0}
                onClick={() => setStep(2)}
              >
              Continue
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Collection Details</DialogTitle>
              <DialogDescription>
                Provide information for your new collection.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Input
                placeholder="Collection name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <Textarea
                placeholder="Short description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Add a Cover Image (optional)</label>

                <div
                  className="border border-dashed border-muted rounded-xl p-4 flex flex-col items-center justify-center text-muted-foreground hover:border-primary transition-colors cursor-pointer"
                  onClick={() => document.getElementById("collection-image")?.click()}
                >
                  {imageFile ? (
                    <div className="relative w-full max-w-xs">
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="Preview"
                        className="rounded-md object-cover max-h-48 w-full"
                      />
                      <span className="absolute top-1 right-1 text-xs bg-background px-2 py-0.5 rounded shadow text-foreground">
                        Change
                      </span>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm">Click to upload a cover image</span>
                      <span className="text-xs text-muted-foreground mt-1">(JPG, PNG, Max ~2MB)</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  id="collection-image"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setImageFile(file);
                  }}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <TripDurationSelector onDurationChange={setDurationInDays} />

              </div>
              <div className="flex gap-2 justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-1/2"
                >
                  ← Back
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={!formData.name.trim() || isSubmitting}
                  className="w-1/2"
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}