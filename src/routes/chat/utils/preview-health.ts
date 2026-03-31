export interface PreviewHealthIssue {
	reason: string;
	details: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export function getPreviewHealthIssue(
	payload: unknown,
	expectedUrl: string,
): PreviewHealthIssue | null {
	if (!isRecord(payload)) {
		return null;
	}

	if (
		payload.type !== 'screenshot_analysis_result' ||
		payload.url !== expectedUrl ||
		!isRecord(payload.analysis) ||
		payload.analysis.hasIssues !== true
	) {
		return null;
	}

	const issues = Array.isArray(payload.analysis.issues)
		? payload.analysis.issues.filter(
				(issue): issue is string => typeof issue === 'string' && issue.length > 0,
			)
		: [];

	return {
		reason: issues[0] ?? 'Preview rendered but appears blank or broken.',
		details: issues,
	};
}
