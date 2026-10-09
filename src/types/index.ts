// ============================================================
// Types TypeScript globaux — PhytoGuide
// ============================================================

export interface Language {
  code: string;
  nom: string;
  actif: boolean;
  created_at?: string;
}

export interface Crop {
  id: string;
  nom_fr: string;
  slug: string;
  icone_url?: string | null;
  created_at?: string;
}

export interface Category {
  id: string;
  nom: string;
  slug: string;
  created_at?: string;
}

export interface Document {
  id: string;
  titre: string;
  description?: string | null;
  crop_id?: string | null;
  category_id?: string | null;
  language_code?: string | null;
  fichier_url: string;
  fichier_path: string;
  taille_ko?: number | null;
  nombre_pages?: number | null;
  miniature_url?: string | null;
  source?: string | null;
  date_publication?: string | null;
  publie: boolean;
  avertissement_chimique?: string | null;
  vues: number;
  telechargements: number;
  created_at?: string;
  updated_at?: string;
  // Relations (joins)
  crop?: Crop | null;
  category?: Category | null;
  language?: Language | null;
  translations?: DocumentTranslation[];
}

export interface DocumentTranslation {
  id: string;
  document_id: string;
  traduction_id: string;
  traduction?: Document;
}

export interface Stats {
  id: string;
  document_id: string;
  language_code?: string | null;
  date: string;
  vues: number;
  telechargements: number;
}

export interface OfflineDocument {
  id: string;
  titre: string;
  fichier_url: string;
  miniature_url?: string | null;
  language_code?: string | null;
  taille_ko?: number | null;
  savedAt: number;
  // Le blob est stocke dans Cache API, pas ici
}

export interface DocumentFilters {
  cropSlug?: string;
  categorySlug?: string;
  languageCode?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}
