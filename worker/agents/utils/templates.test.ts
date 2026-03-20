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
		expect(template.allFiles['wrangler.jsonc']).toContain(
			'"main": "worker/index.ts"',
		);
		expect(template.allFiles['src/App.tsx']).toContain('Hello world.');
		expect(template.allFiles['worker/index.ts']).toContain('/api/health');
	});

	it('keeps the starter dependency set minimal', () => {
		const template = createHelloWorldViteTemplateDetails();
		const packageJson = JSON.parse(template.allFiles['package.json']) as {
			dependencies: Record<string, string>;
			devDependencies: Record<string, string>;
		};

		expect(packageJson.dependencies).toEqual({
			react: '^18.3.1',
			'react-dom': '^18.3.1',
		});
		expect(packageJson.devDependencies).not.toHaveProperty('eslint');
		expect(packageJson.devDependencies).not.toHaveProperty('tailwindcss');
	});

	it('returns built-in templates by name', () => {
		expect(
			getBuiltInTemplateDetails(BUILTIN_MINIMAL_VITE_TEMPLATE_NAME)
				?.name,
		).toBe(BUILTIN_MINIMAL_VITE_TEMPLATE_NAME);
		expect(getBuiltInTemplateDetails('does-not-exist')).toBeNull();
	});
});
