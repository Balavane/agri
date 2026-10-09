import { useEffect, useState } from "react"; import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Spinner } from "../ui/Spinner";
import { AdminLayout } from "./AdminLayout";

interface AdminGuardProps {
  children: ReactNode;
}

/**
 * Protege les routes admin : redirige vers /admin/connexion si non authentifie.
 * Verifie egalement que l email correspond a l admin autorise.
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Verification de la session Supabase
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (session?.user?.email === "frank.ako@limabridge.com") {
        setAuthenticated(true);
      }
      setLoading(false);
    });

    // Ecoute les changements d auth
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(session?.user?.email === "frank.ako@limabridge.com");
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <Spinner />;
  if (!authenticated) return <Navigate to="/admin/connexion" replace />;

  return <AdminLayout>{children}</AdminLayout>;
}
