import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Document, DocumentFilters, Crop, Category, Language } from '../types';
import Fuse from 'fuse.js';

// Recupere tous les documents publies avec leurs relations
export function useDocuments(filters?: DocumentFilters) {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select(`
          *,
          crop:crops(*),
          category:categories(*),
          language:languages(*)
        `)
        .eq('publie', true)
        .order('created_at', { ascending: false });

      if (filters?.cropSlug) {
        const { data: crop } = await supabase
          .from('crops')
          .select('id')
          .eq('slug', filters.cropSlug)
          .single();
        if (crop) query = query.eq('crop_id', crop.id);
      }

      if (filters?.categorySlug) {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', filters.categorySlug)
          .single();
        if (cat) query = query.eq('category_id', cat.id);
      }

      if (filters?.languageCode) {
        query = query.eq('language_code', filters.languageCode);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Document[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Recherche client-side avec Fuse.js (tolerant aux fautes)
export function useSearchDocuments(documents: Document[], search: string): Document[] {
  if (!search.trim()) return documents;

  const fuse = new Fuse(documents, {
    keys: ['titre', 'description', 'source', 'crop.nom_fr', 'category.nom'],
    threshold: 0.35, // tolerant
    includeScore: false,
  });

  return fuse.search(search).map((r) => r.item);
}

// Recupere un document par ID avec ses traductions
export function useDocument(id: string) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          crop:crops(*),
          category:categories(*),
          language:languages(*)
        `)
        .eq('id', id)
        .eq('publie', true)
        .single();
      if (error) throw error;
      return data as Document;
    },
    enabled: !!id,
  });
}

// Recupere toutes les cultures
export function useCrops() {
  return useQuery({
    queryKey: ['crops'],
    queryFn: async () => {
      const { data, error } = await supabase.from('crops').select('*').order('nom_fr');
      if (error) throw error;
      return (data || []) as Crop[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

// Recupere toutes les categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('nom');
      if (error) throw error;
      return (data || []) as Category[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

// Recupere toutes les langues actives
export function useLanguages() {
  return useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .eq('actif', true)
        .order('nom');
      if (error) throw error;
      return (data || []) as Language[];
    },
    staleTime: 10 * 60 * 1000,
  });
}
