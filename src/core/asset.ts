/**
 * URLs for files in /public (photos, fonts) that are built at runtime.
 *
 * The site may be served from the domain root (local dev, Netlify) or from a subfolder
 * (e.g. /MimarSinan/ on Hera). Vite's `base` is relative (see vite.config.ts), and
 * `import.meta.env.BASE_URL` carries it: '/' in dev, './' in the build. Paths are stored
 * without a leading slash, so they always resolve against the folder the page is served from.
 */
export function publicUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}
