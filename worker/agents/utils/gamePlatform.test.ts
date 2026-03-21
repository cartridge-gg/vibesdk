import { describe, expect, it } from 'vitest';

import {
	appendGamePlatformQuery,
	filterGameTemplates,
	isGameTemplate,
} from './gamePlatform';
import type { TemplateInfo } from '../../services/sandbox/sandboxTypes';

function makeTemplate(
	partial: Partial<TemplateInfo> & Pick<TemplateInfo, 'name'>,
): TemplateInfo {
	return {
		name: partial.name,
		language: partial.language ?? 'TypeScript',
		frameworks: partial.frameworks ?? [],
		projectType: partial.projectType ?? 'app',
		description: partial.description ?? {
			selection: 'Template description',
			usage: 'Template usage',
		},
		renderMode: partial.renderMode,
		slideDirectory: partial.slideDirectory,
		disabled: partial.disabled ?? false,
	};
}

describe('gamePlatform', () => {
	it('appends the platform requirements once', () => {
		const query = appendGamePlatformQuery('Build a roguelite');
		expect(query).toContain('Platform requirements:');
		expect(query).toContain('native React');
		expect(query).toContain('Cartridge Controller sign-in by default');
		expect(query).not.toContain('Phaser');
		expect(appendGamePlatformQuery(query)).toBe(query);
	});

	it('detects game-oriented app templates', () => {
		const template = makeTemplate({
			name: 'react-phaser-game',
			frameworks: ['React', 'Phaser'],
			description: {
				selection:
					'Starter for 2D arcade games with scenes and sprite systems',
				usage: 'Use for browser games',
			},
		});

		expect(isGameTemplate(template)).toBe(true);
	});

	it('rejects non-game templates even when they are app templates', () => {
		const template = makeTemplate({
			name: 'react-dashboard',
			frameworks: ['React', 'Recharts'],
			description: {
				selection:
					'Analytics dashboard template with charts and tables',
				usage: 'Use for internal admin tools',
			},
		});

		expect(isGameTemplate(template)).toBe(false);
	});

	it('filters only game-capable templates', () => {
		const templates = [
			makeTemplate({
				name: 'react-phaser-game',
				frameworks: ['React', 'Phaser'],
				description: {
					selection: '2D game starter',
					usage: 'Game projects',
				},
			}),
			makeTemplate({
				name: 'react-dashboard',
				frameworks: ['React'],
				description: {
					selection: 'SaaS dashboard',
					usage: 'Admin analytics',
				},
			}),
		];

		expect(
			filterGameTemplates(templates).map((template) => template.name),
		).toEqual(['react-phaser-game']);
	});
});
