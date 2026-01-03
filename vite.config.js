import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/burmese-learning-app/',  // IMPORTANT: Must match your repository name
})
