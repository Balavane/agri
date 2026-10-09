# PhytoGuide

Application web PWA (Progressive Web App) de fiches techniques agricoles pour la Republique Democratique du Congo.

## Fonctionnalites

- Consultation et telechargement de fiches PDF sans inscription
- Interface multilingue : Francais, Anglais, Lingala, Swahili (extensible)
- Mode hors ligne : PDF enregistres dans le navigateur
- Espace administrateur securise (1 compte)
- Installation sur Android via PWA
- Statistiques anonymes (vues, telechargements)

## Prerequis

- Node.js 18+ et npm 9+
- Compte Supabase (gratuit sur supabase.com)

## Installation locale

1. Cloner le projet et installer les dependances :

   npm install

2. Copier le fichier d environnement :

   copy .env.example .env.local

3. Remplir les variables dans .env.local :

   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre-cle-anon

4. Lancer le serveur de developpement :

   npm run dev

## Configuration Supabase

### 1. Creer le projet Supabase

- Aller sur https://supabase.com et creer un projet
- Copier l URL du projet et la cle anon dans .env.local

### 2. Executer les migrations SQL

Dans l editeur SQL de Supabase (SQL Editor), executer les fichiers dans l ordre :

1. supabase/migrations/001_initial.sql
2. supabase/migrations/002_functions.sql

### 3. Creer le compte administrateur

Dans Supabase Dashboard :
- Aller dans Authentication > Users
- Cliquer "Add user" > Email : frank.ako@limabridge.com
- Definir un mot de passe securise
- (Recommande) Activer TOTP (2FA) dans Authentication > Settings

### 4. Configurer le Storage

Le bucket "pdfs" est cree automatiquement par la migration SQL.
Verifier dans Storage > pdfs que le bucket est bien en mode "public".

### 5. Desactiver l inscription publique

Dans Authentication > Settings > User Management :
- Desactiver "Enable email confirmations" (optionnel)
- Activer "Disable signups" pour empecher les inscriptions publiques

## Variables d environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| VITE_SUPABASE_URL | URL de votre projet Supabase | https://xxx.supabase.co |
| VITE_SUPABASE_ANON_KEY | Cle publique (anon) Supabase | eyJhbGci... |

## Deploiement

### Vercel (recommande)

1. Pousser le code sur GitHub
2. Importer le projet dans Vercel
3. Ajouter les variables d environnement (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
4. Deployer

### Netlify

1. Pousser le code sur GitHub
2. Creer un site sur Netlify (Build command: npm run build, Publish dir: dist)
3. Ajouter les variables d environnement
4. Deployer

## Structure du projet

src/
  components/        # Composants reutilisables
    admin/           # Guard, Layout admin
    layout/          # Header, LanguagePicker
    pdf/             # DocumentCard
    ui/              # Button, Badge, Spinner, SearchBar...
  hooks/             # Logique metier (React Query)
  i18n/              # Traductions JSON (fr, en, ln, sw)
  lib/               # Client Supabase, utilitaires PDF, i18n
  pages/             # Pages publiques + pages admin
  store/             # Store Zustand (langue)
  types/             # Types TypeScript

supabase/
  migrations/        # SQL : schema, RLS, fonctions

## Ajouter une nouvelle langue

1. Creer le fichier src/i18n/xx.json (copier fr.json et traduire)
2. Ajouter l import dans src/lib/i18n.ts
3. Ajouter la langue dans Supabase (espace admin > Gerer les langues)

## Icones PWA

Remplacer les fichiers placeholder par de vraies icones :
- public/icons/icon-192.png (192x192 px)
- public/icons/icon-512.png (512x512 px)

## Stack technique

- React 18 + TypeScript + Vite
- Tailwind CSS v4
- Supabase (PostgreSQL + Auth + Storage)
- react-i18next (multilingue)
- Fuse.js (recherche tolerante)
- @tanstack/react-query (cache donnees)
- Zustand (etat global)
- vite-plugin-pwa + Workbox (service worker)
- react-pdf + pdfjs-dist (lecteur PDF)
