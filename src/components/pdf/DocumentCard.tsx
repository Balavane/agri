import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DocumentIcon } from '@heroicons/react/24/outline';
import type { Document } from '../../types';
import { formatFileSize } from '../../lib/pdf-utils';
import { Badge } from '../ui/Badge';

interface DocumentCardProps {
  document: Document;
}

export function DocumentCard({ document: doc }: DocumentCardProps) {
  const { t } = useTranslation();

  return (
    <Link
      to={`/document/${doc.id}`}
      className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all overflow-hidden group"
    >
      {/* Miniature */}
      <div className="relative aspect-[4/3] bg-green-50 overflow-hidden">
        {doc.miniature_url ? (
          <img
            src={doc.miniature_url}
            alt={doc.titre}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <DocumentIcon className="h-16 w-16 text-green-300" />
          </div>
        )}
        {/* Badge langue */}
        {doc.language && (
          <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-bold text-green-700 px-2 py-1 rounded-full">
            {doc.language.code.toUpperCase()}
          </span>
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1 p-4">
        <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2 line-clamp-2">
          {doc.titre}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {doc.crop && <Badge label={doc.crop.nom_fr} color="green" />}
          {doc.category && <Badge label={doc.category.nom} color="blue" />}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{doc.taille_ko ? formatFileSize(doc.taille_ko) : ''}</span>
          {doc.nombre_pages && (
            <span>{doc.nombre_pages} {t('catalog.pages')}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
