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
- Every game must ship with Cartridge Controller authentication and a sign-in flow by default, using the platform's existing integration pattern.
- If the user explicitly asks for Dojo, onchain backend state, Torii-backed realtime state, or Starknet authority, implement the backend with Dojo instead of inventing REST APIs, databases, Durable Objects, or a separate client-side source of truth for authoritative gameplay state.
- In Dojo mode, authoritative state lives in Dojo World models and systems, local development uses Katana, build/deploy flows use Sozo, realtime reads come from Torii, and the web client uses dojo.js with a single SDK initialization plus provider wiring.
- Treat player identity as available from Controller, but keep gameplay state browser-local unless the user explicitly asks for persistence, multiplayer authority, or onchain execution.
- Do not add actual Dojo contracts, Katana, Torii, Slot deployment, backend persistence, or multiplayer/server authority unless the user explicitly asks for them.
- Even without shipping Dojo code yet, structure the game so it could later map cleanly onto a Dojo World:
  - Model authoritative gameplay state as small, serializable, ECS-friendly records with stable entity IDs or keys.
  - Express gameplay mutations as explicit commands or actions with deterministic state transitions.
  - Separate authoritative state from derived presentation state, animation state, and other client-only juice.
  - Emit and track meaningful domain events so future indexing and subscriptions have a natural source of truth.
  - Favor atomic step resolution over designs that require per-frame onchain writes; real-time presentation is fine, but authoritative actions should be coarse enough to fit transactions.
  - Keep reads and writes conceptually separate so a future client could read indexed state and submit actions optimistically, then reconcile against authority.
- Keep the code simple and easy to extend later, but do not invent future backend requirements in the current MVP.`;

export const GAME_PLATFORM_QUERY_SUFFIX = `Platform requirements:
- Build a game only. If my request is not obviously a game, reinterpret it as a game concept instead of building a generic app.
- Implement the game in native React with ordinary browser APIs, local state, and TypeScript utilities. Do not use any game engine unless I explicitly ask for one.
- Include Cartridge Controller sign-in by default using the existing platform integration pattern.
- If I explicitly ask for Dojo or onchain backend state, use Dojo for authoritative state and realtime queries instead of a separate backend or client-side state library.
- Keep gameplay state browser-local by default; do not add persistence or backend systems unless explicitly requested.
- Keep the game design Dojo-compatible: stable entities, small serializable state records, explicit player commands, deterministic updates, and clear event boundaries.`;

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
