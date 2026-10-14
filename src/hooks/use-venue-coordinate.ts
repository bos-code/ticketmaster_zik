import { useQuery } from '@tanstack/react-query';
import { toCoordinate, type VenueMapData } from '@/lib/map-utils';
import { geocodeVenue, getVenueSearchQuery } from '@/lib/venue-geocoding';

export function useVenueCoordinate({ latitude, longitude, venueName, venueAddress }: VenueMapData) {
  const suppliedCoordinate = toCoordinate(latitude, longitude);
  const query = getVenueSearchQuery(venueName, venueAddress);
  const lookup = useQuery({
    queryKey: ['venue-coordinate', query.toLowerCase()],
    queryFn: ({ signal }) => geocodeVenue(query, signal),
    enabled: !suppliedCoordinate && Boolean(query),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  return {
    coordinate: suppliedCoordinate ?? lookup.data ?? null,
    isLoading: !suppliedCoordinate && lookup.isFetching,
    retry: () => void lookup.refetch(),
  };
}
