"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type FieldDef = { name: string; label: string; type?: string };

export default function Templates() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [name, setName] = useState("");
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [all, setAll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth guard
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) window.location.href = "/login"; else setCheckingAuth(false);
    })();
  }, []);

  useEffect(() => { if (!checkingAuth) load(); }, [checkingAuth]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("templates").select("*").order("created_at", { ascending: false });
    if (!error && data) setAll(data);
    setLoading(false);
  }

  function addField() { setFields([...fields, { name: "", label: "", type: "text" }]); }
  function updateField(i: number, key: keyof FieldDef, val: string) {
    const next = [...fields]; (next[i] as any)[key] = val; setFields(next);
  }
  function removeField(i: number) { setFields(fields.filter((_, idx) => idx !== i)); }

  async function saveTemplate() {
    if (!name.trim() || fields.length === 0) { alert("Name + at least one field required."); return; }
    const { error } = await supabase.from("templates").insert([{ name, fields }]);
    if (error) { alert(error.message); return; }
    setName(""); setFields([]); await load(); alert("Saved.");
  }

  if (checkingAuth) return <p className="p-6">Checking authentication...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manage Templates</h1>

      <div className="space-y-4 border p-4 rounded">
        <input className="w-full border p-2 rounded" placeholder="Template name (e.g. Listing Agreement)"
               value={name} onChange={e => setName(e.target.value)} />

        <div className="space-y-2">
          {fields.map((f, i) => (
            <div key={i} className="flex gap-2">
              <input className="border p-2 rounded flex-1" placeholder="Field name (e.g. seller)"
                     value={f.name} onChange={e => updateField(i, "name", e.target.value)} />
              <input className="border p-2 rounded flex-1" placeholder="Field label (e.g. Seller Name)"
                     value={f.label} onChange={e => updateField(i, "label", e.target.value)} />
              <select className="border p-2 rounded" value={f.type || "text"} onChange={e => updateField(i, "type", e.target.value)}>
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
              </select>
              <button onClick={() => removeField(i)} className="px-3 py-1 bg-gray-300 rounded">X</button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={addField} className="bg-gray-600 text-white px-3 py-1 rounded">+ Add Field</button>
          <button onClick={saveTemplate} className="bg-blue-600 text-white px-3 py-1 rounded">Save Template</button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Existing</h2>
        {loading ? <p>Loading…</p> : all.length === 0 ? <p className="text-gray-500">None yet.</p> :
          <ul className="list-disc pl-6">{all.map(t => (<li key={t.id}>{t.name} ({t.fields.length} fields)</li>))}</ul>}
      </div>
    </div>
  );
}
