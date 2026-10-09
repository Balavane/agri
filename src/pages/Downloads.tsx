import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useOfflineDocuments } from "../hooks/useOffline";
import { formatFileSize } from "../lib/pdf-utils";
import { EmptyState } from "../components/ui/EmptyState";
import { TrashIcon, DocumentIcon, WifiIcon } from "@heroicons/react/24/outline";

export default function Downloads() {
  const { t } = useTranslation();
  const { offlineDocs, removeOffline } = useOfflineDocuments();

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* En-tete */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">{t("offline.title")}</h1>
        <p className="text-gray-500 text-sm">{t("offline.subtitle")}</p>
      </div>

      {/* Indicateur hors-ligne */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-3 mb-6">
        <WifiIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
        <p className="text-sm text-green-700">
          Ces documents sont disponibles meme sans connexion internet.
        </p>
      </div>

      {offlineDocs.length === 0 ? (
        <EmptyState
          icon="📥"
          title={t("offline.empty")}
          description={t("offline.emptyHint")}
        />
      ) : (
        <div className="space-y-3">
          {offlineDocs
            .sort((a, b) => b.savedAt - a.savedAt)
            .map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
              >
                {/* Miniature ou icone */}
                {doc.miniature_url ? (
                  <img
                    src={doc.miniature_url}
                    alt={doc.titre}
                    className="w-12 h-16 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-16 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DocumentIcon className="h-6 w-6 text-green-400" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/document/${doc.id}`}
                    className="font-semibold text-gray-800 text-sm hover:text-green-700 line-clamp-2 block"
                  >
                    {doc.titre}
                  </Link>
                  <p className="text-xs text-gray-400 mt-1">
                    {t("offline.savedOn")} {formatDate(doc.savedAt)}
                    {doc.taille_ko ? ` • ${formatFileSize(doc.taille_ko)}` : ""}
                    {doc.language_code ? ` • ${doc.language_code.toUpperCase()}` : ""}
                  </p>
                </div>

                {/* Supprimer */}
                <button
                  onClick={() => removeOffline(doc.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={t("offline.remove")}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}