"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // 🔐 Auth guard
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setCheckingAuth(false);
      }
    })();
  }, [router]);

  if (checkingAuth) return <p className="p-6">Checking authentication...</p>;

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-gray-600">Welcome back! Choose what you want to manage today:</p>

      <div className="grid gap-6">
        <Link
          href="/properties"
          className="block bg-blue-600 text-white p-6 rounded-lg text-center hover:bg-blue-700"
        >
          🏠 Manage Properties
        </Link>

        <Link
          href="/templates"
          className="block bg-green-600 text-white p-6 rounded-lg text-center hover:bg-green-700"
        >
          📄 Manage Templates
        </Link>

        <Link
          href="/documents"
          className="block bg-purple-600 text-white p-6 rounded-lg text-center hover:bg-purple-700"
        >
          ✍️ Generate Documents
        </Link>
      </div>
    </div>
  );
}
