import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
	css: {
		devSourcemap: true,
	},
	build: {
		cssCodeSplit: true,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('/src/styles/')) return 'styles'
				},
				assetFileNames: assetInfo => {
					if (assetInfo.name && assetInfo.name.endsWith('.css')) {
						return 'assets/css/[name]-[hash][extname]'
					}
					return 'assets/[name]-[hash][extname]'
				},
			},
		},
	},

	server: {
		host: '0.0.0.0',
		port: 5173,
	},
	plugins: [react()],
})
