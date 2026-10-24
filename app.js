/**
 * ========================================================================
 * Muhammad Akram Portfolio & Visual Admin Studio
 * cPanel Phusion Passenger Startup Entry Point
 * ========================================================================
 * When deploying to cPanel via "Setup Node.js App", Passenger executes
 * this file directly.
 *
 * It boots the bundled server in production or server.ts in development.
 */

import fs from 'fs';
import path from 'path';

const distServer = path.resolve(process.cwd(), 'dist', 'server.js');

if (fs.existsSync(distServer)) {
  await import('./dist/server.js');
} else {
  await import('./server.ts');
}
