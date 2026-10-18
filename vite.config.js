import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({ base: './', plugins: [vue()], build: { rolldownOptions: { output: { manualChunks(id) { if (id.includes('chart.js')) return 'charts' } } } } })
