import { describe, expect, it } from 'vitest';

import { getPreviewHealthIssue } from './preview-health';

describe('getPreviewHealthIssue', () => {
	it('extracts screenshot analysis failures for the active preview URL', () => {
		expect(
			getPreviewHealthIssue(
				{
					type: 'screenshot_analysis_result',
					url: 'https://example.test',
					analysis: {
						hasIssues: true,
						issues: ['Rendered document still contains an empty application root (#root).'],
					},
				},
				'https://example.test',
			),
		).toEqual({
			reason: 'Rendered document still contains an empty application root (#root).',
			details: ['Rendered document still contains an empty application root (#root).'],
		});
	});

	it('ignores healthy analysis results and unrelated preview URLs', () => {
		expect(
			getPreviewHealthIssue(
				{
					type: 'screenshot_analysis_result',
					url: 'https://other.test',
					analysis: {
						hasIssues: true,
						issues: ['Something failed'],
					},
				},
				'https://example.test',
			),
		).toBeNull();

		expect(
			getPreviewHealthIssue(
				{
					type: 'screenshot_analysis_result',
					url: 'https://example.test',
					analysis: {
						hasIssues: false,
						issues: [],
					},
				},
				'https://example.test',
			),
		).toBeNull();
	});
});
