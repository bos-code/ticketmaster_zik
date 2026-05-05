const FALLBACK_CENTER = {
  latitude: 40.7505,
  longitude: -73.9934,
};

const GOOGLE_STATIC_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const STATIC_MAP_STYLE_PARAMS = [
  "feature:poi|visibility:off",
  "feature:transit.station|visibility:simplified",
  "feature:road.highway|element:geometry|color:0xd8dbe0",
  "feature:road.arterial|element:geometry|color:0xe6e7ea",
  "feature:road.local|element:geometry|color:0xf0f0f2",
  "feature:water|element:geometry|color:0xe9edf1",
  "element:labels.text.fill|color:0x5f6368",
  "element:labels.text.stroke|color:0xf7f7f7",
];

export function buildStaticMapPreviewUrl(
  longitude?: number | null,
  latitude?: number | null,
) {
  const resolvedLongitude =
    typeof longitude === "number" ? longitude : FALLBACK_CENTER.longitude;
  const resolvedLatitude =
    typeof latitude === "number" ? latitude : FALLBACK_CENTER.latitude;

  if (!GOOGLE_STATIC_MAPS_KEY) {
    return `https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=1200&height=700&center=lonlat:${resolvedLongitude},${resolvedLatitude}&zoom=14`;
  }

  const params = new URLSearchParams({
    center: `${resolvedLatitude},${resolvedLongitude}`,
    format: "png",
    key: GOOGLE_STATIC_MAPS_KEY,
    maptype: "roadmap",
    scale: "2",
    size: "1200x700",
    zoom: "15",
  });

  STATIC_MAP_STYLE_PARAMS.forEach((style) => {
    params.append("style", style);
  });

  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}
