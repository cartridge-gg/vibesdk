import { describe, expect, it } from 'vitest';
import {
	BUILTIN_MINIMAL_VITE_TEMPLATE_NAME,
	createHelloWorldViteTemplateDetails,
	getBuiltInTemplateDetails,
} from './templates';

describe('templates', () => {
	it('builds the hello-world vite starter with real scaffold files', () => {
		const template = createHelloWorldViteTemplateDetails();

		expect(template.name).toBe(BUILTIN_MINIMAL_VITE_TEMPLATE_NAME);
		expect(template.projectType).toBe('app');
		expect(template.allFiles['package.json']).toContain('"dev": "vite');
		expect(template.allFiles['vite.config.ts']).toContain(
			"@cloudflare/vite-plugin",
		);
		expect(template.allFiles['vite.config.ts']).toContain(
			"@tailwindcss/vite",
		);
		expect(template.allFiles['vite.config.ts']).toContain(
			"vite-plugin-wasm",
		);
		expect(template.allFiles['vite.config.ts']).toContain(
			"vite-plugin-top-level-await",
		);
		expect(template.allFiles['vite.config.ts']).toContain(
			"vite-plugin-node-polyfills",
		);
		expect(template.allFiles['vite-plugin-node-polyfills.d.ts']).toContain(
			"declare module 'vite-plugin-node-polyfills'",
		);
		expect(template.allFiles['wrangler.jsonc']).toContain(
			'"main": "worker/index.ts"',
		);
		expect(template.allFiles['src/App.tsx']).toContain('Hello world.');
		expect(template.allFiles['src/App.tsx']).toContain(
			'without any engine assumptions',
		);
		expect(template.allFiles['src/index.css']).toContain(
			'@import "tailwindcss";',
		);
		expect(template.allFiles['src/lib/utils.ts']).toContain(
			"export function cn",
		);
		expect(template.allFiles['worker/index.ts']).toContain('/api/health');
	});

	it('includes controller and dojo-ready starter dependencies', () => {
		const template = createHelloWorldViteTemplateDetails();
		const packageJson = JSON.parse(template.allFiles['package.json']) as {
			dependencies: Record<string, string>;
			devDependencies: Record<string, string>;
		};

		expect(packageJson.dependencies).toMatchObject({
			'@cartridge/connector': '0.11.3-alpha.1',
			'@cartridge/controller': '0.11.3-alpha.1',
			'@dojoengine/core': '1.8.8',
			'@dojoengine/create-burner': '1.8.10',
			'@dojoengine/sdk': '1.9.0',
			'@dojoengine/state': '1.8.5',
			'@dojoengine/torii-client': '1.8.2',
			'@dojoengine/utils': '1.8.4',
			'@starknet-react/chains': '5.0.3',
			'@starknet-react/core': '5.0.3',
			'@tanstack/react-query': '^5.95.2',
			clsx: '^2.1.1',
			react: '19.2.3',
			'react-dom': '19.2.3',
			starknet: '8.9.2',
			'tailwind-merge': '^3.4.0',
		});
		expect(packageJson.devDependencies).toMatchObject({
			'@tailwindcss/vite': '^4.2.2',
			'@types/react': '19.2.7',
			'@types/react-dom': '19.2.3',
			'@vitejs/plugin-react': '5.1.2',
			tailwindcss: '^4.2.2',
			vite: 'npm:rolldown-vite@7.1.13',
			'vite-plugin-node-polyfills': '^0.23.0',
			'vite-plugin-top-level-await': '^1.6.0',
			'vite-plugin-wasm': '^3.6.0',
		});
		expect(packageJson.devDependencies).not.toHaveProperty('eslint');
		expect(template.description.usage).toContain(
			'native React components, hooks, and browser APIs',
		);
	});

	it('returns built-in templates by name', () => {
		expect(
			getBuiltInTemplateDetails(BUILTIN_MINIMAL_VITE_TEMPLATE_NAME)
				?.name,
		).toBe(BUILTIN_MINIMAL_VITE_TEMPLATE_NAME);
		expect(getBuiltInTemplateDetails('does-not-exist')).toBeNull();
	});
});
