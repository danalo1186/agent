"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setLoggedIn(true);
        router.push("/dashboard");
      }
      setLoading(false);
    }
    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center px-6 py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Welcome to Agent
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Manage your properties with ease. Sign in to get started.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition"
        >
          Login
        </Link>
      </div>
      <footer className="mt-12 text-gray-400 text-sm">
        Powered by Next.js & Supabase · Deployed on Vercel
      </footer>
    </div>
  );
}
