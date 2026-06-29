import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vercel automatically sets VERCEL_GIT_COMMIT_SHA during every build - no
// configuration needed on Vercel's side. Locally (npm run dev/build without
// Vercel) this is undefined, so we fall back to something obviously "local".
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA || 'local';
const buildTime = new Date().toISOString();

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  define: {
    __BUILD_SHA__: JSON.stringify(commitSha.slice(0, 7)),
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
});
