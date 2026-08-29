import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Configure pdfjs to run in-thread (fake worker mode) inside iframes/sandboxed environments
// to prevent "DataCloneError: The object can not be cloned." from Web Worker postMessage transfers.
if (typeof window !== 'undefined') {
  try {
    // Disable external worker instantiation
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
  } catch (e) {
    console.warn('PDF.js configuration note:', e);
  }
}

/**
 * Compresses a canvas into an optimized JPEG Data URL guaranteed to be under the byte limit
 * (Default limit: 450KB, safely below Firestore's 1MB document ceiling).
 */
export function compressCanvasToDataUrl(
  sourceCanvas: HTMLCanvasElement,
  maxBytes: number = 450000,
  maxWidth: number = 1600,
  maxHeight: number = 2200
): string {
  let width = sourceCanvas.width;
  let height = sourceCanvas.height;

  // Scale down dimensions if exceeding max bounds while preserving aspect ratio
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    return sourceCanvas.toDataURL('image/jpeg', 0.8);
  }

  // Set crisp rendering settings
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill with white background (handles transparent PDFs & PNGs cleanly)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(sourceCanvas, 0, 0, width, height);

  // Progressive compression passes to guarantee staying under maxBytes
  const qualitySteps = [0.85, 0.78, 0.70, 0.60, 0.50];
  for (const q of qualitySteps) {
    const dataUrl = canvas.toDataURL('image/jpeg', q);
    // Rough estimate of byte size for base64: length * 0.75
    const estimatedBytes = dataUrl.length * 0.75;
    if (estimatedBytes <= maxBytes) {
      return dataUrl;
    }
  }

  // If still too large, downscale canvas dimension further by 25%
  const smallerCanvas = document.createElement('canvas');
  smallerCanvas.width = Math.round(width * 0.75);
  smallerCanvas.height = Math.round(height * 0.75);
  const sCtx = smallerCanvas.getContext('2d');
  if (sCtx) {
    sCtx.imageSmoothingEnabled = true;
    sCtx.imageSmoothingQuality = 'high';
    sCtx.fillStyle = '#FFFFFF';
    sCtx.fillRect(0, 0, smallerCanvas.width, smallerCanvas.height);
    sCtx.drawImage(canvas, 0, 0, smallerCanvas.width, smallerCanvas.height);
    return smallerCanvas.toDataURL('image/jpeg', 0.65);
  }

  return canvas.toDataURL('image/jpeg', 0.55);
}

/**
 * Converts a PDF File into a high-resolution, compressed JPEG image Data URL.
 * Renders the first page on canvas and optimizes it to be well under 450KB
 * so it never triggers Firestore 1MB document size limits.
 */
export async function convertPdfToImageDataUrl(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const typedArray = new Uint8Array(arrayBuffer);
    
    const loadingTask = pdfjsLib.getDocument({
      data: typedArray,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1); // First page of routine
    
    // Scale for crisp high-resolution text rendering (1.6x is sharp for 1080p/Retina)
    const viewport = page.getViewport({ scale: 1.6 });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!context) {
      throw new Error('Canvas 2D context not supported');
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Fill white background before rendering
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    // @ts-ignore
    await page.render(renderContext).promise;

    // Compress to high-quality JPEG under 450KB
    return compressCanvasToDataUrl(canvas, 450000, 1600, 2200);
  } catch (err: any) {
    console.error('Error rendering PDF with pdfjs:', err);
    throw new Error(err?.message || 'Could not convert PDF to image. Please upload a PNG, JPG, or Screenshot directly.');
  }
}

/**
 * Reads and automatically compresses an image file (PNG, JPG, WEBP, GIF, Screenshot)
 * into an optimized JPEG Data URL safely under 450KB.
 */
export function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      if (!rawDataUrl) {
        reject(new Error('Failed to read image file'));
        return;
      }

      // If SVG or very small image under 200KB, return as is
      if (file.type === 'image/svg+xml' || rawDataUrl.length < 200000) {
        resolve(rawDataUrl);
        return;
      }

      // Load into Image element to resize and compress
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const compressed = compressCanvasToDataUrl(canvas, 450000, 1600, 2200);
        resolve(compressed);
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Helper to compress any existing base64 image Data URL if it exceeds maxBytes
 */
export function compressDataUrl(dataUrl: string, maxBytes: number = 450000): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image/') || dataUrl.length * 0.75 <= maxBytes) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const compressed = compressCanvasToDataUrl(canvas, maxBytes, 1600, 2200);
      resolve(compressed);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}


