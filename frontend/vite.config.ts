import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
//import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
//    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@heroicons/vue': fileURLToPath(new URL('./node_modules/@heroicons/vue', import.meta.url))
    }
  }
})
