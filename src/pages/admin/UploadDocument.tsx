import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUploadDocument } from "../../hooks/useAdminDocuments";
import { useCrops, useCategories, useLanguages } from "../../hooks/useDocuments";
import { Button } from "../../components/ui/Button";
import { CloudArrowUpIcon, DocumentIcon } from "@heroicons/react/24/outline";
import { formatFileSize } from "../../lib/pdf-utils";

const MAX_SIZE = 20 * 1024 * 1024; // 20 Mo

export default function UploadDocument() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutateAsync: uploadDoc, isPending } = useUploadDocument();
  const { data: crops } = useCrops();
  const { data: categories } = useCategories();
  const { data: languages } = useLanguages();

  const [file, setFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [cropId, setCropId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [languageCode, setLanguageCode] = useState("fr");
  const [source, setSource] = useState("");
  const [datePublication, setDatePublication] = useState("");
  const [avertissementChimique, setAvertissementChimique] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Gestion drag-and-drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSetFile(dropped);
  }, []);

  const validateAndSetFile = (f: File) => {
    if (f.type !== "application/pdf") {
      setError("Seuls les fichiers PDF sont acceptes.");
      return;
    }
    if (f.size > MAX_SIZE) {
      setError("Fichier trop volumineux (max 20 Mo).");
      return;
    }
    setError("");
    setFile(f);
    // Pre-remplir le titre depuis le nom de fichier
    if (!titre) setTitre(f.name.replace(/\.pdf$/i, "").replace(/_/g, " "));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.type.startsWith('image/')) {
        setCoverImage(f);
      } else {
        setError("Veuillez sélectionner une image valide (JPG, PNG).");
      }
    }
  };

  const handleSubmit = async (publish: boolean) => {
    if (!file) { setError("Veuillez selectionner un fichier PDF."); return; }
    if (!titre.trim()) { setError("Le titre est obligatoire."); return; }
    setError("");
    try {
      await uploadDoc({
        file,
        coverImage,
        metadata: {
          titre: titre.trim(),
          description: description.trim() || null,
          crop_id: cropId || null,
          category_id: categoryId || null,
          language_code: languageCode || null,
          source: source.trim() || null,
          avertissement_chimique: avertissementChimique.trim() || null,
          publie: publish,
        },
      });
      setSuccess(true);
      setTimeout(() => navigate("/admin/documents"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l upload.");
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-green-700">{t("admin.upload.success")}</h2>
        <p className="text-gray-500 text-sm mt-2">Redirection vers la liste des documents...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("admin.upload.title")}</h1>

      {/* Zone de depot */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`border-2 border-dashed rounded-2xl p-8 text-center mb-6 transition-colors cursor-pointer ${
          dragOver ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-400"
        } ${file ? "bg-green-50 border-green-400" : ""}`}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <DocumentIcon className="h-12 w-12 text-green-500" />
            <p className="font-semibold text-green-700">{file.name}</p>
            <p className="text-sm text-gray-400">{formatFileSize(Math.round(file.size / 1024))}</p>
            <button
              className="text-sm text-red-400 hover:text-red-600 mt-2"
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
            >
              Retirer
            </button>
          </div>
        ) : (
          <>
            <CloudArrowUpIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-600">{t("admin.upload.dragDrop")}</p>
            <p className="text-sm text-gray-400 mt-1">{t("admin.upload.or")}</p>
            <p className="text-sm text-green-600 font-medium mt-1">{t("admin.upload.browse")}</p>
            <p className="text-xs text-gray-400 mt-2">{t("admin.upload.pdfOnly")}</p>
          </>
        )}
        <input
          id="file-input"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]); }}
        />
      </div>

      {/* Formulaire de metadonnees */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        
        {/* Couverture Personnalisée */}
        <div className="border border-gray-200 p-4 rounded-xl bg-gray-50 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo de couverture (optionnelle)
          </label>
          <p className="text-xs text-gray-500 mb-3">Si vous n'ajoutez pas d'image, la première page du PDF sera automatiquement utilisée.</p>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleCoverChange}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {coverImage && (
              <button
                type="button"
                className="text-sm text-red-500 hover:text-red-700"
                onClick={() => setCoverImage(null)}
              >
                Retirer l'image
              </button>
            )}
          </div>
        </div>

        {/* Titre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("admin.upload.documentTitle")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-green-500"
            placeholder="Ex: Fiche technique culture du manioc"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.upload.description")}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-green-500 resize-none"
          />
        </div>

        {/* Culture + Categorie */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.upload.crop")}</label>
            <select
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-green-500"
            >
              <option value="">-- Choisir --</option>
              {crops?.map((c) => <option key={c.id} value={c.id}>{c.nom_fr}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.upload.category")}</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-green-500"
            >
              <option value="">-- Choisir --</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
        </div>

        {/* Langue + Source */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.upload.language")}</label>
            <select
              value={languageCode}
              onChange={(e) => setLanguageCode(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-green-500"
            >
              {languages?.map((l) => <option key={l.code} value={l.code}>{l.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.upload.source")}</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500"
              placeholder="Ex: FAO, INERA..."
            />
          </div>
        </div>

        {/* Date publication */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.upload.publicationDate")}</label>
          <input
            type="date"
            value={datePublication}
            onChange={(e) => setDatePublication(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500"
          />
        </div>

        {/* Avertissement chimique */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("admin.upload.chemicalWarning")}
          </label>
          <textarea
            value={avertissementChimique}
            onChange={(e) => setAvertissementChimique(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 resize-none"
            placeholder={t("admin.upload.chemicalWarningHint")}
          />
          <p className="text-xs text-gray-400 mt-1">{t("admin.upload.chemicalWarningHint")}</p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => handleSubmit(true)}
            loading={isPending}
            size="lg"
            className="flex-1"
          >
            {t("admin.upload.publishNow")}
          </Button>
          <Button
            onClick={() => handleSubmit(false)}
            loading={isPending}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            {t("admin.upload.saveDraft")}
          </Button>
        </div>
      </div>
    </div>
  );
}