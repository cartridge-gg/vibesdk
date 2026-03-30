import { describe, expect, it } from 'vitest';

import {
	MASTER_DEPLOYMENT_TIMEOUT_MS,
	MIN_SANDBOX_SETUP_TIMEOUT_MS,
	PER_ATTEMPT_TIMEOUT_MS,
	requiresSandboxRecreation,
} from './DeploymentManager';

describe('requiresSandboxRecreation', () => {
	it('forces sandbox recreation for cairo and dojo runtime files', () => {
		expect(
			requiresSandboxRecreation([
				{ filePath: 'src/models.cairo', fileContents: '' },
				{ filePath: 'src/App.tsx', fileContents: '' },
			]),
		).toBe(true);

		expect(
			requiresSandboxRecreation([
				{ filePath: 'contracts/src/systems.cairo', fileContents: '' },
			]),
		).toBe(true);

		expect(
			requiresSandboxRecreation([
				{ filePath: 'dojo_dev.toml', fileContents: '' },
			]),
		).toBe(true);
	});

	it('does not force sandbox recreation for ordinary frontend-only edits', () => {
		expect(
			requiresSandboxRecreation([
				{ filePath: 'src/App.tsx', fileContents: '' },
				{ filePath: 'src/index.css', fileContents: '' },
			]),
		).toBe(false);
	});

	it('allows one full sandbox setup attempt before deployment retries', () => {
		expect(PER_ATTEMPT_TIMEOUT_MS).toBeGreaterThan(
			MIN_SANDBOX_SETUP_TIMEOUT_MS,
		);
		expect(MASTER_DEPLOYMENT_TIMEOUT_MS).toBeGreaterThan(
			PER_ATTEMPT_TIMEOUT_MS,
		);
	});
});
