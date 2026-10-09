import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { PlusIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import type { Language } from "../../types";

export default function ManageLanguages() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Language | null>(null);
  const [code, setCode] = useState("");
  const [nom, setNom] = useState("");
  const [actif, setActif] = useState(true);
  const [error, setError] = useState("");

  const { data: languages, isLoading } = useQuery({
    queryKey: ["languages-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("languages").select("*").order("nom");
      if (error) throw error;
      return data as Language[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (lang: Partial<Language>) => {
      if (editing) {
        const { error } = await supabase.from("languages").update({ nom: lang.nom, actif: lang.actif }).eq("code", editing.code);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("languages").insert(lang);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages-admin"] });
      queryClient.invalidateQueries({ queryKey: ["languages"] });
      resetForm();
    },
    onError: (e: Error) => setError(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ code, actif }: { code: string; actif: boolean }) => {
      const { error } = await supabase.from("languages").update({ actif }).eq("code", code);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["languages-admin"] }),
  });

  const resetForm = () => { setEditing(null); setCode(""); setNom(""); setActif(true); setError(""); };
  const startEdit = (lang: Language) => { setEditing(lang); setCode(lang.code); setNom(lang.nom); setActif(lang.actif); setError(""); };

  const handleSubmit = () => {
    if (!code.trim() || !nom.trim()) { setError("Code et nom requis."); return; }
    upsert.mutate({ code: code.trim().toLowerCase(), nom: nom.trim(), actif });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("admin.manageLanguages")}</h1>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">{editing ? t("common.edit") : "Ajouter une langue"}</h2>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Code *</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} disabled={!!editing}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 disabled:bg-gray-50"
              placeholder="Ex: lua" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nom *</label>
            <input value={nom} onChange={(e) => setNom(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
              placeholder="Ex: Tshiluba" />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={actif} onChange={(e) => setActif(e.target.checked)} className="w-4 h-4 rounded accent-green-600" />
              <span className="text-sm text-gray-600">Active</span>
            </label>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={handleSubmit} loading={upsert.isPending} size="sm"><PlusIcon className="h-4 w-4 mr-1" />{editing ? "Mettre a jour" : "Ajouter"}</Button>
          {editing && <Button onClick={resetForm} variant="ghost" size="sm">{t("common.cancel")}</Button>}
        </div>
      </div>
      {isLoading ? <Spinner /> : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {languages?.map((lang) => (
            <div key={lang.code} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
              <span className="text-sm font-mono bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-bold">{lang.code.toUpperCase()}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{lang.nom}</p>
                <p className={`text-xs ${lang.actif ? "text-green-500" : "text-gray-400"}`}>{lang.actif ? "Active" : "Inactive"}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(lang)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600"><PencilSquareIcon className="h-4 w-4" /></button>
                <button onClick={() => toggleActive.mutate({ code: lang.code, actif: !lang.actif })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${lang.actif ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
                  {lang.actif ? "Desactiver" : "Activer"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}