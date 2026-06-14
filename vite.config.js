import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,   // safe: Vite copies public/ AFTER clearing dist/
  },
  // Files in public/ are copied verbatim into dist/ after every build.
  // admin.html, admin.js, admin.css, _redirects all live there.
  publicDir: 'public',
});
