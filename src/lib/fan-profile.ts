export type FanProfile = { name: string; email: string };
export const emptyProfile: FanProfile = { name: '', email: '' };

export function migrateFanPreferences(persisted: unknown) {
  const state = (persisted ?? {}) as { profile?: FanProfile; savedEventIds?: string[]; favouriteArtistIds?: string[] };
  // Remove only the untouched screenshot identity from the earlier UI fixture.
  // Preserve profile fields that the user has already changed.
  const copiedIdentity = state.profile?.name === 'Zik Zik' && state.profile?.email === 'zik.graphix@gmail.com';
  return {
    ...state,
    profile: copiedIdentity || !state.profile ? { ...emptyProfile } : state.profile,
    savedEventIds: state.savedEventIds?.filter((id) => !id.startsWith('reference-')) ?? [],
    favouriteArtistIds: state.favouriteArtistIds?.filter((id) => !id.startsWith('reference-')) ?? [],
  };
}
