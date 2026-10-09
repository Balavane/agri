import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDocuments, useSearchDocuments, useCrops, useCategories, useLanguages } from "../hooks/useDocuments";
import { DocumentCard } from "../components/pdf/DocumentCard";
import { SearchBar } from "../components/ui/SearchBar";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { FunnelIcon } from "@heroicons/react/24/outline";

const PAGE_SIZE = 12;

export default function Catalog() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [cropFilter, setCropFilter] = useState(searchParams.get("culture") || "");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("categorie") || "");
  const [langFilter, setLangFilter] = useState(searchParams.get("langue") || "");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data: allDocuments, isLoading } = useDocuments({
    cropSlug: cropFilter || undefined,
    categorySlug: categoryFilter || undefined,
    languageCode: langFilter || undefined,
  });

  const { data: crops } = useCrops();
  const { data: categories } = useCategories();
  const { data: languages } = useLanguages();

  // Recherche Fuse.js cote client
  const filteredDocs = useSearchDocuments(allDocuments || [], search);
  const totalPages = Math.ceil(filteredDocs.length / PAGE_SIZE);
  const paginatedDocs = filteredDocs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Sync search params dans l URL
  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.q = search;
    if (cropFilter) params.culture = cropFilter;
    if (categoryFilter) params.categorie = categoryFilter;
    if (langFilter) params.langue = langFilter;
    setSearchParams(params, { replace: true });
    setPage(1);
  }, [search, cropFilter, categoryFilter, langFilter]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("catalog.title")}</h1>

      {/* Barre de recherche */}
      <SearchBar value={search} onChange={setSearch} className="mb-4" />

      {/* Bouton filtres mobile */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="md:hidden flex items-center gap-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl px-4 py-2 mb-4"
      >
        <FunnelIcon className="h-4 w-4" />
        {t("catalog.filters")}
        {(cropFilter || categoryFilter || langFilter) && (
          <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">!</span>
        )}
      </button>

      <div className="flex gap-6">
        {/* Filtres sidebar */}
        <aside className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-56 flex-shrink-0`}>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4 sticky top-20">
            {/* Culture */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                {t("catalog.filterByCrop")}
              </label>
              <select
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              >
                <option value="">{t("catalog.allCrops")}</option>
                {crops?.map((c) => (
                  <option key={c.id} value={c.slug}>{c.nom_fr}</option>
                ))}
              </select>
            </div>

            {/* Categorie */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                {t("catalog.filterByCategory")}
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              >
                <option value="">{t("catalog.allCategories")}</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.slug}>{c.nom}</option>
                ))}
              </select>
            </div>

            {/* Langue */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                {t("catalog.filterByLanguage")}
              </label>
              <select
                value={langFilter}
                onChange={(e) => setLangFilter(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              >
                <option value="">{t("catalog.allLanguages")}</option>
                {languages?.map((l) => (
                  <option key={l.code} value={l.code}>{l.nom}</option>
                ))}
              </select>
            </div>

            {/* Reset */}
            {(cropFilter || categoryFilter || langFilter || search) && (
              <button
                onClick={() => { setCropFilter(""); setCategoryFilter(""); setLangFilter(""); setSearch(""); }}
                className="w-full text-sm text-red-500 hover:text-red-700 font-medium py-1"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        </aside>

        {/* Grille documents */}
        <div className="flex-1">
          {isLoading ? (
            <Spinner />
          ) : filteredDocs.length === 0 ? (
            <EmptyState
              icon="🔍"
              title={t("catalog.noResults")}
              description={t("catalog.noResultsHint")}
            />
          ) : (
            <>
              <p className="text-sm text-gray-400 mb-4">
                {filteredDocs.length} document{filteredDocs.length > 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {paginatedDocs.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
                  >
                    &larr;
                  </button>
                  <span className="text-sm text-gray-600">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
                  >
                    &rarr;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}