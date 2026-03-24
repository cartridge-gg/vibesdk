import { tool, t, type, type Type } from '../types';
import { StructuredLogger } from '../../../logger';
import { ICodingAgent } from 'worker/agents/services/interfaces/ICodingAgent';
import { RenderToolCall } from 'worker/agents/operations/UserConversationProcessor';
import { DojoIntegratorInputs, DojoIntegratorOperation } from 'worker/agents/operations/DojoIntegrator';
import { z } from 'zod';

interface DojoIntegrateToolOptions {
	allowDuringGeneration?: boolean;
}

export function createDojoIntegrateTool(
	agent: ICodingAgent,
	logger: StructuredLogger,
	toolRenderer: RenderToolCall,
	streamCb: (chunk: string) => void,
	options: DojoIntegrateToolOptions = {},
) {
	let callCount = 0;

	const focusPathsType: Type<string[] | undefined> = type(
		z.array(z.string()).optional(),
		(paths: string[] | undefined) => ({
			files: paths
				? { mode: 'write', paths }
				: { mode: 'write', paths: [] },
			gitCommit: true,
			sandbox: { operation: 'deploy' },
		}),
	);

	return tool({
		name: 'dojo_integrate',
		description:
			'Focused Dojo backend integration assistant. Use when the project needs Dojo, onchain authoritative state, Torii-backed realtime state, or Starknet-backed gameplay authority.',
		args: {
			goal: t
				.string()
				.describe(
					'Concrete Dojo integration goal, including the gameplay/backend behavior that should become authoritative onchain state.',
				),
			focus_paths: focusPathsType
				.describe(
					'Optional array of file paths to focus the Dojo integration work on.',
				),
		},
		run: async ({ goal, focus_paths }) => {
			if (callCount > 0) {
				logger.warn(
					'Cannot start Dojo integration: already called once this turn',
				);
				return {
					error: 'CALL_LIMIT_EXCEEDED: You are only allowed to make a single dojo_integrate call per conversation turn.',
				};
			}

			callCount++;

			if (!options.allowDuringGeneration && agent.isCodeGenerating()) {
				logger.warn(
					'Cannot start Dojo integration: code generation is in progress',
				);
				return {
					error: 'GENERATION_IN_PROGRESS: Code generation is currently running. Wait for it to complete before starting Dojo integration.',
				};
			}

			const operationOptions = agent.getOperationOptions();
			const filesIndex = operationOptions.context.allFiles.filter(
				(file) =>
					!focus_paths?.length ||
					focus_paths.some((path) => file.filePath.includes(path)),
			);

			const inputs: DojoIntegratorInputs = {
				goal,
				filesIndex,
				streamCb,
				toolRenderer,
			};

			try {
				const operation = new DojoIntegratorOperation();
				const result = await operation.execute(inputs, operationOptions);
				return { transcript: result.transcript };
			} catch (error) {
				logger.error('Dojo integration failed', error);
				return {
					error: `Dojo integration failed: ${String(error)}`,
				};
			}
		},
	});
}
