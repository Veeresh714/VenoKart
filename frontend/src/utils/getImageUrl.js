// Our backend stores image paths as relative URLs, e.g. "/uploads/products/shoe.png".
// A relative path only works if the browser happens to load it from the same
// origin as the backend. This helper always builds a full, correct URL,
// so images render whether we're in dev (via Vite proxy), in production
// (frontend and backend on different domains), or anywhere in between.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getImageUrl = (path) => {
  if (!path) {
    return `${API_URL}/uploads/products/no-image.png`;
  }

  // Already a full/usable URL - pass through unchanged. This covers:
  // - "http(s)://..." real remote URLs
  // - "blob:..." temporary local previews (see AdminProductForm's file input)
  // - "data:..." base64-encoded images
  if (
    path.startsWith("http") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  // Otherwise it's a relative path from our own backend - prefix it.
  return `${API_URL}${path}`;
};
