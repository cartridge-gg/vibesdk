// import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import wasm from 'vite-plugin-wasm';
import path from 'path';

import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
const localAppDomain = process.env.LOCAL_APP_DOMAIN || 'vibe.localtest.me';

export default defineConfig({
	optimizeDeps: {
		exclude: ['format', 'editor.all'],
		include: ['monaco-editor/esm/vs/editor/editor.api'],
		force: true,
	},

	// build: {
	//     rollupOptions: {
	//       output: {
	//             advancedChunks: {
	//                 groups: [{name: 'vendor', test: /node_modules/}]
	//             }
	//         }
	//     }
	// },
	plugins: [
		react(),
		svgr(),
		wasm(),
		cloudflare({
			configPath: 'wrangler.jsonc',
			remoteBindings: process.env.CLOUDFLARE_REMOTE_BINDINGS === 'true',
			config: (config) => {
				if (process.env.DEV_MODE !== 'true') return;

				return {
					vars: {
						...(config.vars ?? {}),
						CUSTOM_DOMAIN: localAppDomain,
						CUSTOM_PREVIEW_DOMAIN: localAppDomain,
						ENVIRONMENT: 'local',
					},
				};
			},
		}),
		tailwindcss(),
		// sentryVitePlugin({
		// 	org: 'cloudflare-0u',
		// 	project: 'javascript-react',
		// }),
	],

	resolve: {
		alias: {
			debug: 'debug/src/browser',
			'@': path.resolve(__dirname, './src'),
			'shared': path.resolve(__dirname, './shared'),
			'worker': path.resolve(__dirname, './worker'),
		},
	},

	// Configure for Prisma + Cloudflare Workers compatibility
	define: {
		// Ensure proper module definitions for Cloudflare Workers context
		'process.env.NODE_ENV': JSON.stringify(
			process.env.NODE_ENV || 'development',
		),
		global: 'globalThis',
		// '__filename': '""',
		// '__dirname': '""',
	},

	worker: {
		// Handle Prisma in worker context for development
		format: 'es',
	},

	server: {
		host: '127.0.0.1',
		port: 4777,
		strictPort: true,
		allowedHosts: [localAppDomain, `.${localAppDomain}`],
		origin: `https://${localAppDomain}`,
		hmr: {
			host: localAppDomain,
			protocol: 'wss',
			clientPort: 443,
		},
	},

	// Clear cache more aggressively
	cacheDir: 'node_modules/.vite',
});
