import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddPropertyForm() {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [price, setPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [sqft, setSqft] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    // ✅ get the currently logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("You must be logged in to add a property.");
      return;
    }

    const { error } = await supabase.from("properties").insert([
      {
        address,
        city,
        state,
        zip,
        price: price ? Number(price) : null,
        bedrooms: bedrooms ? Number(bedrooms) : null,
        bathrooms: bathrooms ? Number(bathrooms) : null,
        sqft: sqft ? Number(sqft) : null,
        description,
        user_id: user.id, // ✅ must match your DB column
      },
    ]);

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Property created successfully!");
      setAddress("");
      setCity("");
      setState("");
      setZip("");
      setPrice("");
      setBedrooms("");
      setBathrooms("");
      setSqft("");
      setDescription("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3 p-4 border rounded">
      <h2 className="text-xl font-semibold">Add Property</h2>

      <input className="w-full border p-2 rounded" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" required />
      <input className="w-full border p-2 rounded" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" required />
      <input className="w-full border p-2 rounded" value={state} onChange={(e) => setState(e.target.value)} placeholder="State" required />
      <input className="w-full border p-2 rounded" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="ZIP" required />

      <input className="w-full border p-2 rounded" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
      <input className="w-full border p-2 rounded" type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="Bedrooms" />
      <input className="w-full border p-2 rounded" type="number" step="0.5" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="Bathrooms" />
      <input className="w-full border p-2 rounded" type="number" value={sqft} onChange={(e) => setSqft(e.target.value)} placeholder="Square Feet" />

      <textarea className="w-full border p-2 rounded" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />

      <button type="submit" className="w-full bg-black text-white p-2 rounded">Save Property</button>

      {message && <p className="text-center mt-2">{message}</p>}
    </form>
  );
}
