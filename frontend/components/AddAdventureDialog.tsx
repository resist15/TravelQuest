"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";

export default function AddAdventureDialog() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(0);
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

useEffect(() => {
  if (!dialogOpen || !mapContainerRef.current) return;

  const map = new maplibregl.Map({
    container: mapContainerRef.current,
    style: "https://api.maptiler.com/maps/streets/style.json?key=hCWgkMCmHCAFZw9YCnLa",
    center: [78.9629, 20.5937],
    zoom: 4,
  });

  mapRef.current = map;

  const observer = new ResizeObserver(() => {
    map.resize();
  });

  observer.observe(mapContainerRef.current);

  return () => {
    map.remove();
    mapRef.current = null;
    observer.disconnect();
  };
}, [dialogOpen]);


  const placeMarker = (coords: [number, number], map: maplibregl.Map) => {
    if (markerRef.current) markerRef.current.remove();
    markerRef.current = new maplibregl.Marker().setLngLat(coords).addTo(map);
  };

  const handleUseCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        setSelectedLocation(coords);

        if (mapRef.current) {
          mapRef.current.flyTo({ center: coords, zoom: 12 });
          placeMarker(coords, mapRef.current);
        }
      },
      () => {
        toast.error("Unable to access location.");
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !selectedLocation) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const [lng, lat] = selectedLocation;
    const adventurePayload = {
      name,
      description,
      link,
      location: `${lat},${lng}`,
      latitude: lat,
      longitude: lng,
      rating,
      tags: [category],
    };

    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(adventurePayload)], {
        type: "application/json",
      })
    );

    try {
      const res = await fetch("http://localhost:8080/api/adventures", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt") || ""}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to create adventure");
      toast.success("Adventure added!");

      resetForm();
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Error adding adventure.");
    }
  };

  const resetForm = () => {
    setName("");
    setCategory("");
    setRating(0);
    setLink("");
    setDescription("");
    setSelectedLocation(null);
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogTrigger asChild>
          <Button className="rounded-full px-6 py-3 text-sm font-medium shadow-lg bg-primary text-primary-foreground">
            + Add Adventure
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl bg-background text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Adventure</DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">Name*</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category*</label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 cursor-pointer ${
                      rating >= i ? "text-yellow-500 fill-yellow-500" : "text-muted"
                    }`}
                    onClick={() => setRating(i)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Link</label>
              <Input value={link} onChange={(e) => setLink(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write your markdown here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Location*</label>
              <div className="flex items-center gap-3 mb-2">
                <Button type="button" variant="outline" onClick={handleUseCurrentLocation}>
                  Use My Current Location 📍
                </Button>

                {selectedLocation && (
                  <div className="text-sm text-muted-foreground">
                    {selectedLocation[1].toFixed(4)}, {selectedLocation[0].toFixed(4)}
                  </div>
                )}
              </div>

              <div
                ref={mapContainerRef}
                className="w-full h-64 rounded border"
                style={{ minHeight: "256px" }} // fallback height
              />
            </div>

            <Button type="submit" className="w-full mt-4">
              Submit Adventure
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
