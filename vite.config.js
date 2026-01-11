import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Burmese_conversation_study_advanved/',  // IMPORTANT: Must match your repository name
})