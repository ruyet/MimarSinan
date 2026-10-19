import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base: one build works from the domain root (local preview, Netlify, Vercel) and
  // from any subfolder (e.g. /MimarSinan/ on Hera) without naming the folder anywhere.
  // Safe here because the story navigates with #hashes, never with paths.
  // Runtime paths into /public go through core/asset.ts (import.meta.env.BASE_URL).
  base: './',
  build: {
    target: 'es2022',
    cssCodeSplit: true,
  },
});
