"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import jsPDF from "jspdf";
import SignaturePadComponent from "../../components/SignaturePad";

type TemplateRow = { id: string; name: string; fields: { name: string; label: string; type?: string }[]; };
type PropertyRow = { id: string; address: string; city: string; state: string; zip: string; };

export default function Documents() {
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [templateId, setTemplateId] = useState<string>("");
  const [propertyId, setPropertyId] = useState<string>("");
  const [form, setForm] = useState<Record<string, string>>({});
  const [signature, setSignature] = useState<string | null>(null);
  const [files, setFiles] = useState<{ file_name: string }[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();

  // 🔐 Auth guard
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push("/login");
      else setCheckingAuth(false);
    })();
  }, [router]);

  // Preselect property from ?property=id
  useEffect(() => {
    const pre = searchParams.get("property");
    if (pre) setPropertyId(pre);
  }, [searchParams]);

  // Load templates
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("templates").select("*").order("created_at", { ascending: false });
      if (data) {
        setTemplates(data as TemplateRow[]);
        if (data.length && !templateId) setTemplateId(data[0].id);
      }
    })();
  }, []);

  // Load properties
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      if (data) {
        setProperties(data as PropertyRow[]);
        if (data.length && !propertyId) setPropertyId(data[0].id);
      }
    })();
  }, []);

  // Load docs for selected property
  async function loadFiles(propId: string) {
    setLoadingFiles(true);
    const { data } = await supabase
      .from("property_documents")
      .select("*")
      .eq("property_id", propId)
      .order("created_at", { ascending: false });
    if (data) setFiles(data);
    setLoadingFiles(false);
  }
  useEffect(() => { if (propertyId) loadFiles(propertyId); }, [propertyId]);

  const currentTemplate = useMemo(() => templates.find(t => t.id === templateId), [templates, templateId]);

  function handleChange(name: string, val: string) {
    setForm((p) => ({ ...p, [name]: val }));
  }

  function renderPdf(doc: jsPDF, tpl: TemplateRow) {
    doc.setFontSize(18);
    doc.text(tpl.name, 20, 20);
    doc.setFontSize(12);
    let y = 40;
    tpl.fields.forEach(f => {
      doc.text(`${f.label}: ${form[f.name] || ""}`, 20, y);
      y += 10;
    });
    if (signature) {
      doc.text("Signature:", 20, y + 5);
      doc.addImage(signature, "PNG", 20, y + 10, 100, 40);
    }
  }

  async function generateAndSave() {
    if (!currentTemplate || !propertyId) { alert("Choose a property and a template."); return; }
    const doc = new jsPDF(); renderPdf(doc, currentTemplate);
    const blob = doc.output("blob");
    const safeName = currentTemplate.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const fileName = `${safeName}_${Date.now()}.pdf`;

    const { error: storageError } = await supabase.storage.from("documents").upload(fileName, blob, { upsert: true });
    if (storageError) { alert(storageError.message); return; }

    const { error: dbError } = await supabase.from("property_documents").insert([{ property_id: propertyId, file_name: fileName }]);
    if (dbError) { alert(dbError.message); return; }

    await loadFiles(propertyId);
    alert("Saved.");
  }

  function publicUrl(name: string) {
    const { data } = supabase.storage.from("documents").getPublicUrl(name);
    return data.publicUrl;
  }

  async function deleteFile(name: string) {
    await supabase.storage.from("documents").remove([name]);
    await supabase.from("property_documents").delete().eq("file_name", name);
    await loadFiles(propertyId);
  }

  if (checkingAuth) return <p className="p-6">Checking authentication...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Generate a Document</h1>

      {/* Property selector */}
      <select className="border p-2 rounded w-full" value={propertyId} onChange={e => setPropertyId(e.target.value)}>
        {properties.length === 0 ? <option value="">No properties yet</option> :
          properties.map(p => <option key={p.id} value={p.id}>{p.address}, {p.city} {p.state}</option>)}
      </select>

      {/* Template selector */}
      <select className="border p-2 rounded w-full" value={templateId} onChange={e => setTemplateId(e.target.value)}>
        {templates.length === 0 ? <option value="">No templates yet</option> :
          templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      {/* Dynamic form */}
      {currentTemplate && (
        <div className="space-y-3">
          {currentTemplate.fields.map(f => (
            <input
              key={f.name}
              type={f.type || "text"}
              className="w-full border p-2 rounded"
              placeholder={f.label}
              value={form[f.name] || ""}
              onChange={e => handleChange(f.name, e.target.value)}
            />
          ))}
          <SignaturePadComponent onSave={setSignature} />
          <button onClick={generateAndSave} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Generate, Sign & Save PDF
          </button>
        </div>
      )}

      {/* Existing docs */}
      <div>
        <h2 className="text-xl font-semibold">Documents for this Property</h2>
        {loadingFiles ? <p>Loading…</p> :
          files.length === 0 ? <p className="text-gray-500">No documents.</p> :
          <ul className="space-y-2 mt-2">
            {files.map((d) => (
              <li key={d.file_name} className="flex justify-between items-center">
                <span>{d.file_name}</span>
                <div className="flex gap-3">
                  <a href={publicUrl(d.file_name)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download</a>
                  <button onClick={() => deleteFile(d.file_name)} className="text-red-600 hover:underline">Delete</button>
                </div>
              </li>
            ))}
          </ul>}
      </div>
    </div>
  );
}

