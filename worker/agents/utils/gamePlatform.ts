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
- Use React for shell UI such as menus, HUD wrappers, auth, settings, inventory, progression, and social/lobby surfaces. Use a game engine or rendering layer for real-time gameplay when beneficial.

## 2D Engine Routing
- Phaser: default choice for most 2D games, especially arcade, platformer, top-down, puzzle, action, and scene-based games. It is the best general-purpose choice when the prompt needs scenes, input, cameras, tilemaps, or established gameplay structure.
- PixiJS: choose for renderer-first games, board/card games, visual-novel hybrids, custom battle systems, or graphics-heavy experiences where you want full control of the game loop. PixiJS is a rendering engine, not a full batteries-included gameplay engine.
- Excalibur.js: choose for TypeScript-first 2D games that benefit from a more structured engine with scenes, actors, collisions, and a smaller conceptual surface than Phaser.
- Kaboom: reserve for tiny arcade prototypes and ultra-small MVPs. Avoid it for larger or longer-lived projects unless the prompt clearly favors minimalism over extensibility.
- Godot: do not choose by default in this platform. Only consider it when the user explicitly asks for Godot-style workflows and the web-export tradeoffs are acceptable. This platform is Vite/browser-first, not native-engine-first.

## Mandatory Game Architecture Rules
- Always define the core loop, controls, win/lose conditions, scoring, progression, pause/resume behavior, and restart behavior explicitly.
- Default to a fully browser-run game with local client-side state only.
- Do not add Cartridge Controller authentication, backend persistence, multiplayer/server authority, or Dojo-oriented architecture unless the user explicitly asks for it.
- Keep the code simple and easy to extend later, but do not invent future backend requirements in the current MVP.`;

export const GAME_PLATFORM_QUERY_SUFFIX = `Platform requirements:
- Build a game only. If my request is not obviously a game, reinterpret it as a game concept instead of building a generic app.
- Choose the most suitable 2D engine or rendering approach for the gameplay: Phaser by default, PixiJS for renderer-first/custom-loop games, Excalibur.js for TypeScript-first structured 2D games, Kaboom only for tiny prototypes, and avoid Godot unless explicitly justified.
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
