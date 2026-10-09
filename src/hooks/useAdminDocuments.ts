import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Document } from '../types';
import { sanitizeFileName, generatePdfThumbnail, dataURLtoBlob } from '../lib/pdf-utils';

// Admin: tous les documents (publies et brouillons)
export function useAdminDocuments() {
  return useQuery({
    queryKey: ['admin-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select(`*, crop:crops(*), category:categories(*), language:languages(*)`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Document[];
    },
  });
}

// Upload d un PDF + generation de miniature
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      coverImage,
      metadata,
    }: {
      file: File;
      coverImage?: File | null;
      metadata: Partial<Document> & { publie: boolean };
    }) => {
      // 1. Validation
      if (file.type !== 'application/pdf') throw new Error('Seuls les fichiers PDF sont acceptes.');
      if (file.size > 20 * 1024 * 1024) throw new Error('Fichier trop volumineux (max 20 Mo).');

      // 2. Nom de fichier nettoye
      const safeName = sanitizeFileName(file.name);
      const path = `${Date.now()}_${safeName}`;

      // 3. Upload PDF vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(path, file, { contentType: 'application/pdf', upsert: false });
      if (uploadError) throw uploadError;

      // 4. URL publique du PDF
      const { data: urlData } = supabase.storage.from('pdfs').getPublicUrl(path);
      const fichier_url = urlData.publicUrl;

      // 5. Miniature (Custom ou Auto)
      let miniature_url: string | null = null;
      
      if (coverImage) {
        // Upload de l'image personnalisee
        const thumbPath = `thumbnails/${Date.now()}_custom_${sanitizeFileName(coverImage.name)}`;
        const { error: thumbError } = await supabase.storage
          .from('pdfs')
          .upload(thumbPath, coverImage, { contentType: coverImage.type, upsert: false });
        if (!thumbError) {
          const { data: thumbUrl } = supabase.storage.from('pdfs').getPublicUrl(thumbPath);
          miniature_url = thumbUrl.publicUrl;
        }
      } else {
        // Generation automatique de la premiere page
        const thumbnailDataUrl = await generatePdfThumbnail(file);
        if (thumbnailDataUrl) {
          const thumbBlob = dataURLtoBlob(thumbnailDataUrl);
          const thumbPath = `thumbnails/${Date.now()}_thumb.png`;
          const { error: thumbError } = await supabase.storage
            .from('pdfs')
            .upload(thumbPath, thumbBlob, { contentType: 'image/png', upsert: false });
          if (!thumbError) {
            const { data: thumbUrl } = supabase.storage.from('pdfs').getPublicUrl(thumbPath);
            miniature_url = thumbUrl.publicUrl;
          }
        }
      }

      // 6. Insert en base de donnees
      const { data, error: dbError } = await supabase
        .from('documents')
        .insert({
          ...metadata,
          fichier_url,
          taille_octets: file.size,
          vignette_url: miniature_url,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return data as Document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

// Mise a jour d un document
export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Document> }) => {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

// Suppression d un document + son fichier
export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, fichier_path }: { id: string; fichier_path: string }) => {
      // Supprimer le fichier du Storage
      await supabase.storage.from('pdfs').remove([fichier_path]);
      // Supprimer l entree en base
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
