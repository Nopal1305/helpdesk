import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react' 

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/helpdesk/' : '/',
  plugins: [
    react(), 
    tailwindcss(),
  ],
  server: {
    host: true, 
    port: 5173, 
  },
})