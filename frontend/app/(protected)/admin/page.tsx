"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { AdventureDTO } from "@/types/AdventureDTO";
import { CollectionDTO } from "@/types/CollectionDTO";
import { UserResponseDTO } from "@/types/UserDTO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Image from "next/image";

const ITEMS_PER_PAGE = 5;

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState("dashboard");

  const [adventures, setAdventures] = useState<AdventureDTO[]>([]);
  const [collections, setCollections] = useState<CollectionDTO[]>([]);
  const [users, setUsers] = useState<UserResponseDTO[]>([]);

  const [advPage, setAdvPage] = useState(1);
  const [colPage, setColPage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  const [advSearch, setAdvSearch] = useState("");
  const [colSearch, setColSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const role = localStorage.getItem("role");
        if (role !== "ADMIN") {
          router.push("/");
        } else {
          setIsAdmin(true);
          const [adRes, colRes, userRes] = await Promise.all([
            axios.get("/api/admin/adventures"),
            axios.get("/api/admin/collections"),
            axios.get("/api/admin/users"),
          ]);
          setAdventures(adRes.data);
          setCollections(colRes.data);
          setUsers(userRes.data);
        }
      } catch (err) {
        console.error(err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleDelete = async (type: "adventure" | "collection" | "user", id: number) => {
    try {
      await axios.delete(`/api/admin/${type}s/${id}`);
      toast.success(`${type} deleted`);
      if (type === "adventure") setAdventures(prev => prev.filter(a => a.id !== id));
      if (type === "collection") setCollections(prev => prev.filter(c => c.id !== id));
      if (type === "user") setUsers(prev => prev.filter(u => u.id !== id));
    } catch {
      toast.error(`Failed to delete ${type}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const filteredAdventures = adventures.filter(
    a =>
      a.name.toLowerCase().includes(advSearch.toLowerCase()) ||
      a.location.toLowerCase().includes(advSearch.toLowerCase())
  );
  const paginatedAdventures = filteredAdventures.slice(
    (advPage - 1) * ITEMS_PER_PAGE,
    advPage * ITEMS_PER_PAGE
  );

  const filteredCollections = collections.filter(
    c =>
      c.name.toLowerCase().includes(colSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(colSearch.toLowerCase())
  );
  const paginatedCollections = filteredCollections.slice(
    (colPage - 1) * ITEMS_PER_PAGE,
    colPage * ITEMS_PER_PAGE
  );

  const filteredUsers = users.filter(
    u =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * ITEMS_PER_PAGE,
    userPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 p-6 space-y-4">
        <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>
        <nav className="flex flex-col space-y-2">
          {['dashboard', 'adventures', 'collections', 'users'].map(option => (
            <Button
              key={option}
              variant={view === option ? 'default' : 'outline'}
              onClick={() => setView(option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 space-y-6">
        {view === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="p-6"><h3 className="text-lg">Total Adventures</h3><p className="text-3xl font-bold">{adventures.length}</p></CardContent></Card>
            <Card><CardContent className="p-6"><h3 className="text-lg">Total Collections</h3><p className="text-3xl font-bold">{collections.length}</p></CardContent></Card>
            <Card><CardContent className="p-6"><h3 className="text-lg">Total Users</h3><p className="text-3xl font-bold">{users.length}</p></CardContent></Card>
          </div>
        )}

        {view === "adventures" && (
          <div>
            <Input placeholder="Search adventures..." className="mb-4" value={advSearch} onChange={e => { setAdvSearch(e.target.value); setAdvPage(1); }} />
            <div className="grid gap-4">
              {paginatedAdventures.map((a) => (
                <Card key={a.id}>
                  <CardContent className="p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold">{a.name}</h2>
                      <p className="text-sm text-muted-foreground">{a.location}</p>
                      <p className="text-sm mt-1">⭐ {a.rating}</p>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {a.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs bg-muted rounded-full text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="text-xs text-muted-foreground mt-2">
                        Created at: {new Date(a.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2 shrink-0 self-start md:self-center">
                      <Button
                        onClick={() => router.push(`/admin/adventures/${a.id}`)}
                        variant="outline"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete("adventure", a.id)}
                        variant="destructive"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

            </div>
            <PaginationControls page={advPage} total={filteredAdventures.length} setPage={setAdvPage} />
          </div>
        )}

        {view === "collections" && (
          <div>
            <Input placeholder="Search collections..." className="mb-4" value={colSearch} onChange={e => { setColSearch(e.target.value); setColPage(1); }} />
            <div className="grid gap-4">
              {paginatedCollections.map((c) => (
                <Card key={c.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-20 h-20 relative rounded bg-muted overflow-hidden shrink-0">
                      {c.coverImage ? (
                        <Image src={c.coverImage} alt={c.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">No Image</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold">{c.name}</h2>
                      <p className="text-sm text-muted-foreground">{c.description}</p>
                      <p className="text-sm mt-1">🕒 {c.durationInDays} days, 🗺️ {c.adventureCount} adventures</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button onClick={() => router.push(`/admin/collections/${c.id}`)} variant="outline">Edit</Button>
                      <Button onClick={() => handleDelete("collection", c.id)} variant="destructive">Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <PaginationControls page={colPage} total={filteredCollections.length} setPage={setColPage} />
          </div>
        )}

        {view === "users" && (
          <div>
            <Input placeholder="Search users..." className="mb-4" value={userSearch} onChange={e => { setUserSearch(e.target.value); setUserPage(1); }} />
            <div className="grid gap-4">
              {paginatedUsers.map((u) => (
                <Card key={u.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium">{u.name}</h2>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                    </div>
                    <Button onClick={() => handleDelete("user", u.id)} variant="destructive">Delete</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <PaginationControls page={userPage} total={filteredUsers.length} setPage={setUserPage} />
          </div>
        )}
      </main>
    </div>
  );
}

function PaginationControls({ page, total, setPage }: { page: number; total: number; setPage: (page: number) => void }) {
  const maxPage = Math.ceil(total / ITEMS_PER_PAGE);
  return (
    <div className="flex justify-center items-center gap-4 mt-6">
      <Button onClick={() => setPage(Math.max(page - 1, 1))} disabled={page === 1} variant="outline">Previous</Button>
      <span className="text-sm text-muted-foreground">Page {page} of {maxPage}</span>
      <Button onClick={() => setPage(Math.min(page + 1, maxPage))} disabled={page === maxPage} variant="outline">Next</Button>
    </div>
  );
}
