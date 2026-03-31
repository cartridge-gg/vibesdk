import { describe, expect, it } from 'vitest';

import { analyzeRenderedPreview } from './images';

const populatedScreenshot = Buffer.alloc(12000, 255).toString('base64');

describe('analyzeRenderedPreview', () => {
	it('flags an empty SPA root as a broken render even when the request succeeded', () => {
		const analysis = analyzeRenderedPreview(
			populatedScreenshot,
			'<html><body><div id="root"></div></body></html>',
			100,
			0,
		);

		expect(analysis.hasIssues).toBe(true);
		expect(analysis.emptyRootSelector).toBe('#root');
		expect(analysis.issues).toContain(
			'Rendered document still contains an empty application root (#root).',
		);
	});

	it('does not flag a rendered page with visible UI content', () => {
		const analysis = analyzeRenderedPreview(
			populatedScreenshot,
			'<html><body><div id="root"><main><button>Play</button><canvas></canvas></main></div></body></html>',
			100,
			0,
		);

		expect(analysis.hasIssues).toBe(false);
		expect(analysis.interactiveElementCount).toBe(1);
		expect(analysis.mediaElementCount).toBe(1);
	});

	it('flags obviously blank screenshots even without DOM clues', () => {
		const tinyScreenshot = Buffer.alloc(64, 0).toString('base64');
		const analysis = analyzeRenderedPreview(
			tinyScreenshot,
			'<html><body><div id="root"><main>Ready</main></div></body></html>',
		);

		expect(analysis.hasIssues).toBe(true);
		expect(analysis.blankScreenshotDetected).toBe(true);
	});
});
