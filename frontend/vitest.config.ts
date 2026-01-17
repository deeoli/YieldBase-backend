import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

export default defineConfig({
	test: {
		environment: 'jsdom',
		setupFiles: [],
	},
	resolve: {
		alias: {
			'@': resolve(dirname(fileURLToPath(import.meta.url)), './'),
		},
	},
})
