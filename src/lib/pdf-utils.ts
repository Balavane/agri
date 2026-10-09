/**
 * Genere une miniature (data URL) depuis la premiere page d un PDF.
 * Utilise pdf.js via @react-pdf-viewer/core.
 * @param file - File object du PDF uploade
 * @returns data URL de l image (PNG)
 */
export async function generatePdfThumbnail(file: File): Promise<string | null> {
  try {
    // Charger pdf.js dynamiquement pour eviter un bundle trop lourd au demarrage
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.js',
      import.meta.url
    ).toString();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Erreur generation miniature PDF:', err);
    return null;
  }
}

/**
 * Convertit un data URL en Blob (pour upload vers Supabase Storage).
 */
export function dataURLtoBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bytes = atob(data);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/**
 * Nettoie le nom de fichier : supprime les espaces et caracteres speciaux.
 */
export function sanitizeFileName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // retire les accents
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}

/**
 * Formate la taille en Ko/Mo de facon lisible.
 */
export function formatFileSize(ko: number): string {
  if (ko < 1024) return `${ko} Ko`;
  return `${(ko / 1024).toFixed(1)} Mo`;
}
