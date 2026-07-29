/**
 * Optimizes Unsplash image URLs on the fly by appending size and quality parameters.
 * Reduces image size from several megabytes to ~50-150KB.
 */
export function optimizeImageUrl(url: string, width: number = 600): string {
  if (!url) return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';
  
  if (url.includes('unsplash.com')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?auto=format&fit=crop&w=${width}&q=80`;
  }
  
  return url;
}
