import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import {
  ChartBarIcon,
  DocumentPlusIcon,
  DocumentTextIcon,
  BeakerIcon,
  TagIcon,
  GlobeAltIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { clsx } from "clsx";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { to: "/admin", label: t("admin.dashboard"), icon: ChartBarIcon },
    { to: "/admin/ajouter", label: t("admin.addDocument"), icon: DocumentPlusIcon },
    { to: "/admin/documents", label: t("admin.manageDocuments"), icon: DocumentTextIcon },
    { to: "/admin/cultures", label: t("admin.manageCrops"), icon: BeakerIcon },
    { to: "/admin/categories", label: t("admin.manageCategories"), icon: TagIcon },
    { to: "/admin/langues", label: t("admin.manageLanguages"), icon: GlobeAltIcon },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/connexion");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-4 gap-1">
        <div className="flex items-center gap-2 px-2 py-4 mb-4 border-b border-gray-100">
          <span className="text-2xl">🌱</span>
          <span className="font-bold text-green-700 text-sm">Admin — PhytoGuide</span>
        </div>
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={clsx(
              "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors",
              location.pathname === to
                ? "bg-green-50 text-green-700"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 mt-auto transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          {t("admin.logout")}
        </button>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-green-700">Admin — PhytoGuide</span>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
            {menuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </header>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 p-4 flex flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-green-50"
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 text-red-600 text-sm font-medium">
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              {t("admin.logout")}
            </button>
          </div>
        )}

        <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
