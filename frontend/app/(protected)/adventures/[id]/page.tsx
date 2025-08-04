"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  X,
  MapPin,
  Star,
  Pencil,
  Save,
  UploadCloud,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import { toast } from "react-toastify";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";

import NextJsImage from "@/components/NextJsImage";
import dynamic from "next/dynamic";

export default function AdventureDetails() {
  const Lightbox = dynamic(() => import("yet-another-react-lightbox"), { ssr: false });

  const { id } = useParams();
  const [adventure, setAdventure] = useState<AdventureDTO | null>(null);
  const [formState, setFormState] = useState<AdventureDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [photosToUpload, setPhotosToUpload] = useState<File[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tagsInput, setTagsInput] = useState<string>("");
  const [brokenImageUrls, setBrokenImageUrls] = useState<Set<string>>(new Set());
  const tagsInputRef = useRef<HTMLInputElement>(null);

  // New state for image deletion
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [showImageDeleteDialog, setShowImageDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchAdventure = async () => {
      try {
        const res = await axios.get(`/api/adventures/${id}`);
        setAdventure(res.data);
        setFormState(res.data);
        setBrokenImageUrls(new Set());
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAdventure();
  }, [id]);

  useEffect(() => {
    if (editing && tagsInputRef.current) {
      tagsInputRef.current.focus();
    }
  }, [editing]);

  const commitTag = useCallback(() => {
    const tagToCommit = tagsInput.trim().replace(/[^a-zA-Z0-9 ]/g, "");
    if (!tagToCommit) {
      setTagsInput("");
      return;
    }

    setFormState(prev => {
      const currentTags = prev?.tags ? [...prev.tags] : [];

      if (currentTags.length >= 4 && !currentTags.includes(tagToCommit)) {
        toast.warning("You can add a maximum of 4 tags.");
        setTagsInput("");
        return prev;
      }

      if (!currentTags.includes(tagToCommit)) {
        const updatedTags = [...currentTags, tagToCommit];
        if (updatedTags.length > 4) {
          toast.warning("Tags are limited to 4. Excess tags were ignored.");
        }
        setTagsInput("");
        return { ...prev!, tags: updatedTags.slice(0, 4) };
      } else {
        toast.info(`Tag '${tagToCommit}' already exists.`);
        setTagsInput("");
        return prev;
      }
    });
  }, [tagsInput]);

  const handleTagInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const sanitized = input.replace(/[^a-zA-Z0-9, ]/g, "");

    if (sanitized.endsWith(",")) {
      setTagsInput(sanitized.slice(0, -1));
      commitTag();
    } else {
      setTagsInput(sanitized);
    }
  }, [commitTag]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitTag();
    }
    if (e.key === "Backspace" && tagsInput === "" && formState?.tags && formState.tags.length > 0) {
      e.preventDefault();
      setFormState(prev => {
        const updatedTags = [...prev!.tags];
        updatedTags.pop();
        return { ...prev!, tags: updatedTags };
      });
    }
  }, [tagsInput, commitTag, formState]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setFormState(prev => {
      if (!prev || !prev.tags) return prev;
      const updatedTags = prev.tags.filter(tag => tag !== tagToRemove);
      return { ...prev, tags: updatedTags };
    });
  }, []);

  const handleSaveAdventureDetails = async () => {
    if (!formState) return;

    if (tagsInput.trim()) {
      commitTag();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const currentState = {
      ...formState,
      tags: formState.tags?.slice(0, 4) || [],
    };

    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(currentState)], { type: "application/json" }));

    try {
      const res = await axios.put(`/api/adventures/${currentState.id}`, formData, {
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
      setBrokenImageUrls(new Set());
    } catch (error) {
      console.error("Image upload failed", error);
      toast.error("Failed to upload images.");
    }
  };

  const handleImageError = useCallback((url: string) => {
    setBrokenImageUrls(prev => new Set(prev).add(url));
    // toast.error(`Image failed to load: ${url.substring(0, 50)}...`);
  }, []);

  const validAdventureImageUrls = (adventure?.imageUrls || []).filter(
    (url) => !brokenImageUrls.has(url)
  );

  const allImages = [
    ...validAdventureImageUrls,
    ...photosToUpload.map(file => URL.createObjectURL(file)),
  ];

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
      window.location.href = "/adventures";
    } catch (error) {
      console.error("Failed to delete adventure:", error);
      toast.error("Failed to delete adventure.");
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!imageToDelete || !adventure?.id) return;

    try {
      // await axios.delete(`/api/adventures/${adventure.id}/${imageToDelete}`);
      await axios.delete(`/api/adventures/image/${adventure.id}?imageUrl=${encodeURIComponent(imageToDelete)}`);

      const updatedAdventureRes = await axios.get(`/api/adventures/${adventure.id}`);
      setAdventure(updatedAdventureRes.data);
      setFormState(updatedAdventureRes.data);
      toast.success("Image deleted successfully!");
    } catch (error) {
      console.error("Failed to delete image:", error);
      toast.error("Failed to delete image.");
    } finally {
      setShowImageDeleteDialog(false);
      setImageToDelete(null);
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
            Delete Adventure
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
          <MapPin className="w-4 h-4" /> {adventure.location}
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
          <div className="flex flex-wrap items-center gap-2 border rounded-md p-2 min-h-[40px] focus-within:ring-2 focus-within:ring-primary-foreground transition-all">
            <AnimatePresence>
              {(formState?.tags || []).map(tag => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex items-center bg-secondary text-secondary-foreground rounded-full pl-3 pr-1 py-1 text-sm whitespace-nowrap"
                >
                  {tag}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-1 rounded-full hover:bg-secondary/80"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            <Input
              ref={tagsInputRef}
              value={tagsInput}
              onChange={handleTagInputChange}
              onKeyDown={handleKeyDown}
              onBlur={commitTag}
              placeholder={
                (formState?.tags || []).length < 4
                  ? "Add tags (comma or Enter to commit)"
                  : "Max 4 tags reached"
              }
              disabled={(formState?.tags || []).length >= 4}
              className="flex-1 min-w-[150px] border-none focus-visible:ring-0 shadow-none bg-transparent"
            />
          </div>
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
                key={src + idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  // Changed onClick to only open lightbox if not in editing mode
                  onClick={() => !editing && setSelectedIndex(idx)}
                  className="cursor-pointer overflow-hidden aspect-video relative group"
                >
                  <CardContent className="p-0">
                    <img
                      src={src}
                      alt={`Adventure Image ${idx}`}
                      className="w-full h-full object-cover rounded transition-transform duration-300 group-hover:scale-105"
                      onError={() => handleImageError(src)}
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      {!editing ? (
                        <span className="text-white text-sm">View</span>
                      ) : (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent opening lightbox
                            setImageToDelete(src);
                            setShowImageDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
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
      <Lightbox
        open={selectedIndex !== null}
        close={() => setSelectedIndex(null)}
        index={selectedIndex ?? 0}
        slides={allImages.map((src) => ({
          src
        }))}
        carousel={{ finite: true }}
        render={{ slide: NextJsImage, thumbnail: NextJsImage }}
        plugins={[Zoom, Thumbnails]}
      />


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

      {/* New AlertDialog for image deletion confirmation */}
      <AlertDialog open={showImageDeleteDialog} onOpenChange={setShowImageDeleteDialog}>
        <AlertDialogContent className="w-[90%] max-w-md rounded-lg p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Delete Image?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-muted-foreground text-sm mt-2">Are you sure you want to delete this image? This action cannot be undone.</p>
          <AlertDialogFooter className="mt-6 flex justify-end gap-3">
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={handleDeleteImage}>Delete Image</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}