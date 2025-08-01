"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import axios from "@/lib/axios";
import { AdventureDTO } from "@/types/AdventureDTO";
import { toast } from "react-toastify";

export default function CreateCollectionDialog() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAdventures, setSelectedAdventures] = useState<number[]>([]);
  const [adventures, setAdventures] = useState<AdventureDTO[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });

  useEffect(() => {
    const fetchAdventures = async () => {
      try {
        const res = await axios.get("/api/adventures?unassignedOnly=true");
        setAdventures(res.data);
      } catch (err) {
        console.error("Failed to fetch adventures", err);
      }
    };
    fetchAdventures();
  }, []);

  const toggleSelect = (id: number) => {
    setSelectedAdventures((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    const payload = {
      ...formData,
      startDate: formData.startDate?.toISOString(),
      endDate: formData.endDate?.toISOString(),
      existingAdventureIds: selectedAdventures,
    };
    console.log(payload)
    try {
      await axios.post("/api/collections", payload);
      toast.success("Collection created!");

      setFormData({
        name: "",
        description: "",
        startDate: undefined,
        endDate: undefined,
      });

      setSelectedAdventures([]);
      setStep(1);

      const res = await axios.get("/api/adventures?unassignedOnly=true");
      setAdventures(res.data);
    } catch (err) {
      console.error("Failed to create collection", err);
      toast.error("Collection created!");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>+ Add New Collection</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Select Adventures</DialogTitle>
              <DialogDescription>
                Choose at least one adventure to include in this collection.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-64 overflow-y-auto mt-2">
              {adventures.map((adv) => (
                <div
                  key={adv.id}
                  className="flex items-center justify-between border rounded-lg px-3 py-2"
                >
                  <span>{adv.name}</span>
                  <Checkbox
                    checked={selectedAdventures.includes(adv.id)}
                    onCheckedChange={() => toggleSelect(adv.id)}
                  />
                </div>
              ))}
            </div>
              <Button
                className="mt-4 w-full"
                disabled={selectedAdventures.length === 0}
                onClick={() => setStep(2)}
              >
              Continue
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Collection Details</DialogTitle>
              <DialogDescription>
                Provide information for your new collection.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Input
                placeholder="Collection name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <Textarea
                placeholder="Short description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <DatePicker
                  date={formData.startDate}
                  setDate={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      startDate: date,
                    }))
                  }
                  placeholder="Start Date"
                />
                <DatePicker
                  date={formData.endDate}
                  setDate={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      endDate: date,
                    }))
                  }
                  placeholder="End Date"
                />
              </div>
              <div className="flex gap-2 justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-1/2"
                >
                  ← Back
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!formData.name.trim()}
                  className="w-1/2"
                >
                  Create
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );  
}