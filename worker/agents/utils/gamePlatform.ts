import type { TemplateInfo } from '../../services/sandbox/sandboxTypes';

const GAME_TEMPLATE_KEYWORDS = [
	'game',
	'gaming',
	'arcade',
	'phaser',
	'pixi',
	'excalibur',
	'kaboom',
	'canvas',
	'sprite',
	'tilemap',
	'platformer',
	'puzzle',
	'dojo',
];

const NON_GAME_TEMPLATE_KEYWORDS = [
	'dashboard',
	'blog',
	'portfolio',
	'e-commerce',
	'ecommerce',
	'saas',
	'landing',
	'presentation',
	'slides',
	'docs',
	'workflow',
];

export const GAME_PLATFORM_SYSTEM_DIRECTIVE = `## Game Platform Mode
- This platform only builds games. Never build SaaS tools, dashboards, blogs, docs sites, or generic CRUD apps for end users.
- If a user request is not explicitly a game, reinterpret it as a game concept that preserves the user's theme, audience, and goals.
- Prioritize browser-first 2D games that fit this stack: React, Vite, Cloudflare Workers, and TypeScript.
- Build gameplay directly with native React, browser events, DOM layout, CSS transforms, and ordinary TypeScript state by default.
- Keep the runtime simple: prefer React components, hooks, timers, animation frames, and lightweight utility modules over any dedicated game engine.

## Runtime Rules
- Do not introduce Phaser, PixiJS, Excalibur, Kaboom, Godot, or any other game engine unless the user explicitly asks for one.
- Prefer declarative UI and interaction patterns that are easy to inspect, patch, and extend in a normal React codebase.
- For arcade-style motion, use requestAnimationFrame, CSS transforms, and plain geometry helpers instead of a scene engine.
- For board, card, puzzle, idle, typing, management, and menu-heavy games, keep everything in standard React components and hooks.

## Mandatory Game Architecture Rules
- Always define the core loop, controls, win/lose conditions, scoring, progression, pause/resume behavior, and restart behavior explicitly.
- Default to a fully browser-run game with local client-side state only.
- Do not add Cartridge Controller authentication, backend persistence, multiplayer/server authority, or Dojo-oriented architecture unless the user explicitly asks for it.
- Keep the code simple and easy to extend later, but do not invent future backend requirements in the current MVP.`;

export const GAME_PLATFORM_QUERY_SUFFIX = `Platform requirements:
- Build a game only. If my request is not obviously a game, reinterpret it as a game concept instead of building a generic app.
- Implement the game in native React with ordinary browser APIs, local state, and TypeScript utilities. Do not use any game engine unless I explicitly ask for one.
- The game should run entirely in the browser by default with local state only.
- Do not add auth, persistence, or backend systems unless explicitly requested.`;

export function appendGamePlatformQuery(query: string): string {
	if (query.includes('Platform requirements:')) {
		return query;
	}

	return `${query.trim()}\n\n${GAME_PLATFORM_QUERY_SUFFIX}`;
}

export function isGameTemplate(
	template: Pick<
		TemplateInfo,
		'name' | 'description' | 'frameworks' | 'projectType'
	>,
): boolean {
	if (template.projectType !== 'app') {
		return false;
	}

	const haystack = [
		template.name,
		template.description.selection,
		template.description.usage,
		...(template.frameworks || []),
	]
		.join(' ')
		.toLowerCase();

	const hasGameSignal = GAME_TEMPLATE_KEYWORDS.some((keyword) =>
		haystack.includes(keyword),
	);
	const hasNonGameSignal = NON_GAME_TEMPLATE_KEYWORDS.some((keyword) =>
		haystack.includes(keyword),
	);

	return hasGameSignal && !hasNonGameSignal;
}

export function filterGameTemplates(templates: TemplateInfo[]): TemplateInfo[] {
	return templates.filter(isGameTemplate);
}
