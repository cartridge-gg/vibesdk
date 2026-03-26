import { describe, expect, it } from 'vitest';

import { PROMPT_UTILS } from '../../prompts';
import getSystemPrompt from './agenticBuilderPrompts';
import { SYSTEM_PROMPT as dojoIntegratorPrompt } from './dojoIntegratorPrompts';

describe('prompt import guardrails', () => {
	it('tells the main builder to avoid deep package imports for controller and dojo', () => {
		const builderPrompt = getSystemPrompt('app', '');

		expect(builderPrompt).toContain('@cartridge/connector/controller');
		expect(builderPrompt).toContain('@cartridge/connector/dist/');
		expect(builderPrompt).toContain('@dojoengine/torii-client');
		expect(builderPrompt).toContain(
			'@dojoengine/torii-client/dist/client',
		);
	});

	it('tells the dojo integrator to stay on public package entrypoints', () => {
		expect(dojoIntegratorPrompt).toContain(
			'Never import from package internals like `/dist/*`, `/src/*`, or `/lib/*`.',
		);
		expect(dojoIntegratorPrompt).toContain('@cartridge/connector');
		expect(dojoIntegratorPrompt).toContain('@dojoengine/sdk/react');
		expect(dojoIntegratorPrompt).toContain(
			'@dojoengine/torii-client/dist/client',
		);
	});

	it('teaches the shared prompt guardrails with concrete bad and good imports', () => {
		expect(PROMPT_UTILS.COMMON_PITFALLS).toContain(
			'@cartridge/connector/dist/controller',
		);
		expect(PROMPT_UTILS.COMMON_PITFALLS).toContain(
			'@dojoengine/torii-client/dist/client',
		);
		expect(PROMPT_UTILS.COMMON_PITFALLS).toContain(
			"import { ControllerConnector } from '@cartridge/connector';",
		);
		expect(PROMPT_UTILS.COMMON_PITFALLS).toContain(
			"import { DojoSdkProvider } from '@dojoengine/sdk/react';",
		);
	});
});
