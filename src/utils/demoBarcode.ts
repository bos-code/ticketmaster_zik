export type DemoBarcodeSegment = {
  filled: boolean;
  width: number;
};

const BARCODE_GUARD: DemoBarcodeSegment[] = [
  { filled: true, width: 2 },
  { filled: false, width: 1 },
  { filled: true, width: 1 },
  { filled: false, width: 1 },
];

export function createDemoBarcodeSegments(
  barcodeValue?: string,
): DemoBarcodeSegment[] {
  const normalizedValue = barcodeValue?.trim() || "DEMO-BARCODE";
  const characters = normalizedValue.split("");
  const segments: DemoBarcodeSegment[] = [...BARCODE_GUARD];

  for (let index = 0; index < 48; index += 1) {
    const character = characters[index % characters.length] ?? "D";
    const charCode = character.charCodeAt(0);
    const signal = (charCode + index * 17) % 13;

    segments.push({
      filled: signal % 2 === 0,
      width: (signal % 4) + 1,
    });
  }

  return [...segments, ...BARCODE_GUARD];
}
