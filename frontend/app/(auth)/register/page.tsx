"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "@/lib/axios";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    profilePicture: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("/api/users/register", form);
      // localStorage.setItem("jwt", res.data.token);
      router.push("/login");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md space-y-6 p-6 bg-card rounded-xl shadow">
        <h1 className="text-2xl font-bold">Register</h1>

        {error && (
          <p className="text-sm text-red-500 border border-red-500 rounded p-2">
            {error}
          </p>
        )}

        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={form.name} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="profilePicture">Profile Picture URL (optional)</Label>
          <Input
            id="profilePicture"
            name="profilePicture"
            value={form.profilePicture}
            onChange={handleChange}
          />
        </div>

        <Button className="w-full" onClick={handleRegister} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </Button>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <a href="/login" className="underline text-primary">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
