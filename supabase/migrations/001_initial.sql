-- ============================================================
-- Bibliotheque agricole RDC - Migration SQL complete
-- Admin email : frank.ako@limabridge.com
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- LANGUAGES
CREATE TABLE IF NOT EXISTS languages (
    code        TEXT PRIMARY KEY,
    nom         TEXT NOT NULL,
    actif       BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- CROPS
CREATE TABLE IF NOT EXISTS crops (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom_fr      TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    icone_url   TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom         TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titre                  TEXT NOT NULL,
    description            TEXT,
    crop_id                UUID REFERENCES crops(id) ON DELETE SET NULL,
    category_id            UUID REFERENCES categories(id) ON DELETE SET NULL,
    language_code          TEXT REFERENCES languages(code) ON DELETE SET NULL,
    fichier_url            TEXT NOT NULL,
    fichier_path           TEXT NOT NULL,
    taille_ko              INTEGER,
    nombre_pages           INTEGER,
    miniature_url          TEXT,
    source                 TEXT,
    date_publication       DATE,
    publie                 BOOLEAN NOT NULL DEFAULT false,
    avertissement_chimique TEXT,
    vues                   BIGINT NOT NULL DEFAULT 0,
    telechargements        BIGINT NOT NULL DEFAULT 0,
    created_at             TIMESTAMPTZ DEFAULT NOW(),
    updated_at             TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS search_vector TSVECTOR
    GENERATED ALWAYS AS (
        to_tsvector('french',
            coalesce(titre, '') || ' ' ||
            coalesce(description, '') || ' ' ||
            coalesce(source, '')
        )
    ) STORED;

-- DOCUMENT_TRANSLATIONS
CREATE TABLE IF NOT EXISTS document_translations (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id   UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    traduction_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    UNIQUE(document_id, traduction_id),
    CHECK (document_id <> traduction_id)
);

-- STATS
CREATE TABLE IF NOT EXISTS stats (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id       UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    language_code     TEXT REFERENCES languages(code),
    date              DATE NOT NULL DEFAULT CURRENT_DATE,
    vues              INTEGER NOT NULL DEFAULT 0,
    telechargements   INTEGER NOT NULL DEFAULT 0,
    UNIQUE(document_id, language_code, date)
);

-- UI_TRANSLATIONS
CREATE TABLE IF NOT EXISTS ui_translations (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cle           TEXT NOT NULL,
    language_code TEXT NOT NULL REFERENCES languages(code),
    valeur        TEXT NOT NULL,
    UNIQUE(cle, language_code)
);

-- INDEX
CREATE INDEX IF NOT EXISTS idx_documents_search     ON documents USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_documents_publie     ON documents(publie);
CREATE INDEX IF NOT EXISTS idx_documents_crop       ON documents(crop_id);
CREATE INDEX IF NOT EXISTS idx_documents_category   ON documents(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_language   ON documents(language_code);
CREATE INDEX IF NOT EXISTS idx_documents_trgm       ON documents USING GIN(titre gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_stats_date           ON stats(date);
CREATE INDEX IF NOT EXISTS idx_stats_document       ON stats(document_id);

-- TRIGGER updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $func$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_documents_updated_at ON documents;
CREATE TRIGGER trg_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- FONCTION is_admin()
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $func$
BEGIN
    RETURN (
        auth.role() = 'authenticated'
        AND auth.email() = 'frank.ako@limabridge.com'
    );
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- RLS
ALTER TABLE languages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops                ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents            ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats                ENABLE ROW LEVEL SECURITY;
ALTER TABLE ui_translations      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_languages"     ON languages FOR SELECT USING (true);
CREATE POLICY "admin_write_languages"     ON languages FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "public_read_crops"         ON crops FOR SELECT USING (true);
CREATE POLICY "admin_write_crops"         ON crops FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "public_read_categories"    ON categories FOR SELECT USING (true);
CREATE POLICY "admin_write_categories"    ON categories FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "public_read_published"     ON documents FOR SELECT USING (publie = true);
CREATE POLICY "admin_all_documents"       ON documents FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "public_read_translations"  ON document_translations FOR SELECT USING (true);
CREATE POLICY "admin_write_translations"  ON document_translations FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "public_insert_stats"       ON stats FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_read_stats"          ON stats FOR SELECT USING (is_admin());
CREATE POLICY "admin_update_stats"        ON stats FOR UPDATE USING (is_admin());
CREATE POLICY "public_read_ui"            ON ui_translations FOR SELECT USING (true);
CREATE POLICY "admin_write_ui"            ON ui_translations FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- STORAGE bucket pdfs
INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "public_read_pdfs"   ON storage.objects FOR SELECT USING (bucket_id = 'pdfs');
CREATE POLICY "admin_upload_pdfs"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pdfs' AND is_admin());
CREATE POLICY "admin_delete_pdfs"  ON storage.objects FOR DELETE USING (bucket_id = 'pdfs' AND is_admin());
CREATE POLICY "admin_update_pdfs"  ON storage.objects FOR UPDATE USING (bucket_id = 'pdfs' AND is_admin());

-- SEED
INSERT INTO languages (code, nom) VALUES ('fr','Francais'),('en','English'),('ln','Lingala'),('sw','Swahili'),('lua','Tshiluba') ON CONFLICT (code) DO NOTHING;
INSERT INTO crops (nom_fr, slug) VALUES ('Manioc','manioc'),('Mais','mais'),('Haricot','haricot') ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (nom, slug) VALUES ('Culture','culture'),('Ravageurs et maladies','ravageurs-maladies'),('Sol et fertilite','sol-fertilite'),('Semences','semences'),('Stockage','stockage'),('Recolte','recolte') ON CONFLICT (slug) DO NOTHING;
