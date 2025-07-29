"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdventuresPaginated } from "../../lib/adventureService"; 
//import { getAdventuresPaginated } from "@/lib/adventureService";
import { AdventureDTO } from "@/types/AdventureDTO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function MyAdventuresPage() {
  const router = useRouter();
  const [adventures, setAdventures] = useState<AdventureDTO[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchAdventures(page);
  }, [page]);

  const fetchAdventures = async (pageNumber: number) => {
    try {
      const res = await getAdventuresPaginated(pageNumber, 6);
      setAdventures(res.content|| []);
      setTotalPages(res.totalPages|| 0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Adventures</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adventures.map((adv) => (
          <Card key={adv.id} className="overflow-hidden">
            <img
              src={adv.imageUrls?.[0] || "https://via.placeholder.com/400"}
              alt={adv.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{adv.name}</h3>
              <p className="text-sm text-muted-foreground">📍 {adv.location}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {adv.tags?.map((tag, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs border-muted-foreground"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center gap-4 mt-6">
        <Button
          onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          disabled={page === 0}
        >
          Previous
        </Button>
        <span className="self-center">
          Page {page + 1} of {totalPages}
        </span>
        <Button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
          disabled={page >= totalPages - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
