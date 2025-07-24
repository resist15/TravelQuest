"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface TravelEvent {
  title: string;
  date: Date;
  status: "planned" | "completed";
}

const dummyEvents: TravelEvent[] = [
  { title: "Goa Trip", date: new Date(2025, 6, 25), status: "planned" },
  { title: "Shimla Trek", date: new Date(2025, 6, 20), status: "completed" },
  { title: "Kerala Tour", date: new Date(2025, 6, 27), status: "planned" },
  { title: "Manali Adventure", date: new Date(2025, 6, 20), status: "completed" },
];

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [open, setOpen] = useState(false);

  const eventsForDate = dummyEvents.filter(
    (event) =>
      selectedDate &&
      event.date.toDateString() === selectedDate.toDateString()
  );

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
      <header className="p-4 border-b shadow-sm bg-card">
        <h1 className="text-3xl font-bold text-center">📅 Travel Calendar</h1>
      </header>

      <main className="flex-1 flex justify-center items-center px-2 py-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <div className="w-full max-w-6xl bg-card p-4 rounded-lg shadow-lg">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setOpen(true);
              }}
              className="w-full"
            />
          </div>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Events on {selectedDate?.toDateString()}
              </DialogTitle>
            </DialogHeader>

            {eventsForDate.length > 0 ? (
              eventsForDate.map((event, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border rounded-md p-3 mb-2"
                >
                  <span className="text-sm">{event.title}</span>
                  <Badge variant={event.status === "completed" ? "default" : "secondary"}>
                    {event.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No trips for this date.
              </p>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
