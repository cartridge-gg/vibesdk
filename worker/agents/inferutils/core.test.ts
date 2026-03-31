import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';

import {
	buildCompatibilityChatCompletionParams,
} from './core';

describe('buildCompatibilityChatCompletionParams', () => {
	it('uses Google-compatible request fields for google-ai-studio', () => {
		const schema = z.object({ answer: z.string() });
		const params = buildCompatibilityChatCompletionParams({
			provider: 'google-ai-studio',
			modelName: 'google-ai-studio/gemini-3-flash-preview',
			messages: [{ role: 'user', content: 'debug this' }],
			maxTokens: 8000,
			stream: false,
			reasoning_effort: 'high',
			modelNonReasoning: false,
			schemaResponseFormat: zodResponseFormat(schema, 'deepDebugger'),
		});

		expect(params).toMatchObject({
			model: 'google-ai-studio/gemini-3-flash-preview',
			max_tokens: 8000,
		});
		expect('max_completion_tokens' in params).toBe(false);
		expect('reasoning_effort' in params).toBe(false);
		expect('response_format' in params).toBe(true);
	});

	it('uses OpenAI-native request fields for openai models', () => {
		const params = buildCompatibilityChatCompletionParams({
			provider: 'openai',
			modelName: 'openai/gpt-5',
			messages: [{ role: 'user', content: 'debug this' }],
			maxTokens: 4000,
			stream: false,
			reasoning_effort: 'high',
			modelNonReasoning: false,
		});

		expect(params).toMatchObject({
			model: 'openai/gpt-5',
			max_completion_tokens: 4000,
			reasoning_effort: 'high',
		});
		expect('max_tokens' in params).toBe(false);
	});
});
