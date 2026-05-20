export type CropPixels = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export type CropImageOptions = {
  backgroundColor?: string;
  mimeType?: string;
  outputHeight?: number;
  outputWidth?: number;
  quality?: number;
};

export type CompressImageOptions = {
  initialQuality?: number;
  maxBytes?: number;
  maxHeight?: number;
  maxWidth?: number;
  mimeType?: string;
  minQuality?: number;
};

const DEFAULT_IMAGE_MIME_TYPE = 'image/jpeg';
const DEFAULT_IMAGE_QUALITY = 0.9;
const DEFAULT_MAX_BYTES = 1_600_000;

export async function getCroppedImage(
  fileOrUrl: Blob | string,
  cropPixels: CropPixels,
  options: CropImageOptions = {},
) {
  const imageSource = createImageSource(fileOrUrl);

  try {
    const image = await loadBrowserImage(imageSource.url);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const mimeType = options.mimeType ?? DEFAULT_IMAGE_MIME_TYPE;
    const outputWidth = Math.max(
      1,
      Math.round(options.outputWidth ?? cropPixels.width),
    );
    const outputHeight = Math.max(
      1,
      Math.round(options.outputHeight ?? cropPixels.height),
    );

    if (!context) {
      throw new Error('Canvas rendering is unavailable.');
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    if (options.backgroundColor || mimeType === DEFAULT_IMAGE_MIME_TYPE) {
      context.fillStyle = options.backgroundColor ?? '#FFFFFF';
      context.fillRect(0, 0, outputWidth, outputHeight);
    }

    context.drawImage(
      image,
      Math.round(cropPixels.x),
      Math.round(cropPixels.y),
      Math.round(cropPixels.width),
      Math.round(cropPixels.height),
      0,
      0,
      outputWidth,
      outputHeight,
    );

    return canvasToBlob(
      canvas,
      mimeType,
      options.quality ?? DEFAULT_IMAGE_QUALITY,
    );
  } finally {
    imageSource.revoke();
  }
}

export async function compressImage(
  blob: Blob,
  options: CompressImageOptions = {},
) {
  const imageSource = createImageSource(blob);

  try {
    const image = await loadBrowserImage(imageSource.url);
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    const maxWidth = options.maxWidth ?? sourceWidth;
    const maxHeight = options.maxHeight ?? sourceHeight;
    const scale = Math.min(1, maxWidth / sourceWidth, maxHeight / sourceHeight);
    const outputWidth = Math.max(1, Math.round(sourceWidth * scale));
    const outputHeight = Math.max(1, Math.round(sourceHeight * scale));
    const mimeType = options.mimeType ?? blob.type ?? DEFAULT_IMAGE_MIME_TYPE;
    const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
    const minQuality = options.minQuality ?? 0.72;
    let quality = options.initialQuality ?? DEFAULT_IMAGE_QUALITY;

    if (
      blob.size <= maxBytes &&
      scale === 1 &&
      (!blob.type || blob.type === mimeType)
    ) {
      return blob;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas rendering is unavailable.');
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    if (mimeType === DEFAULT_IMAGE_MIME_TYPE) {
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, outputWidth, outputHeight);
    }

    context.drawImage(image, 0, 0, outputWidth, outputHeight);

    let compressedBlob = await canvasToBlob(canvas, mimeType, quality);

    while (compressedBlob.size > maxBytes && quality > minQuality) {
      quality = Math.max(minQuality, quality - 0.08);
      compressedBlob = await canvasToBlob(canvas, mimeType, quality);
    }

    return compressedBlob;
  } finally {
    imageSource.revoke();
  }
}

export function toImageFile(blob: Blob, fileName: string) {
  if (typeof File === 'undefined') {
    return blob;
  }

  return new File([blob], fileName, {
    lastModified: Date.now(),
    type: blob.type || DEFAULT_IMAGE_MIME_TYPE,
  });
}

function createImageSource(fileOrUrl: Blob | string) {
  if (typeof fileOrUrl === 'string') {
    return {
      revoke() {},
      url: fileOrUrl,
    };
  }

  const objectUrl = URL.createObjectURL(fileOrUrl);

  return {
    revoke() {
      URL.revokeObjectURL(objectUrl);
    },
    url: objectUrl,
  };
}

function loadBrowserImage(sourceUri: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image could not be loaded.'));
    image.crossOrigin = 'anonymous';
    image.src = sourceUri;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas export failed.'));
          return;
        }

        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}
