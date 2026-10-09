import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Header } from "./components/layout/Header";
import { Spinner } from "./components/ui/Spinner";
import { AdminGuard } from "./components/admin/AdminGuard";
import { ConfigBanner } from "./components/layout/ConfigBanner";


// Pages publiques (lazy load)
const Home = lazy(() => import("./pages/Home"));
const Catalog = lazy(() => import("./pages/Catalog"));
const DocumentDetail = lazy(() => import("./pages/DocumentDetail"));

// Pages admin (lazy load)
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminUpload = lazy(() => import("./pages/admin/UploadDocument"));
const AdminDocuments = lazy(() => import("./pages/admin/ManageDocuments"));
const AdminCrops = lazy(() => import("./pages/admin/ManageCrops"));
const AdminCategories = lazy(() => import("./pages/admin/ManageCategories"));
const AdminLanguages = lazy(() => import("./pages/admin/ManageLanguages"));

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Routes admin (sans Header public) */}
        <Route path="/admin/connexion" element={
          <Suspense fallback={<Spinner />}><AdminLogin /></Suspense>
        } />
        <Route path="/admin/*" element={
          <AdminGuard>
            <Suspense fallback={<Spinner />}>
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/ajouter" element={<AdminUpload />} />
                <Route path="/documents" element={<AdminDocuments />} />
                <Route path="/cultures" element={<AdminCrops />} />
                <Route path="/categories" element={<AdminCategories />} />
                <Route path="/langues" element={<AdminLanguages />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </Suspense>
          </AdminGuard>
        } />

        {/* Routes publiques */}
        <Route path="/*" element={
          <>
            <ConfigBanner />
            <Header />
            {/* Padding bottom pour la barre de navigation mobile */}
            <main className="pb-20 md:pb-0">
              <Suspense fallback={<Spinner />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalogue" element={<Catalog />} />
                  <Route path="/document/:id" element={<DocumentDetail />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
          </>
        } />
      </Routes>
    </div>
  );
}
