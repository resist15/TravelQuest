"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { MapPin, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdventureMap from "@/components/AdventureMap";
import axios from "@/lib/axios";
import { format } from "date-fns";
import clsx from "clsx";
import { toast } from "react-toastify";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import { NextJsImage, NextJsThumbnail } from "@/components/NextJsImage";
import dynamic from "next/dynamic";
import { isAxiosError } from "axios";
import { AdventurePublicDTO } from "@/types/AdventurePublicDTO";
import LikeButton from "@/components/LikeButton";

export default function AdventureDetails() {
  const Lightbox = dynamic(() => import("yet-another-react-lightbox"), { ssr: false });

  const { id } = useParams();
  const [adventure, setAdventure] = useState<AdventurePublicDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [brokenImageUrls, setBrokenImageUrls] = useState<Set<string>>(new Set());
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  useEffect(() => {
    const fetchAdventure = async () => {
      try {
        const res = await axios.get(`/api/adventures/feed/${id}`);
        setAdventure(res.data);
        setBrokenImageUrls(new Set());
        setCoordinates([res.data.longitude, res.data.latitude]);
        console.log(res.data.likedByCurrentUser);
      } catch (err: unknown) {
        let msg = "Failed fetching adventure";
        if (isAxiosError(err)) {
          msg = err.response?.data?.message || msg;
          toast.error(msg);
        }
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAdventure();
  }, [id]);
  const handleImageError = useCallback((url: string) => {
    setBrokenImageUrls((prev) => new Set(prev).add(url));
  }, []);

  const validAdventureImageUrls = (adventure?.imageUrls || []).filter(
    (url) => !brokenImageUrls.has(url)
  );

  const allImages = [...validAdventureImageUrls];

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
          <h1 className="text-4xl font-bold text-primary mb-2">✈️ {adventure.name}</h1>
          <p className="text-sm text-muted-foreground pb-1">
            Created at: {format(new Date(adventure.createdAt), "dd MMM yyyy, hh:mm a")}
          </p>
          <p className="text-sm text-muted-foreground font-semibold">
            👤 -{'>'} {adventure.author}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
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
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="w-full rounded-lg overflow-hidden shadow-md"
      >
        {coordinates && <AdventureMap coordinates={coordinates} />}

      </motion.div>

      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-4">
          <LikeButton
            adventureId={adventure.id}
            initialLikes={adventure.likesCount}
            initiallyLiked={adventure.likedByCurrentUser}
          />
          <p className="text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" /> {adventure.location}
          </p>
        </div>
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
                  "text-yellow-400 fill-yellow-400": i < adventure.rating!,
                  "text-muted-foreground": i >= adventure.rating!,
                })}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Tags</h2>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {adventure.tags.map((tag) => (
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
      </div>

      <div className="py-4">
        <h2 className="text-lg font-semibold mb-2">Description</h2>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {adventure.description}
        </p>
      </div>

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
                  onClick={() => setSelectedIndex(idx)}
                  className="cursor-pointer overflow-hidden aspect-video relative group"
                >
                  <CardContent className="p-0">
                    <img
                      src={src}
                      alt={`Adventure Image ${idx}`}
                      className="w-full h-full object-cover rounded transition-transform duration-300 group-hover:scale-105"
                      onError={() => handleImageError(src)}
                    />
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
        slides={allImages.map((src) => ({ src }))}
        carousel={{ finite: true, imageFit: "cover" }}   // 🔑 this removes borders
        render={{ slide: NextJsImage, thumbnail: NextJsThumbnail }}
        plugins={[Zoom, Thumbnails]}
      />
    </motion.div>
  );
}
