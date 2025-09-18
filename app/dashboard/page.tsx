"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

// Define property type
type Property = {
  id: string;
  address: string;
  price: number;
  user_id: string;
};

// Define user type (Supabase auth user)
type User = {
  id: string;
  email?: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser({ id: data.user.id, email: data.user.email ?? undefined });
        await loadProperties(data.user.id);
      } else {
        window.location.href = "/login";
      }
      setLoading(false);
    }

    loadUser();
  }, []);

  async function loadProperties(userId: string) {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("user_id", userId);

    if (!error && data) {
      const typedData = data.map((p) => ({
        id: p.id as string,
        address: p.address as string,
        price: Number(p.price),
        user_id: p.user_id as string,
      }));
      setProperties(typedData);
    }
  }

  async function addOrUpdateProperty(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (editingId) {
      // UPDATE
      const { error } = await supabase
        .from("properties")
        .update({ address, price: Number(price) })
        .eq("id", editingId)
        .eq("user_id", user.id);

      if (error) {
        alert("Error updating: " + error.message);
      } else {
        setEditingId(null);
        setAddress("");
        setPrice("");
        await loadProperties(user.id);
      }
    } else {
      // INSERT
      const { error } = await supabase
        .from("properties")
        .insert([{ address, price: Number(price), user_id: user.id }]);

      if (error) {
        alert("Error adding: " + error.message);
      } else {
        setAddress("");
        setPrice("");
        await loadProperties(user.id);
      }
    }
  }

  function startEdit(p: Property) {
    setEditingId(p.id);
    setAddress(p.address);
    setPrice(String(p.price));
  }

  async function deleteProperty(id: string) {
    if (!user) return;
    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      await loadProperties(user.id);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
      {user && <p>Signed in as: {user.email}</p>}

      <h2 className="text-xl font-semibold mt-6">
        {editingId ? "Edit Property" : "Add Property"}
      </h2>
      <form onSubmit={addOrUpdateProperty} className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingId ? "Update Property" : "Add Property"}
        </button>
      </form>

      <h2 className="text-xl font-semibold mt-6">Properties</h2>
      <ul className="list-disc pl-5 space-y-2">
        {properties.map((p) => (
          <li key={p.id}>
            {p.address} – ${p.price}
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => startEdit(p)}
                className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => deleteProperty(p.id)}
                className="bg-red-600 text-white px-2 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={handleLogout}
        className="mt-6 bg-gray-800 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
