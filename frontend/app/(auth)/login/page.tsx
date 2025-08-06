"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "@/lib/axios";
import { toast } from "react-toastify";
import Link from "next/link";
import ThreeGlobeBackground from "@/app/components/ThreeGlobeBackground";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      toast.success("Login successful!");
      router.push("/");
    } catch (err) {
      console.error("Failed to login:", err);
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <ThreeGlobeBackground />
      
<div className="fixed inset-0 w-screen h-screen bg-black/40 backdrop-blur-sm z-10" />

      <div className="relative z-10 flex items-center justify-center h-full px-4">
        
        <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-md space-y-6">
        
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-sm text-gray-300">Sign in to continue your adventures</p>
          </div>

          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="bg-white/10 text-white placeholder:text-gray-300"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="bg-white/10 text-white placeholder:text-gray-300"
          />

          <Button
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Logging in...
              </span>
            ) : (
              "Log in"
            )}
          </Button>

          <p className="text-sm text-center text-gray-300">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-cyan-400 hover:underline font-medium"
            >
              Register
            </Link>
          </p>
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
    </div>
  );
}
