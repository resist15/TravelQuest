"use client";

import { AdventureDTO } from "@/types/AdventureDTO";
import { Star, StarOff } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type AdventureCardProps = {
  adventure: AdventureDTO;
};

export default function AdventureCard({ adventure }: AdventureCardProps) {

  const coverImageUrl =
    adventure.imageUrls && adventure.imageUrls.length > 0
      ? adventure.imageUrls[0]
      : "/adventure_place.webp";

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
      {/* Check if a valid image URL exists */}
      {coverImageUrl || coverImageUrl == "/adventure_place.webp" ? (
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
        <div className="flex flex-wrap gap-1 text-xs mb-3">
          {adventure.tags.map((tag: string, idx: number) => (
            <span key={idx} className="px-2 py-0.5 rounded-full bg-secondary">
              {tag}
            </span>
          ))}
        </div>
        {typeof adventure.rating === "number" && (
          <div className="flex items-center gap-1 text-yellow-500 text-sm">
            {[...Array(5)].map((_, i) =>
              i < Math.floor(adventure.rating) ? (
                <Star key={i} className="fill-yellow-500 text-yellow-500 w-4 h-4" />
              ) : (
                <Star key={i} className="text-yellow-500 w-4 h-4" />
              )
            )}
            {/* <span className="text-muted-foreground ml-1">
              ({adventure.rating.toFixed(1)})
            </span> */}
          </div>
        )}

        {/* Display the fetched location name */}
        <p className="text-muted-foreground text-sm">📍 {adventure.location}</p>
      </div>
    </div>
  );
}
