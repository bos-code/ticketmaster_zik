import { forwardRef, useImperativeHandle } from 'react';

export type WebImageCropperHandle = {
  openFileDialog: () => void;
  openSource: (sourceUri: string) => void;
};

type WebImageCropperProps = {
  aspect?: number;
  onCroppedImage: (imageUri: string) => void;
  onError?: (message: string) => void;
  onProcessingChange?: (isProcessing: boolean) => void;
  outputHeight?: number;
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
