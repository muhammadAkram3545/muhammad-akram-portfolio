/**
 * Resolves local public asset paths (e.g. /assets/images/...) to the current base path
 * ensuring assets work seamlessly across root domains, GitHub Pages subpaths (/MUHAMMAD-Akram/),
 * and local preview environments.
 *
 * Guarantees:
 * 1. Idempotent: Calling resolveAssetUrl multiple times on the same path never double-prefixes.
 * 2. Preserves external URLs (http://, https://, data:, blob:, //cdn...).
 * 3. Handles both leading slash (/assets/...) and relative (assets/...) paths.
 * 4. Works when base is '/', './', or a subpath like '/MUHAMMAD-Akram/'.
 */
export function resolveAssetUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Remote URLs (Supabase storage, external CDNs, data URLs, blob URLs, protocol-relative) remain untouched
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('//')
  ) {
    return trimmed;
  }

  // Get Vite's configured base URL (e.g. '/MUHAMMAD-Akram/' on GitHub Pages, or './' / '/')
  const rawBase = import.meta.env.BASE_URL || '/';

  // If base is root '/', ensure single leading slash and return
  if (rawBase === '/' || rawBase === '') {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  // Normalize base: ensure trailing slash
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

  // Check if trimmed path is ALREADY prefixed with base (prevents double-prefixing)
  if (trimmed.startsWith(base)) {
    return trimmed;
  }

  // If base has a leading slash (like '/MUHAMMAD-Akram/'), also check if trimmed
  // starts with the slash-less version (like 'MUHAMMAD-Akram/...')
  const slashlessBase = base.replace(/^\/+/, '');
  if (slashlessBase && trimmed.startsWith(slashlessBase)) {
    return base.startsWith('/') ? `/${trimmed}` : trimmed;
  }

  // If base is relative (like './'), check if trimmed already starts with './'
  if (base === './' && trimmed.startsWith('./')) {
    return trimmed;
  }

  // Strip any leading slashes from the target path before appending to base
  const cleanPath = trimmed.replace(/^\/+/, '');

  return `${base}${cleanPath}`;
}

