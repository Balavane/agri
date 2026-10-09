import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAdminDocuments, useUpdateDocument, useDeleteDocument } from "../../hooks/useAdminDocuments";
import { Spinner } from "../../components/ui/Spinner";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { formatFileSize } from "../../lib/pdf-utils";
import { PencilSquareIcon, TrashIcon, EyeIcon, EyeSlashIcon, PlusIcon } from "@heroicons/react/24/outline";
import type { Document } from "../../types";

export default function ManageDocuments() {
  const { t } = useTranslation();
  const { data: documents, isLoading } = useAdminDocuments();
  const { mutate: updateDoc } = useUpdateDocument();
  const { mutate: deleteDoc, isPending: deleting } = useDeleteDocument();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = documents?.filter((d) =>
    d.titre.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const togglePublish = (doc: Document) => {
    updateDoc({ id: doc.id, updates: { publie: !doc.publie } });
  };

  const handleDelete = (id: string, path: string) => {
    deleteDoc({ id, fichier_path: path });
    setConfirmDelete(null);
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t("admin.manageDocuments")}</h1>
        <Link to="/admin/ajouter">
          <Button size="sm">
            <PlusIcon className="h-4 w-4 mr-1" />
            {t("admin.addDocument")}
          </Button>
        </Link>
      </div>

      {/* Recherche */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un document..."
        className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-5 text-sm focus:outline-none focus:border-green-500"
      />

      {filtered.length === 0 ? (
        <EmptyState icon="📄" title="Aucun document" description="Ajoutez votre premier PDF." />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Titre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Culture</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Langue</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Statut</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Vues</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {doc.miniature_url ? (
                          <img src={doc.miniature_url} alt="" className="w-8 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-8 h-10 bg-green-50 rounded flex items-center justify-center text-green-400">📄</div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate max-w-[180px]">{doc.titre}</p>
                          <p className="text-xs text-gray-400">{doc.taille_ko ? formatFileSize(doc.taille_ko) : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {doc.crop ? <Badge label={doc.crop.nom_fr} color="green" /> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{doc.language_code?.toUpperCase() || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        label={doc.publie ? t("common.published") : t("common.draft")}
                        color={doc.publie ? "green" : "yellow"}
                      />
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{doc.vues}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Publier / Depublier */}
                        <button
                          onClick={() => togglePublish(doc)}
                          title={doc.publie ? t("common.unpublish") : t("common.publish")}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-green-600 transition-colors"
                        >
                          {doc.publie ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                        {/* Modifier (lien vers upload avec ID) */}
                        <Link
                          to={`/admin/ajouter?edit=${doc.id}`}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                          title={t("common.edit")}
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </Link>
                        {/* Supprimer */}
                        {confirmDelete === doc.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleDelete(doc.id, doc.fichier_path)}
                              disabled={deleting}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700"
                            >
                              Oui
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg"
                            >
                              Non
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(doc.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                            title={t("common.delete")}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}