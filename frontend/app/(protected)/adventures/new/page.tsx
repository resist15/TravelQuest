"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import clsx from "clsx";

export default function NewAdventurePage() {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [name, setName] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
      center: [78.9629, 20.5937],
      zoom: 4,
    });

    mapRef.current = map;

    const observer = new ResizeObserver(() => map.resize());
    observer.observe(mapContainerRef.current);

    map.on("click", (e) => {
      const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      setSelectedLocation(coords);
      placeMarker(coords, map);
    });

    return () => {
      map.remove();
      observer.disconnect();
    };
  }, []);

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
      () => toast.error("Unable to access location.")
    );
  };

  const handleSearchChange = async (value: string) => {
    setSearchQuery(value);
    if (value.length < 3) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(value)}.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
      );
      const data = await res.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const selectSearchResult = (place: any) => {
    const [lng, lat] = place.geometry.coordinates;
    setSelectedLocation([lng, lat]);
    setSearchQuery(place.place_name || place.text || "");
    setSearchResults([]);
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 12 });
      placeMarker([lng, lat], mapRef.current);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !tagsInput || !selectedLocation) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => /^[a-zA-Z0-9]+$/.test(tag));
    if (tags.length === 0) {
      toast.error("Please provide valid alphanumeric tags (no spaces or symbols).");
      return;
    }

    const [lng, lat] = selectedLocation;
    const payload = {
      name,
      description,
      link: "",
      location: `${lat},${lng}`,
      latitude: lat,
      longitude: lng,
      rating,
      tags,
    };

    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));

    try {
      await axios.post("/api/adventures", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push("/adventures");
      toast.success("Adventure added!");
    } catch (err) {
      console.error(err);
      toast.error("Error adding adventure.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Add New Adventure</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name*" required />

        <Input
          value={tagsInput}
          onChange={(e) => {
            const input = e.target.value;
            const sanitized = input.replace(/[^a-zA-Z0-9,]/g, "");
            setTagsInput(sanitized);
          }}
          placeholder="Tags (comma separated, alphanumeric only)*"
          required
        />

        {/* Rating */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={clsx("w-5 h-5 cursor-pointer transition-colors", {
                "text-yellow-400 fill-yellow-400": i < rating,
                "text-muted": i >= rating,
              })}
              onClick={() => setRating(i + 1)}
            />
          ))}
        </div>

        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          rows={4}
        />

        {/* Search Box */}
        <div className="relative">
          <Input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search for a location..."
          />
          {searchResults.length > 0 && (
            <ul className="absolute z-10 bg-background border rounded mt-1 w-full max-h-60 overflow-y-auto shadow-lg">
              {searchResults.map((place) => (
                <li
                  key={place.id}
                  onClick={() => selectSearchResult(place)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {place.place_name || place.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Location Map */}
        <div className="space-y-2">
          <Button type="button" variant="outline" onClick={handleUseCurrentLocation} className="w-full">
            Use My Current Location 📍
          </Button>

          {selectedLocation && (
            <p className="text-sm text-muted-foreground text-center">
              Latitude: {selectedLocation[1].toFixed(4)}, Longitude: {selectedLocation[0].toFixed(4)}
            </p>
          )}

          <div ref={mapContainerRef} className="w-full h-64 rounded border border-muted" />
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Adventure"}
        </Button>
      </form>
    </div>
  );
}
