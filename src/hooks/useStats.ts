import { useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook pour incrementer les statistiques anonymes.
 * Utilise un UPDATE direct (read + write) pour eviter les erreurs RPC 404.
 */
export function useStats() {
  const incrementView = useCallback(async (documentId: string) => {
    try {
      const { data } = await supabase
        .from('documents')
        .select('vues')
        .eq('id', documentId)
        .single();
      if (data !== null) {
        await supabase
          .from('documents')
          .update({ vues: (data.vues || 0) + 1 })
          .eq('id', documentId);
      }
    } catch {
      // Silencieux : les stats ne doivent pas bloquer l interface
    }
  }, []);

  const incrementDownload = useCallback(async (documentId: string) => {
    try {
      const { data } = await supabase
        .from('documents')
        .select('telechargements')
        .eq('id', documentId)
        .single();
      if (data !== null) {
        await supabase
          .from('documents')
          .update({ telechargements: (data.telechargements || 0) + 1 })
          .eq('id', documentId);
      }
    } catch {
      // Silencieux
    }
  }, []);

  return { incrementView, incrementDownload };
}
