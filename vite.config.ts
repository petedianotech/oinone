import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import fs from 'fs';

// Automatically ensure PWA and OG assets are in place within /public on boot
try {
  const publicDir = path.resolve(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const srcIcon = path.resolve(__dirname, 'src/assets/images/app_icon_1781010544287.png');
  const destIcon = path.resolve(__dirname, 'public/app_icon.png');
  if (fs.existsSync(srcIcon)) {
    fs.copyFileSync(srcIcon, destIcon);
    console.log('[Assets Sync] Successfully copied app_icon image to public folder.');
  }

  const srcOg = path.resolve(__dirname, 'src/assets/images/og_image_1781010561717.png');
  const destOg = path.resolve(__dirname, 'public/og_image.png');
  if (fs.existsSync(srcOg)) {
    fs.copyFileSync(srcOg, destOg);
    console.log('[Assets Sync] Successfully copied og_image image to public folder.');
  }
} catch (e) {
  console.error('[Assets Sync Error] Failed to auto-copy PWA/OG assets:', e);
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
