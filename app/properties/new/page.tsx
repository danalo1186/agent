"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddPropertyForm() {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    const { error: insertError } = await supabase.from("properties").insert({
      user_id: user.id,
      address,
      city,
      state,
      zip,
    });

    if (insertError) setError(insertError.message);
    else window.location.href = "/properties";
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto p-6 space-y-4 border rounded mt-10"
    >
      <h1 className="text-2xl font-semibold">Add Property</h1>
      {error && <p className="text-red-600">{error}</p>}

      <input
        className="w-full border p-2 rounded"
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
      />
      <input
        className="w-full border p-2 rounded"
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        required
      />
      <input
        className="w-full border p-2 rounded"
        placeholder="State"
        value={state}
        onChange={(e) => setState(e.target.value)}
        required
      />
      <input
        className="w-full border p-2 rounded"
        placeholder="ZIP"
        value={zip}
        onChange={(e) => setZip(e.target.value)}
        required
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Save Property
      </button>
    </form>
  );
}
