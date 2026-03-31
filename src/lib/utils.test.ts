import { describe, expect, it } from 'vitest';

import { getPreviewUrl } from './utils';

describe('getPreviewUrl', () => {
	it('prefers the tunnel URL when one is available', () => {
		expect(
			getPreviewUrl(
				'https://8001-example.vibe.localtest.me',
				'https://example.trycloudflare.com',
			),
		).toBe('https://example.trycloudflare.com');
	});

	it('falls back to the preview URL when no tunnel URL exists', () => {
		expect(getPreviewUrl('https://8001-example.vibe.localtest.me')).toBe(
			'https://8001-example.vibe.localtest.me',
		);
	});
});
