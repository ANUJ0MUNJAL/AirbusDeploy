import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/AirbusDeploy/', 
  plugins: [react()],
  // Ensure this matches your repository name
  build: {
    outDir: 'dist' // Ensure the output directory is set to 'dist'
  }
});