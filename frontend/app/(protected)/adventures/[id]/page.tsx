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

  const handleSaveAdventureDetails = async () => {
    if (!formState) return;

    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(formState)], { type: "application/json" }));

    try {
      const res = await axios.put(`/api/adventures/${formState.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAdventure(res.data);
      setFormState(res.data);
      setEditing(false);
    } catch (error) {
      console.error("Update adventure details failed", error);
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
    } catch (error) {
      console.error("Image upload failed", error);
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
      window.location.href = "/adventures";
    } catch (error) {
      console.error("Failed to delete adventure:", error);
      alert("Failed to delete adventure.");
    }
  };

  const currentCoordinates = editing
    ? [formState?.longitude, formState?.latitude]
    : [adventure?.longitude, adventure?.latitude];

  const currentRating = editing ? formState?.rating : adventure?.rating;

  if (loading) return <div className="p-6">Loading...</div>;
  if (error || !adventure)
    return <div className="p-6 text-red-500">Failed to load adventure.</div>;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          {editing ? (
            <Input
              value={formState?.name || ""}
              onChange={e =>
                setFormState(prev => ({ ...prev!, name: e.target.value }))
              }
              className="text-4xl font-bold text-primary mb-1"
            />
          ) : (
            <h1 className="text-4xl font-bold text-primary mb-1">✈️ {adventure.name}</h1>
          )}
          <p className="text-sm text-muted-foreground">
            Created at: {format(new Date(adventure.createdAt), "dd MMM yyyy, hh:mm a")}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
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

      <AdventureMap
        coordinates={currentCoordinates as [number, number]}
        onMapClick={handleMapClick}
        isEditable={editing}
      />

      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">📍🗺️ {locationName}</p>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={clsx("w-4 h-4", {
                "text-yellow-400 fill-yellow-400": i < currentRating!,
                "text-muted": i >= currentRating!,
                "cursor-pointer": editing,
              })}
              onClick={() => handleRatingChange(i + 1)}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Tags</h2>
        {editing ? (
          <Input
            value={formState?.tags.join(",") || ""}
            onChange={e =>
              setFormState(prev => ({
                ...prev!,
                tags: e.target.value
                  .split(",")
                  .map(tag =>
                    tag
                      .replace(/\s/g, "") // remove spaces
                      .replace(/[^a-zA-Z0-9]/g, "") // only alphanumeric
                  )
                  .filter(Boolean),
              }))
            }
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {adventure.tags.map(tag => (
              <Badge variant="outline" key={tag}>
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Description</h2>
        {editing ? (
          <textarea
            className="w-full border p-2 rounded"
            value={formState?.description || ""}
            onChange={e =>
              setFormState(prev => ({ ...prev!, description: e.target.value }))
            }
          />
        ) : (
          <p className="text-muted-foreground leading-relaxed">{adventure.description}</p>
        )}
      </div>

      {uploadingPhotos && (
        <div className="space-y-4 p-4 border rounded-lg bg-card">
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
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-2">Gallery</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {allImages.map((src, idx) => (
            <Card
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className="cursor-pointer overflow-hidden hover:ring-2 ring-primary"
            >
              <CardContent className="p-0">
                <img
                  src={src}
                  alt={`Adventure Image ${idx}`}
                  className="w-full h-32 object-cover rounded"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      <Dialog.Root open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
          <Dialog.Content
            className="fixed inset-0 flex items-center justify-center z-50"
            ref={viewerRef}
          >
            <Dialog.Title>
              <VisuallyHidden>Image Viewer</VisuallyHidden>
            </Dialog.Title>
            {selectedIndex !== null && (
              <div className="relative max-w-4xl w-full max-h-screen">
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
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Adventure</AlertDialogTitle>
          </AlertDialogHeader>
          <p>This action cannot be undone. Are you sure you want to delete this adventure?</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
