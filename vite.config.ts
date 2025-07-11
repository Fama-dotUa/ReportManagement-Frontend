import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
export default defineConfig({
	server: {
		host: '0.0.0.0',
		port: 5173,
	},
	plugins: [react()],
	resolve: {
		alias: {
			src: path.resolve(__dirname, './src'),
		},
	},
})
