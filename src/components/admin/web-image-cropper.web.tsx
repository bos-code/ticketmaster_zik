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

const ASPECT_RATIOS = [
  { label: '16:9 Banner', value: 16 / 9 },
  { label: '4:3 Photo', value: 4 / 3 },
  { label: '1:1 Square', value: 1 },
  { label: '3:4 Portrait', value: 3 / 4 },
  { label: '2:3 Flyer', value: 2 / 3 },
];

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

    // Dynamic crop aspect ratio selection
    const [selectedAspect, setSelectedAspect] = useState<number | undefined>(aspect);

    // Step-based preview navigation
    const [step, setStep] = useState<'crop' | 'preview'>('crop');
    const [previewUri, setPreviewUri] = useState<string | null>(null);
    const [previewDimensions, setPreviewDimensions] = useState<{ width: number; height: number } | null>(null);
    const [croppedData, setCroppedData] = useState<{ blob: Blob; fileName: string } | null>(null);

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
      setSelectedAspect(aspect);
    }, [aspect]);

    const closeCropper = useCallback(() => {
      revokeObjectUrl();
      if (previewUri) {
        URL.revokeObjectURL(previewUri);
        setPreviewUri(null);
      }
      setCropSession(null);
      resetCropState();
      setStep('crop');
      setCroppedData(null);
    }, [resetCropState, revokeObjectUrl, previewUri]);

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

    // Step 1 -> Step 2 transition: prepare cropped preview image
    const handleGoToPreview = useCallback(async (useOriginal = false) => {
      if (!cropSession) {
        return;
      }

      try {
        setIsProcessing(true);
        onProcessingChange?.(true);

        let finalBlob: Blob;
        let dimensions: { width: number; height: number };

        if (useOriginal) {
          const originalBlob =
            cropSession.file ??
            (await fetch(cropSession.sourceUri).then((r) => r.blob()));

          finalBlob = await compressImage(originalBlob, {
            initialQuality: outputQuality,
            maxBytes: maxCompressedBytes,
            mimeType: outputMimeType,
          });

          const img = await loadLocalBrowserImage(cropSession.sourceUri);
          dimensions = {
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
          };
        } else {
          if (!croppedAreaPixels) {
            return;
          }
          const currentAspect = selectedAspect ?? (16 / 9);
          const calculatedHeight = Math.round(1400 / currentAspect);

          finalBlob = await getCroppedImage(
            cropSession.file ?? cropSession.sourceUri,
            croppedAreaPixels,
            {
              mimeType: outputMimeType,
              outputHeight: calculatedHeight,
              outputWidth: 1400,
              quality: outputQuality,
            },
          );
          dimensions = { width: 1400, height: calculatedHeight };
        }

        const previewUrl = URL.createObjectURL(finalBlob);
        setPreviewUri(previewUrl);
        setPreviewDimensions(dimensions);
        setCroppedData({ blob: finalBlob, fileName: cropSession.fileName });
        setStep('preview');
      } catch (error) {
        console.warn('Image preview creation failed.', error);
        onError?.(getImageProcessingErrorMessage(error));
      } finally {
        setIsProcessing(false);
        onProcessingChange?.(false);
      }
    }, [
      cropSession,
      croppedAreaPixels,
      maxCompressedBytes,
      onError,
      onProcessingChange,
      outputMimeType,
      outputQuality,
      selectedAspect,
    ]);

    // Go back from Step 2 to Step 1
    const handleBackToEdit = useCallback(() => {
      if (previewUri) {
        URL.revokeObjectURL(previewUri);
        setPreviewUri(null);
      }
      setCroppedData(null);
      setStep('crop');
    }, [previewUri]);

    // Apply & upload final image
    const handleConfirmUpload = useCallback(async () => {
      if (!croppedData || isProcessing) {
        return;
      }

      try {
        setIsProcessing(true);
        onProcessingChange?.(true);

        await onCroppedImage({
          blob: croppedData.blob,
          file: toImageFile(croppedData.blob, croppedData.fileName),
          fileName: croppedData.fileName,
        });
        closeCropper();
      } catch (error) {
        console.warn('Image upload failed.', error);
        onError?.(getImageProcessingErrorMessage(error));
      } finally {
        setIsProcessing(false);
        onProcessingChange?.(false);
      }
    }, [
      closeCropper,
      croppedData,
      isProcessing,
      onCroppedImage,
      onError,
      onProcessingChange,
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
                <div style={styles.title}>
                  {step === 'crop' ? 'Crop & Adjust' : 'Confirm Layout'}
                </div>
                <div style={styles.subtitle}>
                  {step === 'crop'
                    ? 'Choose an aspect ratio and scale your artwork.'
                    : 'Verify how the image fits inside the ticket views.'}
                </div>
              </div>
              <button
                aria-label="Cancel crop"
                disabled={isProcessing}
                onClick={closeCropper}
                style={styles.iconButton}
                type="button"
              >
                ×
              </button>
            </div>

            {step === 'crop' ? (
              <>
                <div style={styles.cropperArea}>
                  <Cropper
                    aspect={selectedAspect}
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
                  {/* Dynamic Aspect Ratio Tabs */}
                  <div style={styles.aspectSelector}>
                    <span style={styles.aspectLabel}>Crop Aspect Ratio</span>
                    <div style={styles.aspectTabs}>
                      {ASPECT_RATIOS.map((item) => {
                        const isActive = selectedAspect === item.value;
                        return (
                          <button
                            key={item.label}
                            onClick={() => setSelectedAspect(item.value)}
                            style={{
                              ...styles.aspectTab,
                              ...(isActive ? styles.aspectTabActive : null),
                            }}
                            type="button"
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

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
                      disabled={isProcessing}
                      onClick={() => {
                        void handleGoToPreview(true);
                      }}
                      style={styles.skipButton}
                      type="button"
                    >
                      Use Original
                    </button>
                    <button
                      disabled={isProcessing || !croppedAreaPixels}
                      onClick={() => {
                        void handleGoToPreview(false);
                      }}
                      style={{
                        ...styles.doneButton,
                        ...(isProcessing || !croppedAreaPixels ? styles.disabledButton : null),
                      }}
                      type="button"
                    >
                      {isProcessing ? 'Processing...' : 'Preview in UI'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Step 2: Verification Previews & Dimensions Check */}
                <div style={styles.previewContainer}>
                  <div style={styles.previewInfo}>
                    <div style={styles.dimensionsBadge}>
                      {previewDimensions
                        ? `${previewDimensions.width} × ${previewDimensions.height} px`
                        : ''}
                    </div>
                    <div style={styles.previewSubtitle}>
                      Cut views simulating rendering scale settings (Contain Mode):
                    </div>
                  </div>

                  <div style={styles.mockupGrid}>
                    {/* Ticket Card List Item Preview */}
                    <div style={styles.mockupCard}>
                      <div style={styles.mockupLabel}>Ticket Card Preview</div>
                      <div style={styles.ticketCardFrame}>
                        <div style={styles.ticketCardBlueHeader} />
                        <div style={styles.ticketCardImageContainer}>
                          <img
                            alt="Ticket Card Preview"
                            src={previewUri || ''}
                            style={styles.ticketCardImage}
                          />
                        </div>
                        <div style={styles.ticketCardFooter}>
                          <div style={styles.ticketCardText1}>Taylor Swift</div>
                          <div style={styles.ticketCardText2}>May 20 • Wembley Stadium</div>
                          <div style={styles.ticketCardButton}>View Ticket</div>
                        </div>
                      </div>
                    </div>

                    {/* Summary Hero Header Preview */}
                    <div style={styles.mockupHero}>
                      <div style={styles.mockupLabel}>Summary Hero Preview</div>
                      <div style={styles.heroFrame}>
                        <img
                          alt="Hero Header Preview"
                          src={previewUri || ''}
                          style={styles.heroImageStyle}
                        />
                        <div style={styles.heroOverlay} />
                        <div style={styles.heroHeaderBar}>
                          <span style={styles.heroBackArrow}>←</span>
                          <span style={styles.heroInfoButton}>ⓘ</span>
                        </div>
                        <div style={styles.heroContent}>
                          <div style={styles.heroDate}>WED, MAY 20 • 7:00 PM</div>
                          <div style={styles.heroTitle}>Taylor Swift | The Eras Tour</div>
                          <div style={styles.heroVenue}>Wembley Stadium • London</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={styles.controls}>
                  <div style={styles.actions}>
                    <button
                      disabled={isProcessing}
                      onClick={handleBackToEdit}
                      style={styles.cancelButton}
                      type="button"
                    >
                      Back to Edit
                    </button>
                    <button
                      disabled={isProcessing}
                      onClick={() => {
                        void handleConfirmUpload();
                      }}
                      style={styles.doneButton}
                      type="button"
                    >
                      {isProcessing ? 'Uploading...' : 'Confirm & Upload'}
                    </button>
                  </div>
                </div>
              </>
            )}
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

function loadLocalBrowserImage(sourceUri: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image could not be loaded.'));
    image.crossOrigin = 'anonymous';
    image.src = sourceUri;
  });
}

const styles = {
  actions: {
    display: 'flex',
    gap: 10,
    width: '100%',
  },
  aspectLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1.2,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  aspectSelector: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  aspectTab: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 6,
    color: 'rgba(255,255,255,0.72)',
    cursor: 'pointer',
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 700,
    outline: 'none',
    padding: '8px 14px',
    transition: 'all 0.18s ease',
  },
  aspectTabActive: {
    backgroundColor: '#005BD3',
    borderColor: '#005BD3',
    color: '#FFFFFF',
  },
  aspectTabs: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    paddingBottom: 6,
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
  dimensionsBadge: {
    backgroundColor: '#005BD3',
    borderRadius: 20,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 0.5,
    padding: '6px 14px',
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
  heroBackArrow: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  heroContent: {
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    left: 0,
    padding: '12px',
    position: 'absolute',
    right: 0,
  },
  heroDate: {
    color: '#005BD3',
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: 0.8,
  },
  heroFrame: {
    backgroundColor: '#050505',
    borderRadius: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    height: '150px',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  heroHeaderBar: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    left: 0,
    padding: '10px 12px',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  heroImageStyle: {
    height: '100%',
    objectFit: 'contain',
    width: '100%',
  },
  heroInfoButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: '11px',
    color: '#FFFFFF',
    display: 'flex',
    fontSize: 14,
    height: '22px',
    justifyContent: 'center',
    width: '22px',
  },
  heroOverlay: {
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)',
    inset: 0,
    position: 'absolute',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 900,
  },
  heroVenue: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 9,
    fontWeight: 500,
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
  mockupCard: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxWidth: 240,
    width: '100%',
  },
  mockupGrid: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    paddingBottom: 20,
    width: '100%',
  },
  mockupHero: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxWidth: 380,
    width: '100%',
  },
  mockupLabel: {
    color: 'rgba(255,255,255,0.48)',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
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
  previewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    flex: 1,
    padding: '0 16px',
    overflowY: 'auto',
  },
  previewInfo: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginTop: 8,
  },
  previewSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    lineHeight: '16px',
    textAlign: 'center',
  },
  skipButton: {
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
  ticketCardBlueHeader: {
    backgroundColor: '#005BD3',
    height: '8px',
    width: '100%',
  },
  ticketCardButton: {
    backgroundColor: '#005BD3',
    borderRadius: 4,
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 0.5,
    marginTop: 6,
    padding: '6px 0',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  ticketCardFooter: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '10px 12px 12px',
  },
  ticketCardFrame: {
    backgroundColor: '#1C1C1E',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    height: '270px',
    overflow: 'hidden',
    width: '180px',
  },
  ticketCardImage: {
    height: '100%',
    objectFit: 'contain',
    width: '100%',
  },
  ticketCardImageContainer: {
    alignItems: 'center',
    backgroundColor: '#000000',
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  ticketCardText1: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  ticketCardText2: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: 600,
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
