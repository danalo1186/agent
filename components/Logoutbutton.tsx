"use client";

import { supabase } from "@/lib/supabase";

export default function LogoutButton() {
  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
      }}
      className="px-3 py-1 bg-red-600 text-white rounded"
    >
      Log Out
    </button>
  );
}
