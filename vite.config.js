import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/hae-portfolio/' : '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        swapifly: resolve(__dirname, 'swapifly.html'),
        hongDa: resolve(__dirname, 'hong-da.html'),
        paragon: resolve(__dirname, 'paragon.html'),
        cityuVmc: resolve(__dirname, 'cityu-vmc.html'),
        listenfield: resolve(__dirname, 'listenfield.html'),
      },
    },
  },
});
