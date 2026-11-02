/**
 * Sample photography comes from Unsplash (free to use under the Unsplash licence).
 * The source is capped at 1600px wide; next/image then serves smaller responsive sizes.
 */
export function unsplash(photoId: string, width = 1600) {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}
