"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ThreeGlobeBackground from "@/app/components/ThreeGlobeBackground";
import { motion } from "framer-motion";
import Link from "next/link";
import axios from "@/lib/axios";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";

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

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: (document.getElementById("name") as HTMLInputElement)?.value || prev.name,
      email: (document.getElementById("email") as HTMLInputElement)?.value || prev.email,
      password: (document.getElementById("password") as HTMLInputElement)?.value || prev.password,
    }));
  }, []);

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push("at least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("an uppercase letter");
    if (!/[0-9]/.test(password)) errors.push("a number");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("a special character");
    return errors;
  };

  const handleRegister = async () => {
    setError("");

    const passErrors = validatePassword(form.password);
    if (passErrors.length > 0) {
      setError(`Password must contain ${passErrors.join(", ")}`);
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/users/register", form);
      router.push("/login");
      toast.success("Registration Successful!");
    } catch (err: unknown) {
      let msg = "Registration failed";
      if (isAxiosError(err)) {
        msg = err.response?.data?.message || msg;
      }
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <ThreeGlobeBackground />
      <div className="fixed inset-0 w-screen h-screen bg-black/40 backdrop-blur-sm z-10" />

      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-md space-y-6"
        >
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-bold text-white">Create Account</h1>
            <p className="text-sm text-gray-300">Join TravelQuest today</p>
          </div>

          {error && (
            <p className="text-sm text-red-500 border border-red-500 rounded p-2 bg-white/10">
              {error}
            </p>
          )}

          <div>
            <Label htmlFor="name" className="text-white pb-2">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              onInput={handleChange}
              disabled={loading}
              className="bg-white/10 text-white placeholder:text-gray-300"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-white pb-2">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onInput={handleChange}
              disabled={loading}
              className="bg-white/10 text-white placeholder:text-gray-300"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-white pb-2">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              onInput={handleChange}
              disabled={loading}
              className="bg-white/10 text-white placeholder:text-gray-300"
            />
          </div>

          <Button
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </Button>

          <p className="text-sm text-center text-gray-300">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-400 hover:underline font-medium">
              Login here
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-sm text-gray-300 text-center space-x-2">
        <span className="font-medium">
          <span className="font-bold">2025 &copy; TravelQuest</span>
        </span>
        <span className="font-medium">
          • Made with ❤️ at <span className="font-bold">CDAC</span>
        </span>
      </div>
    </div>
  );
}
