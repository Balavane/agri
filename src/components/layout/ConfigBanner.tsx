import { isSupabaseConfigured } from "../../lib/supabase";
import { WrenchScrewdriverIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

/**
 * Banniere d avertissement affichee quand Supabase n est pas configure.
 * Disparait une fois que l utilisateur a clique sur "Fermer".
 */
export function ConfigBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (isSupabaseConfigured || dismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-start gap-3">
        <WrenchScrewdriverIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-sm text-amber-800">
          <p className="font-semibold mb-1">Configuration Supabase requise</p>
          <p className="leading-relaxed">
            Editez <code className="bg-amber-100 px-1 rounded font-mono text-xs">.env.local</code> et
            ajoutez vos variables{" "}
            <code className="bg-amber-100 px-1 rounded font-mono text-xs">VITE_SUPABASE_URL</code> et{" "}
            <code className="bg-amber-100 px-1 rounded font-mono text-xs">VITE_SUPABASE_ANON_KEY</code>,
            puis relancez <code className="bg-amber-100 px-1 rounded font-mono text-xs">npm run dev</code>.
            Consultez le <strong>README.md</strong> pour les etapes Supabase.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-500 hover:text-amber-700 p-1 flex-shrink-0"
          aria-label="Fermer"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}