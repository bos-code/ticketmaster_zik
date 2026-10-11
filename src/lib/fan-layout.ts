export function getFanLayout(width: number) {
  const wide = width >= 768;
  const padding = wide ? 32 : 16;
  const contentWidth = Math.max(0, width - padding * 2);
  const columns = wide ? 2 : 1;
  return {
    wide, padding, contentWidth,
    columnWidth: Math.max(0, (contentWidth - (columns - 1) * 24) / columns),
    eventCardWidth: Math.min(360, Math.max(0, Math.min(contentWidth, width * 0.68))),
    compactCardWidth: Math.min(280, Math.max(0, Math.min(contentWidth, width * 0.42))),
    cityCardWidth: Math.min(220, Math.max(0, Math.min(contentWidth, width * 0.32))),
    artistGroupWidth: Math.min(420, Math.max(0, contentWidth * (wide ? 1 : 0.92))),
  };
}

export function getViewerLayout(width: number) {
  const cardWidth = Math.max(0, Math.min(480, width - 32));
  return { cardWidth, sidePadding: Math.max(0, (width - cardWidth) / 2), snapInterval: cardWidth + 12 };
}
