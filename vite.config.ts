import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // Support GitHub Pages subpath (/MUHAMMAD-Akram/) when deployed or via env var,
  // while defaulting to './' (relative) so built assets resolve correctly across subpaths,
  // local preview, custom domains, and AI Studio environments.
  const isGitHubPages = process.env.GITHUB_PAGES === 'true';
  const base = process.env.VITE_BASE_PATH || (isGitHubPages ? '/MUHAMMAD-Akram/' : './');

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
