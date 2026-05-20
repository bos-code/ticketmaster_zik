import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';

import {
  compressImage,
  getCroppedImage,
  toImageFile,
} from '@/lib/browser-image-processing';

export type WebImageCropperHandle = {
  openFileDialog: () => void;
  openSource: (sourceUri: string) => void;
};

export type WebCroppedImage = {
  blob: Blob;
  file: Blob | File;
  fileName: string;
};

type WebImageCropperProps = {
  aspect?: number;
  cropShape?: 'rect' | 'round';
  maxCompressedBytes?: number;
  maxFileSizeBytes?: number;
  onCroppedImage: (image: WebCroppedImage) => void | Promise<void>;
  onError?: (message: string) => void;
  onProcessingChange?: (isProcessing: boolean) => void;
  outputHeight?: number;
  outputMimeType?: string;
  outputQuality?: number;
  outputWidth?: number;
};

type CropSession = {
  file?: File;
  fileName: string;
  sourceUri: string;
};

const DEFAULT_CROP = { x: 0, y: 0 };
const DEFAULT_MAX_FILE_SIZE_BYTES = 12 * 1024 * 1024;
const DEFAULT_OUTPUT_MIME_TYPE = 'image/jpeg';
const DEFAULT_OUTPUT_QUALITY = 0.9;

export const WebImageCropper = forwardRef<WebImageCropperHandle, WebImageCropperProps>(
  function WebImageCropper(
    {
      aspect = 16 / 9,
      cropShape = 'rect',
      maxCompressedBytes,
      maxFileSizeBytes = DEFAULT_MAX_FILE_SIZE_BYTES,
      onCroppedImage,
      onError,
      onProcessingChange,
      outputHeight = 788,
      outputMimeType = DEFAULT_OUTPUT_MIME_TYPE,
      outputQuality = DEFAULT_OUTPUT_QUALITY,
      outputWidth = 1400,
    },
    ref,
  ) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const objectUrlRef = useRef<string | null>(null);
    const [crop, setCrop] = useState<Point>(DEFAULT_CROP);
    const [cropSession, setCropSession] = useState<CropSession | null>(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [zoom, setZoom] = useState(1);

    const revokeObjectUrl = useCallback(() => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    }, []);

    const resetCropState = useCallback(() => {
      setCrop(DEFAULT_CROP);
      setCroppedAreaPixels(null);
      setZoom(1);
    }, []);

    const closeCropper = useCallback(() => {
      revokeObjectUrl();
      setCropSession(null);
      resetCropState();
    }, [resetCropState, revokeObjectUrl]);

    useEffect(() => revokeObjectUrl, [revokeObjectUrl]);

    useEffect(() => {
      if (!cropSession) {
        return;
      }

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }, [cropSession]);

    const openSource = useCallback(
      (sourceUri: string) => {
        const trimmedSource = sourceUri.trim();

        if (!trimmedSource) {
          return;
        }

        revokeObjectUrl();
        resetCropState();
        setCropSession({
          fileName: 'ticket-artwork-cropped.jpg',
          sourceUri: trimmedSource,
        });
      },
      [resetCropState, revokeObjectUrl],
    );

    useImperativeHandle(
      ref,
      () => ({
        openFileDialog() {
          fileInputRef.current?.click();
        },
        openSource,
      }),
      [openSource],
    );

    const handleFileChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) {
          return;
        }

        if (!file.type.startsWith('image/')) {
          onError?.('Choose an image file to upload.');
          return;
        }

        if (file.size > maxFileSizeBytes) {
          onError?.(
            `Choose an image smaller than ${formatFileSize(maxFileSizeBytes)}.`,
          );
          return;
        }

        revokeObjectUrl();
        resetCropState();

        const objectUrl = URL.createObjectURL(file);
        objectUrlRef.current = objectUrl;
        setCropSession({
          file,
          fileName: buildCroppedFileName(file.name),
          sourceUri: objectUrl,
        });
      },
      [maxFileSizeBytes, onError, resetCropState, revokeObjectUrl],
    );

    const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
      setCroppedAreaPixels(areaPixels);
    }, []);

    const handleApplyCrop = useCallback(async () => {
      if (!cropSession || !croppedAreaPixels || isProcessing) {
        return;
      }

      try {
        setIsProcessing(true);
        onProcessingChange?.(true);

        const croppedBlob = await getCroppedImage(
          cropSession.file ?? cropSession.sourceUri,
          croppedAreaPixels,
          {
            mimeType: outputMimeType,
            outputHeight,
            outputWidth,
            quality: outputQuality,
          },
        );
        const compressedBlob = await compressImage(croppedBlob, {
          initialQuality: outputQuality,
          maxBytes: maxCompressedBytes,
          maxHeight: outputHeight,
          maxWidth: outputWidth,
          mimeType: outputMimeType,
        });

        await onCroppedImage({
          blob: compressedBlob,
          file: toImageFile(compressedBlob, cropSession.fileName),
          fileName: cropSession.fileName,
        });
        closeCropper();
      } catch (error) {
        console.warn('Image crop or upload failed.', error);
        onError?.(getImageProcessingErrorMessage(error));
      } finally {
        setIsProcessing(false);
        onProcessingChange?.(false);
      }
    }, [
      closeCropper,
      cropSession,
      croppedAreaPixels,
      isProcessing,
      maxCompressedBytes,
      onCroppedImage,
      onError,
      onProcessingChange,
      outputHeight,
      outputMimeType,
      outputQuality,
      outputWidth,
    ]);

    return (
      <>
        <input
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={styles.fileInput}
          type="file"
        />

        {cropSession ? (
          <div aria-modal="true" role="dialog" style={styles.overlay}>
            <div style={styles.header}>
              <div>
                <div style={styles.title}>Crop image</div>
                <div style={styles.subtitle}>Drag and zoom inside the frame.</div>
              </div>
              <button
                aria-label="Cancel crop"
                disabled={isProcessing}
                onClick={closeCropper}
                style={styles.iconButton}
                type="button"
              >
                x
              </button>
            </div>

            <div style={styles.cropperArea}>
              <Cropper
                aspect={aspect}
                crop={crop}
                cropShape={cropShape}
                image={cropSession.sourceUri}
                maxZoom={3}
                minZoom={1}
                objectFit="contain"
                onCropChange={setCrop}
                onCropComplete={handleCropComplete}
                onZoomChange={setZoom}
                showGrid={false}
                zoom={zoom}
              />
            </div>

            <div style={styles.controls}>
              <div style={styles.zoomHeader}>
                <label htmlFor="ticket-image-zoom" style={styles.zoomLabel}>
                  Zoom
                </label>
                <span style={styles.zoomValue}>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                id="ticket-image-zoom"
                max="3"
                min="1"
                onChange={(event) => setZoom(Number(event.currentTarget.value))}
                step="0.01"
                style={styles.slider}
                type="range"
                value={zoom}
              />

              <div style={styles.actions}>
                <button
                  disabled={isProcessing}
                  onClick={closeCropper}
                  style={styles.cancelButton}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  disabled={isProcessing || !croppedAreaPixels}
                  onClick={() => {
                    void handleApplyCrop();
                  }}
                  style={{
                    ...styles.doneButton,
                    ...(isProcessing || !croppedAreaPixels ? styles.disabledButton : null),
                  }}
                  type="button"
                >
                  {isProcessing ? 'Applying...' : 'Apply Crop'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </>
    );
  },
);

function buildCroppedFileName(fileName: string) {
  const baseName = fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9-]+/gi, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase();

  return `${baseName || 'image'}-cropped.jpg`;
}

function formatFileSize(bytes: number) {
  const megabytes = bytes / (1024 * 1024);

  return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`;
}

function getImageProcessingErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';

  if (
    message.startsWith('Image upload') ||
    message.startsWith('The cropped image')
  ) {
    return message;
  }

  return 'We could not crop this image. If it is a remote URL, try uploading it from your device.';
}

const styles = {
  actions: {
    display: 'flex',
    gap: 10,
    width: '100%',
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.28)',
    borderRadius: 8,
    color: '#FFFFFF',
    cursor: 'pointer',
    display: 'flex',
    flex: 1,
    fontSize: 12,
    fontWeight: 800,
    justifyContent: 'center',
    letterSpacing: 0.8,
    minHeight: 48,
    textTransform: 'uppercase',
  },
  controls: {
    backgroundColor: '#050505',
    borderTop: '1px solid rgba(255,255,255,0.12)',
    bottom: 0,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    left: 0,
    padding: '14px 16px calc(16px + env(safe-area-inset-bottom))',
    position: 'relative',
    right: 0,
    width: '100%',
    zIndex: 2,
  },
  cropperArea: {
    flex: 1,
    margin: '0 12px 12px',
    minHeight: 0,
    position: 'relative',
    touchAction: 'none',
  },
  disabledButton: {
    cursor: 'default',
    opacity: 0.62,
  },
  doneButton: {
    alignItems: 'center',
    backgroundColor: '#005BD3',
    border: 0,
    borderRadius: 8,
    color: '#FFFFFF',
    cursor: 'pointer',
    display: 'flex',
    flex: 1,
    fontSize: 12,
    fontWeight: 800,
    justifyContent: 'center',
    letterSpacing: 0.8,
    minHeight: 48,
    textTransform: 'uppercase',
  },
  fileInput: {
    display: 'none',
  },
  header: {
    alignItems: 'center',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'space-between',
    minHeight: 68,
    padding: 'calc(12px + env(safe-area-inset-top)) 16px 12px',
    width: '100%',
    zIndex: 2,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: 20,
    color: '#FFFFFF',
    cursor: 'pointer',
    display: 'flex',
    fontSize: 26,
    height: 40,
    justifyContent: 'center',
    lineHeight: 1,
    width: 40,
  },
  overlay: {
    backgroundColor: '#050505',
    color: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    height: '100dvh',
    inset: 0,
    position: 'fixed',
    width: '100vw',
    zIndex: 100000,
  },
  slider: {
    accentColor: '#005BD3',
    width: '100%',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 12,
    fontWeight: 600,
    lineHeight: '17px',
    marginTop: 2,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 800,
    lineHeight: '23px',
  },
  zoomHeader: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
  zoomLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  zoomValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 800,
  },
} satisfies Record<string, CSSProperties>;
