"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Property = {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  description?: string;
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", user.id) // ✅ only fetch this user's properties
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProperties(data);
      }

      setLoading(false);
    }
    fetchProperties();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">My Properties</h1>
        <Link
          href="/properties/new"
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          + Add Property
        </Link>
      </div>

      {properties.length === 0 && (
        <p className="text-center text-gray-600 mt-6">
          No properties yet. Add one to get started.
        </p>
      )}

      <ul className="space-y-3">
        {properties.map((p) => (
          <li key={p.id} className="border rounded p-4">
            <Link
              href={`/properties/${p.id}`}
              className="text-lg font-medium hover:underline"
            >
              {p.address}
            </Link>
            <p>
              {p.city}, {p.state} {p.zip}
            </p>
            {p.price && <p>Price: ${p.price}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
