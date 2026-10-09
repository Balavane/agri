import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { PlusIcon, TrashIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import type { Category } from "../../types";

export default function ManageCategories() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const [nom, setNom] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("nom");
      if (error) throw error;
      return data as Category[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (cat: Partial<Category>) => {
      if (editing) {
        const { error } = await supabase.from("categories").update(cat).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(cat);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories-admin"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      resetForm();
    },
    onError: (e: Error) => setError(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories-admin"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const resetForm = () => { setEditing(null); setNom(""); setSlug(""); setError(""); };
  const startEdit = (cat: Category) => { setEditing(cat); setNom(cat.nom); setSlug(cat.slug); setError(""); };

  const handleSubmit = () => {
    if (!nom.trim() || !slug.trim()) { setError("Nom et slug requis."); return; }
    upsert.mutate({ nom: nom.trim(), slug: slug.trim() });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("admin.manageCategories")}</h1>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">{editing ? t("common.edit") : "Ajouter une categorie"}</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nom *</label>
            <input value={nom} onChange={(e) => setNom(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
              placeholder="Ex: Ravageurs et maladies" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Slug *</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
              placeholder="Ex: ravageurs-maladies" />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={handleSubmit} loading={upsert.isPending} size="sm">
            <PlusIcon className="h-4 w-4 mr-1" />
            {editing ? "Mettre a jour" : "Ajouter"}
          </Button>
          {editing && <Button onClick={resetForm} variant="ghost" size="sm">{t("common.cancel")}</Button>}
        </div>
      </div>
      {isLoading ? <Spinner /> : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {categories?.map((cat) => (
            <div key={cat.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{cat.nom}</p>
                <p className="text-xs text-gray-400 font-mono">{cat.slug}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(cat)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600"><PencilSquareIcon className="h-4 w-4" /></button>
                <button onClick={() => remove.mutate(cat.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}