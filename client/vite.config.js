import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { configDefaults } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:5001',
                changeOrigin: true,
            }
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.js',
        exclude: [...configDefaults.exclude, 'e2e/*'],
    },
})
