"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { UserRound, Mail, Calendar, Upload, Pencil } from "lucide-react";
import { AxiosError } from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // shadcn input
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import Cropper from "react-easy-crop";

interface UserInfo {
  name: string;
  email: string;
  joinedAt: string;
  profilePicture?: string;
}

export default function UserDetailsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [updatingName, setUpdatingName] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await api.get("/api/users/me");
        setUser(res.data);
        setNameInput(res.data.name);
      } catch (err) {
        if (err instanceof AxiosError && err.response?.status === 401) {
          router.push("/login");
        } else {
          console.error("Failed to fetch user:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const onCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const getCroppedImage = async (): Promise<Blob | null> => {
    if (!imageSrc || !croppedAreaPixels) return null;

    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg");
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setOpenDialog(true);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmUpload = async () => {
    try {
      setUploading(true);
      const croppedBlob = await getCroppedImage();
      if (!croppedBlob) return;

      const formData = new FormData();
      formData.append("file", croppedBlob, "profile.jpg");

      await api.post("/api/users/uploadProfile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const res = await api.get("/api/users/me");
      setUser(res.data);
      setOpenDialog(false);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!nameInput.trim() || !user) return;

    try {
      setUpdatingName(true);
      await api.patch(`/api/users/me/name?name=${encodeURIComponent(nameInput)}`);
      setUser({ ...user, name: nameInput });
      setEditingName(false);
    } catch (err) {
      console.error("Failed to update name:", err);
    } finally {
      setUpdatingName(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-xl mx-auto px-6 py-12 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-6 w-1/2" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-xl mx-auto px-6 py-12">
        <p className="text-lg text-red-500">Failed to load user details.</p>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-12 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <UserRound className="w-6 h-6" />
        User Details
      </h1>

      {/* Profile Picture */}
      <div className="flex items-center gap-4">
        {user.profilePicture ? (
          <img
            src={user.profilePicture}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            <UserRound className="w-12 h-12" />
          </div>
        )}
        <div>
          <label>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button asChild disabled={uploading}>
              <span className="flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload New Picture"}
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Name Update with Pencil */}
      <div className="flex items-center gap-2">
        <span className="font-medium">Name:</span>
        {!editingName ? (
          <div className="flex items-center gap-2">
            <span>{user.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setEditingName(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="h-8 max-w-xs"
            />
            <Button size="sm" onClick={handleUpdateName} disabled={updatingName}>
              {updatingName ? "Saving..." : "Save"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setEditingName(false);
                setNameInput(user.name);
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Other Info */}
      <div className="space-y-3 text-lg">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-green-500" />
          <span className="font-medium">Email:</span> {user.email}
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-500" />
          <span className="font-medium">Joined:</span>
          <p>{format(new Date(user.joinedAt), "dd MMM yyyy")}</p>
        </div>
      </div>

      {/* Crop + Confirm Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crop & Confirm</DialogTitle>
          </DialogHeader>

          <div className="relative w-full h-64 bg-gray-100">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmUpload} disabled={uploading}>
              {uploading ? "Uploading..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
