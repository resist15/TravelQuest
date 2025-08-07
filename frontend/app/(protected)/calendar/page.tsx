"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { AdventureDTO } from "@/types/AdventureDTO";
import axios from "@/lib/axios";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CalendarPage() {
  const [adventures, setAdventures] = useState<AdventureDTO[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [filteredAdventures, setFilteredAdventures] = useState<AdventureDTO[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchAdventures = async () => {
      try {
        const res = await axios.get<AdventureDTO[]>("/api/adventures");
        setAdventures(res.data);
      } catch (err) {
        console.error("Failed to fetch adventures", err);
      }
    };

    fetchAdventures();
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setFilteredAdventures([]);
      return;
    }

    const selected = format(selectedDate, "yyyy-MM-dd");
    const filtered = adventures.filter((adv) =>
      format(new Date(adv.createdAt), "yyyy-MM-dd") === selected
    );
    setFilteredAdventures(filtered);
  }, [selectedDate, adventures]);

  const recentAdventures = adventures
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const getMarkedDates = () =>
    new Set(adventures.map((adv) => format(new Date(adv.createdAt), "yyyy-MM-dd")));

  const markedDates = getMarkedDates();

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      {/* Left Column */}
      <div className="w-full lg:w-1/3 space-y-4">
        <h2 className="text-xl font-semibold">Recent Adventures</h2>
        {recentAdventures.map((adv) => (
          <motion.div
            key={adv.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.05 }}
            onClick={() => router.push(`/adventures/${adv.id}`)}
            className="cursor-pointer rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-all"
          >
            <Image
              src={adv.imageUrls[0] || "/adventure_place.webp"}
              alt={adv.name}
              width={500}
              height={300}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-medium">{adv.name}</h3>
              <p className="text-muted-foreground text-sm">🌎 {adv.location}</p>
              <p className="text-xs text-gray-500 mt-1">{format(new Date(adv.createdAt), "PPP")}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Right Column */}
      <div className="w-full lg:w-2/3 space-y-4">
        <h2 className="text-xl font-semibold">Adventure Calendar</h2>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="hidden lg:block rounded-xl border p-4 sm:p-6 w-full"
          classNames={{
            table: "w-full table-fixed",
            head_cell: "text-sm font-semibold text-center",
            day: "h-10 w-10 sm:h-21 sm:w-21 m-2 md:h-full md:w-full flex items-center justify-center rounded-md text-sm hover:bg-muted/50 transition",
          }}
          modifiers={{
            hasAdventure: (date) => markedDates.has(format(date, "yyyy-MM-dd")),
          }}
          modifiersClassNames={{
            hasAdventure: "bg-green-300 text-black font-bold ring-2 ring-green-600"
          }}
        />

        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="lg:hidden rounded-xl border p-4 sm:p-6 w-full"
          classNames={{
            table: "w-full",
            head_cell: "text-sm font-semibold text-center",
            day: "h-10 w-10 md:h-12 md:w-12 p-1 flex items-center justify-center rounded-md text-sm hover:bg-muted/50 transition-colors",
            cell: "p-0",
          }}
          modifiers={{
            hasAdventure: (date) => markedDates.has(format(date, "yyyy-MM-dd")),
          }}
          modifiersClassNames={{
            hasAdventure: "bg-green-300 text-black font-bold ring-2 ring-green-600"
          }}
        />

        {selectedDate && (
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-medium">
              Adventures on {format(selectedDate, "PPP")}:
            </h3>
            {filteredAdventures.length === 0 ? (
              <p className="text-sm text-muted-foreground">No adventures found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredAdventures.map((adv) => (
                  <motion.div
                    key={adv.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.05 }}
                    onClick={() => router.push(`/adventures/${adv.id}`)}
                    className="cursor-pointer rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-all"
                  >
                    <Image
                      src={adv.imageUrls[0] || "/adventure_place.webp"}
                      alt={adv.name}
                      width={500}
                      height={300}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-3">
                      <h4 className="text-base font-medium">{adv.name}</h4>
                      <p className="text-sm text-muted-foreground">  🌎 {adv.location}
                      </p>
                    </div>
                  </motion.div>
                ))}

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
