"use client";

import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdventureMap from "@/components/AdventureMap";

interface PageProps {
  params: { id: string };
}

const dummyAdventure = {
  id: "1",
  name: "Sequoia National Park 🌲",
  location: "Tulare County, California, US",
  tags: ["National Park", "Visited", "Private"],
  rating: 4,
  link: "https://maps.google.com",
  description: `Sequoia National Park is a beautiful destination in California,
known for its giant sequoia trees and scenic views. A must-visit spot for nature lovers.`,
};

export default function AdventureDetails({ params }: PageProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
const location: [number, number] = [77.2295, 28.6129]; // [lng, lat]

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos([...photos, ...Array.from(e.target.files)]);
    }
  };

  const closeViewer = () => {
    exitFullscreen();
    setSelectedIndex(null);
  };

  const nextImage = () =>
    setSelectedIndex((prev) =>
      prev !== null && prev < photos.length - 1 ? prev + 1 : prev
    );

  const prevImage = () =>
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && viewerRef.current) {
      viewerRef.current.requestFullscreen();
    } else {
      exitFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex !== null) {
        if (e.key === "ArrowRight") nextImage();
        else if (e.key === "ArrowLeft") prevImage();
        else if (e.key === "Escape") closeViewer();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [selectedIndex]);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 max-w-4xl mx-auto relative">
      <h1 className="text-3xl font-bold mb-2">{dummyAdventure.name}</h1>
      <p className="text-muted-foreground mb-4">{dummyAdventure.location}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {dummyAdventure.tags.map((tag) => (
          <Badge variant="outline" key={tag}>
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={i < dummyAdventure.rating ? "text-yellow-400" : "text-muted"}
          >
            ★
          </span>
        ))}
      </div>

      <a href={dummyAdventure.link} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" className="mb-4">
          🗺️ View on Map
        </Button>
      </a>
      <div>
        <h2 className="font-medium text-lg mb-2">Location</h2>
        <AdventureMap coordinates={location} />
      </div>
      <div>
          <h2 className="font-medium text-lg mb-2">Description</h2>
      <p className="mb-6 leading-relaxed">{dummyAdventure.description}</p>
</div>
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Upload Trip Photos</h2>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          className="bg-background text-foreground"
        />
      </div>

      {photos.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Trip Gallery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((file, idx) => (
              <Card
                key={idx}
                className="cursor-pointer overflow-hidden"
                onClick={() => setSelectedIndex(idx)}
              >
                <CardContent className="p-0">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Trip photo ${idx + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog.Root open={selectedIndex !== null} onOpenChange={closeViewer}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 z-40" />
          <Dialog.Content
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            ref={viewerRef}
          >
            <Dialog.Title>
              <VisuallyHidden>Photo Viewer</VisuallyHidden>
            </Dialog.Title>

            {selectedIndex !== null && (
              <div className="relative flex items-center justify-center w-full h-full">
                {/* Close */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-white hover:text-red-500 z-10"
                  onClick={closeViewer}
                >
                  <X size={24} />
                </Button>

                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 left-2 text-white hover:text-blue-400 z-10"
                  onClick={toggleFullscreen}
                >
                  <Expand size={22} />
                </Button>

                {/* Prev */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 z-10 bg-black/50 hover:bg-black/80 text-white"
                  onClick={prevImage}
                  disabled={selectedIndex === 0}
                >
                  <ChevronLeft size={32} />
                </Button>

                {/* Image */}
                <img
                  ref={imageRef}
                  src={URL.createObjectURL(photos[selectedIndex])}
                  alt="Full View"
                  className="max-h-[90vh] max-w-[95vw] object-contain"
                />

                {/* Next */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 z-10 bg-black/50 hover:bg-black/80 text-white"
                  onClick={nextImage}
                  disabled={selectedIndex === photos.length - 1}
                >
                  <ChevronRight size={32} />
                </Button>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}