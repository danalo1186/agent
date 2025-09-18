"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push("/dashboard");
    }
  }

  async function handleSignup() {
    setErrorMsg("");
    setInfoMsg("");

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setInfoMsg("Account created. Now click Log In with the same email and password.");
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6 space-y-4 border rounded mt-10">
      <h1 className="text-2xl font-semibold">Login</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full border p-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {errorMsg && <p className="text-red-600">{errorMsg}</p>}
        {infoMsg && <p className="text-green-600">{infoMsg}</p>}

        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded hover:bg-gray-800"
        >
          Log In
        </button>
      </form>

      <button
        type="button"
        onClick={handleSignup}
        className="w-full bg-gray-600 text-white p-2 rounded hover:bg-gray-700"
      >
        Sign Up
      </button>
    </div>
  );
}
