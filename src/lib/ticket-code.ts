import { azteccode, drawingSVG } from '@bwip-js/generic';

// Encode the stored value unchanged. Cosmetic animation stays outside the code.
export function buildTicketAztecSvg(value?: string): string | null {
  if (!value?.trim() || value.length > 1000) return null;
  try {
    // Encoder-specific BWIPP options extend the library's shared RenderOptions.
    const options = { bcid: 'azteccode', text: value, scale: 4, format: 'full', layers: 12, backgroundcolor: 'FFFFFF', barcolor: '000000' };
    return azteccode(options, drawingSVG());
  } catch {
    return null;
  }
}
