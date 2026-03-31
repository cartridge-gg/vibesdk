import { describe, expect, it } from 'vitest';

import { getPreviewUrl } from './utils';

describe('getPreviewUrl', () => {
	it('prefers the preview URL when both preview and tunnel URLs are present', () => {
		expect(
			getPreviewUrl(
				'https://8001-example.vibe.localtest.me',
				'https://example.trycloudflare.com',
			),
		).toBe('https://8001-example.vibe.localtest.me');
	});

	it('falls back to the preview URL when no tunnel URL exists', () => {
		expect(getPreviewUrl('https://8001-example.vibe.localtest.me')).toBe(
			'https://8001-example.vibe.localtest.me',
		);
	});

	it('falls back to the tunnel URL when no preview URL exists', () => {
		expect(getPreviewUrl(undefined, 'https://example.trycloudflare.com')).toBe(
			'https://example.trycloudflare.com',
		);
	});
});
