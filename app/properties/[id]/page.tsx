"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Property = {
  id: string;
  user_id: string;
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

export default function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchProperty() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id) // ✅ only fetch if it belongs to logged-in user
        .single();

      if (error) {
        setError(error.message);
      } else {
        setProperty(data);
      }

      setLoading(false);
    }
    fetchProperty();
  }, [params.id, router]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;
  if (!property) return <p className="text-center mt-10">Property not found.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{property.address}</h1>
      <p>
        {property.city}, {property.state} {property.zip}
      </p>
      {property.price && <p>Price: ${property.price}</p>}
      {property.bedrooms && <p>Bedrooms: {property.bedrooms}</p>}
      {property.bathrooms && <p>Bathrooms: {property.bathrooms}</p>}
      {property.sqft && <p>Square Feet: {property.sqft}</p>}
      {property.description && <p>{property.description}</p>}

      <div className="flex gap-3 pt-4">
        <Link
          href={`/documents?property=${property.id}`}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Document
        </Link>
        <Link
          href="/properties"
          className="px-3 py-1 bg-gray-300 text-black rounded hover:bg-gray-400"
        >
          Back to Properties
        </Link>
      </div>
    </div>
  );
}
