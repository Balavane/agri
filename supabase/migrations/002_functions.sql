-- ============================================================
-- Fonctions RPC pour les statistiques anonymes
-- ============================================================

-- Fonction pour incrementer les stats journalieres
CREATE OR REPLACE FUNCTION increment_stat(
  p_document_id UUID,
  p_language_code TEXT,
  p_date DATE,
  p_type TEXT  -- 'vue' ou 'telechargement'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO stats (document_id, language_code, date, vues, telechargements)
  VALUES (
    p_document_id,
    p_language_code,
    p_date,
    CASE WHEN p_type = 'vue' THEN 1 ELSE 0 END,
    CASE WHEN p_type = 'telechargement' THEN 1 ELSE 0 END
  )
  ON CONFLICT (document_id, language_code, date)
  DO UPDATE SET
    vues = stats.vues + CASE WHEN p_type = 'vue' THEN 1 ELSE 0 END,
    telechargements = stats.telechargements + CASE WHEN p_type = 'telechargement' THEN 1 ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Incrementer le compteur de vues sur le document
CREATE OR REPLACE FUNCTION increment_document_views(p_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE documents SET vues = vues + 1 WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Incrementer le compteur de telechargements sur le document
CREATE OR REPLACE FUNCTION increment_document_downloads(p_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE documents SET telechargements = telechargements + 1 WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
