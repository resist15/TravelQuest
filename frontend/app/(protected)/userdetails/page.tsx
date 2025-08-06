"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { UserRound, Mail, Calendar } from "lucide-react";
import { AxiosError } from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface UserInfo {
  name: string;
  email: string;
  joinedAt: string;
}

export default function UserDetailsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
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

        const { name, email, joinedAt } = res.data;
        setUser({ name, email, joinedAt });
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
    <main className="max-w-xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <UserRound className="w-6 h-6" />
        User Details
      </h1>

      <div className="space-y-4 text-lg">
        <div className="flex items-center gap-2">
          <UserRound className="w-5 h-5 text-blue-500" />
          <span className="font-medium">Name:</span> {user.name}
        </div>

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
    </main>
  );
}
