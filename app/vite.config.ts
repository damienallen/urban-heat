import { comlink } from 'vite-plugin-comlink'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), comlink()],
    worker: {
        plugins: () => [comlink()],
    },
})
