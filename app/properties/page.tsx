"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Property = { id: string; address: string; city: string; state: string; zip: string; };

export default function Properties() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [properties, setProperties] = useState<(Property & { docCount: number })[]>([]);
  const [form, setForm] = useState({ address: "", city: "", state: "", zip: "" });
  const router = useRouter();

  // Auth guard
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push("/login");
      else setCheckingAuth(false);
    })();
  }, [router]);

  useEffect(() => { if (!checkingAuth) loadProperties(); }, [checkingAuth]);

  async function loadProperties() {
    const { data } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
    if (!data) return;

    const withCounts = await Promise.all(
      data.map(async (p: Property) => {
        const { count } = await supabase
          .from("property_documents")
          .select("*", { count: "exact", head: true })
          .eq("property_id", p.id);
        return { ...p, docCount: count || 0 };
      })
    );

    setProperties(withCounts);
  }

  async function addProperty() {
    const { error } = await supabase.from("properties").insert([form]);
    if (error) { alert(error.message); return; }
    setForm({ address: "", city: "", state: "", zip: "" });
    await loadProperties();
  }

  if (checkingAuth) return <p className="p-6">Checking authentication...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Properties</h1>

      {/* Add property form */}
      <div className="space-y-2 border p-4 rounded">
        <input className="w-full border p-2 rounded" placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="ZIP" value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} />
        <button onClick={addProperty} className="bg-blue-600 text-white px-3 py-2 rounded">Add Property</button>
      </div>

      {/* Property list */}
      <ul className="space-y-2">
        {properties.map((p) => (
          <li key={p.id} className="flex justify-between items-center border p-3 rounded">
            <span>{p.address}, {p.city} {p.state} {p.zip}</span>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm">{p.docCount} docs</span>
              <Link href={`/properties/${p.id}`} className="text-blue-600 underline">View</Link>
              <button onClick={() => router.push(`/documents?property=${p.id}`)} className="text-green-600 underline">
                + Add Document
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
