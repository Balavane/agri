import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDocument } from "../hooks/useDocuments";
import { useOfflineDocuments } from "../hooks/useOffline";
import { useStats } from "../hooks/useStats";
import { Spinner } from "../components/ui/Spinner";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { formatFileSize } from "../lib/pdf-utils";
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: doc, isLoading, error } = useDocument(id!);
  const { isOffline, saveForOffline, removeOffline, loading: offlineLoading } = useOfflineDocuments();
  const { incrementView, incrementDownload } = useStats();
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfError, setPdfError] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [PdfDocument, setPdfDocument] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [PdfPage, setPdfPage] = useState<any>(null);

  // Charger react-pdf dynamiquement
  useEffect(() => {
    import("react-pdf").then((mod) => {
      // pdfjs-dist@3.11.174
      mod.pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.js",
        import.meta.url
      ).toString();
      setPdfDocument(() => mod.Document);
      setPdfPage(() => mod.Page);
    }).catch(() => setPdfError(true));
  }, []);

  // Incrementer les vues une seule fois
  useEffect(() => {
    if (doc) incrementView(doc.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc?.id]);

  const offline = doc ? isOffline(doc.id) : false;

  const handleDownload = async () => {
    if (!doc) return;
    window.open(doc.fichier_url, "_blank");
    incrementDownload(doc.id);
  };

  const handleOfflineToggle = async () => {
    if (!doc) return;
    if (offline) {
      await removeOffline(doc.id);
    } else {
      await saveForOffline({
        id: doc.id,
        titre: doc.titre,
        fichier_url: doc.fichier_url,
        miniature_url: doc.miniature_url,
        language_code: doc.language_code,
        taille_ko: doc.taille_ko,
        savedAt: Date.now(),
      });
    }
  };

  if (isLoading) return <Spinner />;
  if (error || !doc) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">📄</div>
        <h2 className="text-xl font-bold text-gray-700 mb-4">{t("common.error")}</h2>
        <Button onClick={() => navigate(-1)} variant="secondary">{t("common.back")}</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Retour */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 min-h-[44px]"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span className="text-sm">{t("common.back")}</span>
      </button>

      {/* En-tete */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <div className="flex gap-4">
          {doc.miniature_url ? (
            <img
              src={doc.miniature_url}
              alt={doc.titre}
              className="w-24 h-32 object-cover rounded-xl border border-gray-100 flex-shrink-0"
            />
          ) : (
            <div className="w-24 h-32 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-4xl">📄</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 mb-2">{doc.titre}</h1>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {doc.crop && <Badge label={doc.crop.nom_fr} color="green" />}
              {doc.category && <Badge label={doc.category.nom} color="blue" />}
              {doc.language && <Badge label={doc.language.nom} color="gray" />}
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              {doc.source && <p>{t("document.source")} : {doc.source}</p>}
              {doc.taille_ko != null && <p>{formatFileSize(doc.taille_ko)}</p>}
              {doc.nombre_pages != null && <p>{doc.nombre_pages} {t("document.pages")}</p>}
            </div>
          </div>
        </div>
        {doc.description && (
          <p className="text-gray-600 text-sm mt-4 leading-relaxed">{doc.description}</p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <Button onClick={handleDownload} size="lg" className="flex-1">
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            {t("document.download")}
          </Button>
          <Button
            onClick={handleOfflineToggle}
            loading={offlineLoading}
            variant={offline ? "secondary" : "ghost"}
            size="lg"
            className="flex-1"
          >
            {offline ? (
              <><BookmarkSolid className="h-5 w-5 mr-2 text-green-600" />{t("document.savedOffline")}</>
            ) : (
              <><BookmarkOutline className="h-5 w-5 mr-2" />{t("document.saveOffline")}</>
            )}
          </Button>
        </div>
      </div>

      {/* Avertissement chimique (si renseigne par l admin) */}
      {doc.avertissement_chimique && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex gap-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm mb-1">{t("document.chemicalWarning")}</p>
            <p className="text-amber-700 text-sm leading-relaxed">{doc.avertissement_chimique}</p>
          </div>
        </div>
      )}

      {/* Lecteur PDF */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">Apercu PDF</span>
          {numPages > 0 && (
            <span className="text-xs text-gray-400">{numPages} {t("document.pages")}</span>
          )}
        </div>
        <div className="overflow-auto max-h-[70vh] bg-gray-100 flex flex-col items-center py-4 gap-2">
          {!PdfDocument || pdfError ? (
            <div className="py-16 text-center">
              {pdfError ? (
                <>
                  <p className="text-gray-500 mb-4">Le lecteur PDF n&apos;est pas disponible.</p>
                  <a href={doc.fichier_url} target="_blank" rel="noopener noreferrer"
                    className="text-green-600 underline text-sm">
                    Ouvrir le PDF dans un nouvel onglet
                  </a>
                </>
              ) : (
                <Spinner />
              )}
            </div>
          ) : (
            <PdfDocument
              file={doc.fichier_url}
              onLoadSuccess={({ numPages }: { numPages: number }) => setNumPages(numPages)}
              onLoadError={() => setPdfError(true)}
              loading={<Spinner />}
            >
              {Array.from({ length: Math.min(numPages || 0, 10) }, (_, i) => (
                <PdfPage
                  key={i + 1}
                  pageNumber={i + 1}
                  width={Math.min(window.innerWidth - 32, 640)}
                  className="shadow-md mb-2"
                  loading={null}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                />
              ))}
            </PdfDocument>
          )}
        </div>
      </div>
    </div>
  );
}
