"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        router.push("/dashboard");
      } else {
        setLoading(false);
      }
    }
    checkUser();
  }, [router]);

  async function handleDemoLogin() {
    // Anonymous login
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      alert("Error starting demo: " + error.message);
    } else {
      router.push("/dashboard");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1560184897-ae75f4184931?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 py-12 bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl max-w-lg">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Welcome to Agent
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-8">
          The smarter way to manage your real estate properties.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition"
          >
            Login
          </Link>
          <button
            onClick={handleDemoLogin}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg shadow-md transition"
          >
            Try Demo
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-gray-200 text-sm">
        Powered by Next.js & Supabase · Deployed on Vercel
      </footer>
    </div>
  );
}
