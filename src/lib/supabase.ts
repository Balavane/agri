import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Valide si les variables sont configurees (pas les valeurs placeholder)
export const isSupabaseConfigured =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key';

if (!isSupabaseConfigured) {
  console.warn(
    '[PhytoGuide] Supabase non configure.\n' +
    'Editez .env.local et ajoutez :\n' +
    '  VITE_SUPABASE_URL=https://votre-projet.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=votre-cle-anon\n' +
    'Puis relancez le serveur (npm run dev).'
  );
}

// On utilise une URL valide factice si non configure pour eviter le crash
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key'
);

