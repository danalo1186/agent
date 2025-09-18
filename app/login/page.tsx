"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/dashboard" },
    });
    if (!error) setSent(true);
    else alert(error.message);
  }

  if (sent) {
    return <p className="text-center mt-10">Check your email for the login link.</p>;
  }

  return (
    <form
      onSubmit={sendLink}
      className="max-w-sm mx-auto p-6 space-y-4 border rounded mt-10"
    >
      <h1 className="text-2xl font-semibold">Login</h1>
      <input
        className="w-full border p-2 rounded"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button
        type="submit"
        className="w-full bg-black text-white p-2 rounded hover:bg-gray-800"
      >
        Send Magic Link
      </button>
    </form>
  );
}
