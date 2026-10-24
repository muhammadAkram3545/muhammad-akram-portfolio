/**
 * Custom CSS Sanitizer
 * Ensures custom CSS rules remain pure styles and cannot execute scripts,
 * embed HTML tags, or perform malicious script injection.
 */
export function sanitizeCustomCss(rawCss: string): string {
  if (!rawCss || typeof rawCss !== 'string') {
    return '';
  }

  let sanitized = rawCss;

  // 1. Remove HTML tags (<script>, </script>, <iframe>, <style>, etc.)
  sanitized = sanitized.replace(/<\/?(script|iframe|object|embed|applet|style|html|body|svg|img)[^>]*>/gi, '');

  // 2. Remove JavaScript pseudo-protocol (javascript:...)
  sanitized = sanitized.replace(/javascript\s*:/gi, 'forbidden-js:');

  // 3. Remove vbscript: and data:text/html
  sanitized = sanitized.replace(/vbscript\s*:/gi, 'forbidden-vb:');
  sanitized = sanitized.replace(/data\s*:\s*text\/html/gi, 'forbidden-data:');

  // 4. Remove Internet Explorer expressions: expression(...)
  sanitized = sanitized.replace(/expression\s*\([^)]*\)/gi, '/* expression removed */');

  // 5. Remove -moz-binding / behavior properties used for XSS in old engines
  sanitized = sanitized.replace(/behavior\s*:/gi, '/* behavior: */');
  sanitized = sanitized.replace(/-moz-binding\s*:/gi, '/* -moz-binding: */');

  // 6. Restrict @import from loading external scripts or arbitrary non-css files
  sanitized = sanitized.replace(/@import\s+[^;]+;/gi, (match) => {
    // Only allow standard http/https or fonts stylesheets
    if (match.includes('.css') || match.includes('fonts.googleapis.com')) {
      return match;
    }
    return '/* disallowed @import */';
  });

  return sanitized.trim();
}
