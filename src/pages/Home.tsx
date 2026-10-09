import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDocuments, useCrops, useCategories } from "../hooks/useDocuments";
import { DocumentCard } from "../components/pdf/DocumentCard";
import { SearchBar } from "../components/ui/SearchBar";
import { Spinner } from "../components/ui/Spinner";

const CROP_ICONS: Record<string, string> = {
  manioc: "🥔",
  mais: "🌽",
  haricot: "🫘",
};

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: documents, isLoading } = useDocuments();
  const { data: crops } = useCrops();
  const { data: categories } = useCategories();
  const recentDocs = documents?.slice(0, 6) || [];

  const handleSearch = (value: string) => {
    setSearch(value);
    if (value.trim()) navigate(`/catalogue?q=${encodeURIComponent(value.trim())}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-8 mb-8 text-white text-center shadow-lg">
        <div className="text-5xl mb-3">🌱</div>
        <h1 className="text-2xl font-bold mb-2">{t("home.welcome")}</h1>
        <p className="text-green-100 mb-6 text-sm max-w-md mx-auto">{t("home.subtitle")}</p>
        <SearchBar value={search} onChange={handleSearch} placeholder={t("home.searchPlaceholder")} className="max-w-md mx-auto" />
      </div>

      {/* Cultures */}
      {crops && crops.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">{t("home.allCrops")}</h2>
            <Link to="/catalogue" className="text-green-600 text-sm font-medium hover:underline">{t("home.viewAll")}</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {crops.map((crop) => (
              <Link
                key={crop.id}
                to={`/catalogue?culture=${crop.slug}`}
                className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 border border-gray-100 hover:border-green-300 hover:shadow-md transition-all"
              >
                <span className="text-4xl">{CROP_ICONS[crop.slug] || "🌿"}</span>
                <span className="text-sm font-semibold text-gray-700 text-center">{crop.nom_fr}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{t("home.allCategories")}</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalogue?categorie=${cat.slug}`}
                className="bg-white border border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-full transition-colors"
              >
                {cat.nom}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Documents recents */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">{t("home.recentDocuments")}</h2>
          <Link to="/catalogue" className="text-green-600 text-sm font-medium hover:underline">{t("home.viewAll")}</Link>
        </div>
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {recentDocs.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}