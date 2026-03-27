import { describe, expect, it } from 'vitest';

import { requiresSandboxRecreation } from './DeploymentManager';

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
});
