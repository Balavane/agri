import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { Spinner } from "../../components/ui/Spinner";
import type { Document } from "../../types";
import { ChartBarIcon, EyeIcon, ArrowDownTrayIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

interface DashboardStats {
  totalDocuments: number;
  totalViews: number;
  totalDownloads: number;
  topDocuments: Document[];
}

function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // Total documents
      const { count: totalDocuments } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true });

      // Somme des vues et telechargements
      const { data: aggData } = await supabase
        .from("documents")
        .select("vues, telechargements");
      const totalViews = aggData?.reduce((s, d) => s + (d.vues || 0), 0) || 0;
      const totalDownloads = aggData?.reduce((s, d) => s + (d.telechargements || 0), 0) || 0;

      // Top 5 documents par vues
      const { data: topDocuments } = await supabase
        .from("documents")
        .select("*, crop:crops(*), category:categories(*)")
        .order("vues", { ascending: false })
        .limit(5);

      return {
        totalDocuments: totalDocuments || 0,
        totalViews,
        totalDownloads,
        topDocuments: (topDocuments || []) as Document[],
      };
    },
  });
}

// Export CSV des stats
async function exportStatsCSV() {
  const { data } = await supabase
    .from("documents")
    .select("titre, language_code, vues, telechargements, created_at")
    .order("vues", { ascending: false });

  if (!data) return;

  const headers = ["Titre", "Langue", "Vues", "Telechargements", "Date creation"];
  const rows = data.map((d) => [
    `"${d.titre}"`,
    d.language_code || "",
    d.vues,
    d.telechargements,
    d.created_at?.split("T")[0] || "",
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `stats-biblio-rdc-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useDashboardStats();

  const statCards = [
    { label: t("admin.totalDocuments"), value: stats?.totalDocuments || 0, icon: DocumentTextIcon, color: "green" },
    { label: t("admin.totalViews"), value: stats?.totalViews || 0, icon: EyeIcon, color: "blue" },
    { label: t("admin.totalDownloads"), value: stats?.totalDownloads || 0, icon: ArrowDownTrayIcon, color: "purple" },
  ];

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t("admin.dashboard")}</h1>
        <button
          onClick={exportStatsCSV}
          className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition-colors min-h-[44px]"
        >
          <ChartBarIcon className="h-4 w-4" />
          {t("common.exportCSV")}
        </button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-${color === "green" ? "green" : color === "blue" ? "blue" : "purple"}-50`}>
              <Icon className={`h-6 w-6 text-${color === "green" ? "green" : color === "blue" ? "blue" : "purple"}-600`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top documents */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700">{t("admin.mostViewed")}</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {stats?.topDocuments.map((doc, i) => (
            <div key={doc.id} className="flex items-center gap-4 px-5 py-4">
              <span className="text-lg font-bold text-gray-300 w-6">#{i + 1}</span>
              {doc.miniature_url && (
                <img src={doc.miniature_url} alt={doc.titre} className="w-10 h-12 object-cover rounded-lg" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">{doc.titre}</p>
                <p className="text-xs text-gray-400">{doc.crop?.nom_fr} • {doc.language_code?.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">{doc.vues} vues</p>
                <p className="text-xs text-gray-400">{doc.telechargements} DL</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}