import { forwardRef, useImperativeHandle } from 'react';

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

export const WebImageCropper = forwardRef<WebImageCropperHandle, WebImageCropperProps>(
  function WebImageCropper(_props, ref) {
    useImperativeHandle(
      ref,
      () => ({
        openFileDialog() {},
        openSource() {},
      }),
      [],
    );

    return null;
  },
);
