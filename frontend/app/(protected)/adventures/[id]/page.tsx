"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Star,
  Pencil,
  Save,
  UploadCloud,
  Trash2,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { motion, AnimatePresence } from "framer-motion"; // Import motion and AnimatePresence
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdventureMap from "@/components/AdventureMap";
import axios from "@/lib/axios";
import { format } from "date-fns";
import clsx from "clsx";
import { AdventureDTO } from "@/types/AdventureDTO";
import { toast } from "sonner"; // Assuming you have sonner for toasts

export default function AdventureDetails() {
  const { id } = useParams();
  const [adventure, setAdventure] = useState<AdventureDTO | null>(null);
  const [formState, setFormState] = useState<AdventureDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [photosToUpload, setPhotosToUpload] = useState<File[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tagsInput, setTagsInput] = useState<string>("");
  const viewerRef = useRef<HTMLDivElement>(null);

  const fetchLocationName = useCallback(async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://api.maptiler.com/geocoding/${lon},${lat}.json?key=hCWgkMCmHCAFZw9YCnLa`
      );
      const data = await res.json();
      const place = data?.features?.[2]?.place_name || "Unknown location";
      setLocationName(place);
    } catch (err) {
      console.error("Failed to reverse geocode:", err);
      setLocationName("Unknown location");
    }
  }, []);

  useEffect(() => {
    const fetchAdventure = async () => {
      try {
        const res = await axios.get(`/api/adventures/${id}`);
        setAdventure(res.data);
        setFormState(res.data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAdventure();
  }, [id]);

  useEffect(() => {
    const currentLat = editing ? formState?.latitude : adventure?.latitude;
    const currentLon = editing ? formState?.longitude : adventure?.longitude;

    if (currentLat && currentLon) {
      fetchLocationName(currentLat, currentLon);
    }
  }, [adventure, formState, editing, fetchLocationName]);

  useEffect(() => {
    if (formState?.tags) {
      setTagsInput(formState.tags.join(", "));
    } else {
      setTagsInput("");
    }
  }, [formState, editing]);

  const handleSaveAdventureDetails = async () => {
    if (!formState) return;

    const tagsArray = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    // Apply tag limit here
    const uniqueTags = Array.from(new Set(tagsArray)).slice(0, 4);
    if (tagsArray.length > 4) {
      toast.warning("Only the first 4 tags will be saved.");
    }

    const updatedFormState = {
      ...formState,
      tags: uniqueTags,
    };

    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(updatedFormState)], { type: "application/json" }));

    try {
      const res = await axios.put(`/api/adventures/${updatedFormState.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAdventure(res.data);
      setFormState(res.data);
      setEditing(false);
      toast.success("Adventure details saved successfully!");
    } catch (error) {
      console.error("Update adventure details failed", error);
      toast.error("Failed to save adventure details.");
    }
  };

  const handleUploadNewImages = async () => {
    if (!photosToUpload.length || !adventure?.id) return;

    const formData = new FormData();
    photosToUpload.forEach(photo => formData.append("images", photo));

    try {
      await axios.post(`/api/adventures/${adventure.id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedAdventureRes = await axios.get(`/api/adventures/${adventure.id}`);
      setAdventure(updatedAdventureRes.data);
      setFormState(updatedAdventureRes.data);

      setPhotosToUpload([]);
      setUploadingPhotos(false);
      toast.success("Images uploaded successfully!");
    } catch (error) {
      console.error("Image upload failed", error);
      toast.error("Failed to upload images.");
    }
  };

  const allImages = [
    ...(adventure?.imageUrls || []),
    ...photosToUpload.map(file => URL.createObjectURL(file)),
  ];

  const nextImage = () =>
    setSelectedIndex(prev =>
      prev !== null && prev < allImages.length - 1 ? prev + 1 : prev
    );

  const prevImage = () =>
    setSelectedIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev));

  const handleMapClick = (coords: [number, number]) => {
    if (editing) {
      setFormState(prev => ({
        ...prev!,
        longitude: coords[0],
        latitude: coords[1],
      }));
    }
  };

  const handleRatingChange = (newRating: number) => {
    if (editing) {
      setFormState(prev => ({
        ...prev!,
        rating: newRating,
      }));
    }
  };

  const handleDelete = async () => {
    if (!adventure?.id) return;

    try {
      await axios.delete(`/api/adventures/${adventure.id}`);
      toast.success("Adventure deleted successfully!");
      window.location.href = "/adventures"; // Redirect after successful deletion
    } catch (error) {
      console.error("Failed to delete adventure:", error);
      toast.error("Failed to delete adventure.");
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const currentCoordinates = editing
    ? [formState?.longitude, formState?.latitude]
    : [adventure?.longitude, adventure?.latitude];

  const currentRating = editing ? formState?.rating : adventure?.rating;

  if (loading) return <div className="flex items-center justify-center min-h-[50vh] text-xl">Loading adventure...</div>;
  if (error || !adventure)
    return <div className="flex items-center justify-center min-h-[50vh] text-red-500 text-xl">Failed to load adventure.</div>;

  return (
    <motion.div
      className="p-6 space-y-6 max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          {editing ? (
            <Input
              value={formState?.name || ""}
              onChange={e =>
                setFormState(prev => ({ ...prev!, name: e.target.value }))
              }
              className="text-4xl font-bold text-primary mb-1 border-b-2 focus:border-primary-foreground transition-colors"
            />
          ) : (
            <h1 className="text-4xl font-bold text-primary mb-1">✈️ {adventure.name}</h1>
          )}
          <p className="text-sm text-muted-foreground">
            Created at: {format(new Date(adventure.createdAt), "dd MMM yyyy, hh:mm a")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              window.open(
                `https://www.google.com/maps?q=${adventure.latitude},${adventure.longitude}`,
                "_blank"
              )
            }
            className="gap-2"
          >
            <MapPin className="w-4 h-4" /> Google Maps
          </Button>
          <Button
            variant="secondary"
            onClick={() => (editing ? handleSaveAdventureDetails() : setEditing(true))}
            className="gap-1"
          >
            {editing ? <Save className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            {editing ? "Save Details" : "Edit Details"}
          </Button>
          <Button
            variant="default"
            onClick={() => setUploadingPhotos(prev => !prev)}
            className="gap-1"
          >
            <UploadCloud className="w-4 h-4" /> Upload Images
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="w-full rounded-lg overflow-hidden shadow-md"
      >
        <AdventureMap
          coordinates={currentCoordinates as [number, number]}
          onMapClick={handleMapClick}
          isEditable={editing}
        />
      </motion.div>

      <div className="flex justify-between items-center mt-4">
        <p className="text-muted-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4" /> {locationName}
        </p>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Star
                className={clsx("w-5 h-5 transition-colors duration-200", {
                  "text-yellow-400 fill-yellow-400": i < currentRating!,
                  "text-muted-foreground": i >= currentRating!,
                  "cursor-pointer": editing,
                })}
                onClick={() => handleRatingChange(i + 1)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Tags</h2>
        {editing ? (
          <Input
            value={tagsInput}
            onChange={(e) => {
              const input = e.target.value;
              const sanitized = input.replace(/[^a-zA-Z0-9, ]/g, ""); // Allow spaces for better user experience while typing
              setTagsInput(sanitized);
            }}
            onBlur={() => { // Process tags on blur
              const tagsArray = tagsInput
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag !== "");

              const uniqueTags = Array.from(new Set(tagsArray)).slice(0, 4); // Enforce limit here
              if (tagsArray.length > 4) {
                 toast.warning("Tags are limited to 4. Excess tags were removed.");
              }

              setFormState((prev) => ({
                ...prev!,
                tags: uniqueTags,
              }));
              // Update tagsInput to reflect the cleaned and limited tags
              setTagsInput(uniqueTags.join(", "));
            }}
            placeholder="Tags (comma separated, max 4)"
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {adventure.tags.map(tag => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge variant="outline" className="px-3 py-1 text-sm rounded-full">
                    {tag}
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="py-4">
        <h2 className="text-lg font-semibold mb-2">Description</h2>
        {editing ? (
          <textarea
            className="w-full border p-3 rounded-lg min-h-[120px] focus:ring-2 focus:ring-primary-foreground transition-all"
            value={formState?.description || ""}
            onChange={e =>
              setFormState(prev => ({ ...prev!, description: e.target.value }))
            }
            placeholder="Write your adventure description here..."
          />
        ) : (
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{adventure.description}</p>
        )}
      </div>

      <AnimatePresence>
        {uploadingPhotos && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 p-4 border rounded-lg bg-card shadow-sm"
          >
            <h2 className="text-lg font-semibold">Add New Images</h2>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={e => {
                if (e.target.files) {
                  setPhotosToUpload(Array.from(e.target.files));
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleUploadNewImages}
                disabled={photosToUpload.length === 0}
                className="gap-2"
              >
                <UploadCloud className="w-4 h-4" /> Upload Selected Images
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setUploadingPhotos(false);
                  setPhotosToUpload([]);
                }}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="py-4">
        <h2 className="text-lg font-semibold mb-2">Gallery</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {allImages.length > 0 ? (
            allImages.map((src, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  onClick={() => setSelectedIndex(idx)}
                  className="cursor-pointer overflow-hidden aspect-video relative group"
                >
                  <CardContent className="p-0">
                    <img
                      src={src}
                      alt={`Adventure Image ${idx}`}
                      className="w-full h-full object-cover rounded transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-sm">View</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <p className="text-muted-foreground col-span-full">No images added yet.</p>
          )}
        </div>
      </div>

      <Dialog.Root open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50 animate-in fade-in-0" />
          <Dialog.Content
            className="fixed inset-0 flex items-center justify-center z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            ref={viewerRef}
          >
            <Dialog.Title>
              <VisuallyHidden>Image Viewer</VisuallyHidden>
            </Dialog.Title>
            {selectedIndex !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative max-w-4xl w-full max-h-screen"
              >
                <img
                  src={allImages[selectedIndex]}
                  alt="Selected"
                  className="max-h-[90vh] max-w-[95vw] object-contain mx-auto"
                />
                <Button
                  variant="ghost"
                  className="absolute top-4 right-4 text-white hover:bg-white/10"
                  onClick={() => setSelectedIndex(null)}
                >
                  <X className="w-6 h-6" />
                </Button>
                <div className="absolute top-1/2 -translate-y-1/2 left-4">
                  <Button variant="ghost" onClick={prevImage} disabled={selectedIndex === 0}>
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </Button>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-4">
                  <Button
                    variant="ghost"
                    onClick={nextImage}
                    disabled={selectedIndex === allImages.length - 1}
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </Button>
                </div>
              </motion.div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="w-[90%] max-w-md rounded-lg p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Confirm Deletion</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-muted-foreground text-sm mt-2">This action cannot be undone. Are you sure you want to delete this adventure permanently?</p>
          <AlertDialogFooter className="mt-6 flex justify-end gap-3">
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}