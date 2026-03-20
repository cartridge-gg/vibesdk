import { describe, expect, it } from 'vitest';

import { stripVersionConstraintsFromInstallCommand } from './common';

describe('stripVersionConstraintsFromInstallCommand', () => {
	it('strips versions from unscoped packages', () => {
		expect(
			stripVersionConstraintsFromInstallCommand(
				'bun add lucide-react@^0.450.0',
			),
		).toBe('bun add lucide-react');
	});

	it('strips versions from scoped packages', () => {
		expect(
			stripVersionConstraintsFromInstallCommand(
				'bun add @radix-ui/react-dialog@^1.1.15',
			),
		).toBe('bun add @radix-ui/react-dialog');
	});

	it('preserves flags while stripping package versions', () => {
		expect(
			stripVersionConstraintsFromInstallCommand(
				'bun add -d typescript@^5.9.3 @types/node@^22.19.3',
			),
		).toBe('bun add -d typescript @types/node');
	});

	it('returns null when there is no version to strip', () => {
		expect(stripVersionConstraintsFromInstallCommand('bun add react')).toBe(
			null,
		);
	});
});
