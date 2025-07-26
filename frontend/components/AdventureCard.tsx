"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
type Adventure = {
  name: string;
  imageUrls: string[];
  tags: string[];
  location: string;
  latitude: number;
  longitude: number;
};

type AdventureCardProps = {
  adventure: Adventure;
};

export default function AdventureCard({ adventure }: AdventureCardProps) {
  const [locationName, setLocationName] = useState<string>("");

  const fetchLocationName = useCallback(async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://api.maptiler.com/geocoding/${lon},${lat}.json?key=hCWgkMCmHCAFZw9YCnLa`
      );
      const data = await res.json();
      const place = data?.features?.[5]?.place_name || "Unknown location";

      setLocationName(place);
    } catch (err) {
      console.error("Failed to reverse geocode:", err);
      setLocationName("Unknown location");
    }
  }, []);

  useEffect(() => {
    if (adventure.latitude && adventure.longitude) {
      fetchLocationName(adventure.latitude, adventure.longitude);
    }
  }, [adventure.latitude, adventure.longitude, fetchLocationName]);

  const coverImageUrl =
    adventure.imageUrls && adventure.imageUrls.length > 0
      ? adventure.imageUrls[0]
      : "/placeholder-adventure.jpg";

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
      {/* Check if a valid image URL exists */}
      {coverImageUrl && coverImageUrl !== "/placeholder-adventure.jpg" ? (
        <Image
          src={coverImageUrl}
          alt={adventure.name}
          width={600}
          height={200}
          className="w-full h-40 object-cover"
          priority
        />
      ) : (
        <div className="h-40 bg-gradient-to-r from-green-400 to-blue-400 flex items-center justify-center text-sm text-white">
          No image found
        </div>
      )}
      <div className="p-4 space-y-2 flex-grow">
        <h3 className="text-lg font-semibold">{adventure.name}</h3>
        <div className="flex flex-wrap gap-1 text-xs">
          {adventure.tags.map((tag: string, idx: number) => (
            <span key={idx} className="px-2 py-0.5 rounded-full bg-secondary">
              {tag}
            </span>
          ))}
        </div>
        {/* Display the fetched location name */}
        <p className="text-muted-foreground text-sm">📍 {locationName}</p>
      </div>
    </div>
  );
}
