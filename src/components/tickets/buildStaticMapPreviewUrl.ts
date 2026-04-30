export function buildStaticMapPreviewUrl(
  longitude?: number | null,
  latitude?: number | null,
) {
  if (typeof longitude !== "number" || typeof latitude !== "number") {
    return "https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=1200&height=700&center=lonlat:-73.9934,40.7505&zoom=14&marker=lonlat:-73.9934,40.7505;type:awesome;color:%23ef4444;size:large";
  }

  return `https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=1200&height=700&center=lonlat:${longitude},${latitude}&zoom=14&marker=lonlat:${longitude},${latitude};type:awesome;color:%23ef4444;size:large`;
}
