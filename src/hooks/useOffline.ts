import { useState, useEffect, useCallback } from 'react';
import type { OfflineDocument } from '../types';

const CACHE_NAME = 'biblio-rdc-pdfs-v1';
const METADATA_KEY = 'biblio-rdc-offline-docs';

// Recupere les metadonnees des documents hors-ligne depuis localStorage
function getOfflineMetadata(): OfflineDocument[] {
  try {
    const raw = localStorage.getItem(METADATA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOfflineMetadata(docs: OfflineDocument[]): void {
  localStorage.setItem(METADATA_KEY, JSON.stringify(docs));
}

export function useOfflineDocuments() {
  const [offlineDocs, setOfflineDocs] = useState<OfflineDocument[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOfflineDocs(getOfflineMetadata());
  }, []);

  // Verifie si un document est sauvegarde hors-ligne
  const isOffline = useCallback(
    (id: string) => offlineDocs.some((d) => d.id === id),
    [offlineDocs]
  );

  // Sauvegarde un PDF dans le Cache API + metadonnees dans localStorage
  const saveForOffline = useCallback(async (doc: OfflineDocument & { fichier_url: string }) => {
    setLoading(true);
    try {
      if (!('caches' in window)) throw new Error('Cache API non disponible');
      const cache = await caches.open(CACHE_NAME);
      // Telechargement du PDF
      const response = await fetch(doc.fichier_url);
      if (!response.ok) throw new Error('Echec du telechargement');
      await cache.put(doc.fichier_url, response);

      // Sauvegarde des metadonnees
      const meta: OfflineDocument = {
        id: doc.id,
        titre: doc.titre,
        fichier_url: doc.fichier_url,
        miniature_url: doc.miniature_url,
        language_code: doc.language_code,
        taille_ko: doc.taille_ko,
        savedAt: Date.now(),
      };
      const updated = [...offlineDocs.filter((d) => d.id !== doc.id), meta];
      saveOfflineMetadata(updated);
      setOfflineDocs(updated);
      return true;
    } catch (err) {
      console.error('Erreur sauvegarde hors-ligne:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [offlineDocs]);

  // Supprime un document du cache
  const removeOffline = useCallback(async (id: string) => {
    const doc = offlineDocs.find((d) => d.id === id);
    if (!doc) return;
    try {
      if ('caches' in window) {
        const cache = await caches.open(CACHE_NAME);
        await cache.delete(doc.fichier_url);
      }
      const updated = offlineDocs.filter((d) => d.id !== id);
      saveOfflineMetadata(updated);
      setOfflineDocs(updated);
    } catch (err) {
      console.error('Erreur suppression hors-ligne:', err);
    }
  }, [offlineDocs]);

  return { offlineDocs, isOffline, saveForOffline, removeOffline, loading };
}
