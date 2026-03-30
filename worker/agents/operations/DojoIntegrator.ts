import {
	createSystemMessage,
	createUserMessage,
	Message,
} from '../inferutils/common';
import { AgentActionKey } from '../inferutils/config.types';
import { CompletionConfig, InferError, InferResponseString } from '../inferutils/core';
import { RenderToolCall } from './UserConversationProcessor';
import { PROMPT_UTILS } from '../prompts';
import { FileState } from '../core/state';
import { ToolDefinition } from '../tools/types';
import {
	AgentOperationWithTools,
	OperationOptions,
	ToolSession,
	ToolCallbacks,
} from './common';
import { GenerationContext } from '../domain/values/GenerationContext';
import { createMarkDojoIntegrationCompleteTool } from '../tools/toolkit/completion-signals';
import { createReadFilesTool } from '../tools/toolkit/read-files';
import { createRunAnalysisTool } from '../tools/toolkit/run-analysis';
import { createExecCommandsTool } from '../tools/toolkit/exec-commands';
import { createRegenerateFileTool } from '../tools/toolkit/regenerate-file';
import { createGenerateFilesTool } from '../tools/toolkit/generate-files';
import { createDeployPreviewTool } from '../tools/toolkit/deploy-preview';
import { createGetRuntimeErrorsTool } from '../tools/toolkit/get-runtime-errors';
import { createGetLogsTool } from '../tools/toolkit/get-logs';
import { createWaitTool } from '../tools/toolkit/wait';
import { createGitTool } from '../tools/toolkit/git';
import { SYSTEM_PROMPT } from './prompts/dojoIntegratorPrompts';

const USER_PROMPT = (
	goal: string,
	fileSummaries: string,
	templateInfo?: string,
) => `## Dojo Integration Task
**Goal:** ${goal}

## Project Context
${fileSummaries}

${
	templateInfo
		? `## Template Context
${templateInfo}

**IMPORTANT:** Reuse existing project structure and dependencies where possible.`
		: ''
}

## Required Outcome
- Move authoritative backend state to Dojo.
- Keep the existing Controller-based auth path unless a file change is required to connect signing to Dojo transactions.
- Prefer the smallest coherent Cairo + client integration that satisfies the requested backend behavior.

Begin.`;

export interface DojoIntegratorInputs {
	goal: string;
	filesIndex: FileState[];
	streamCb?: (chunk: string) => void;
	toolRenderer?: RenderToolCall;
}

export interface DojoIntegratorOutputs {
	transcript: string;
}

export interface DojoIntegratorSession extends ToolSession {
	templateInfo?: string;
	fileSummaries: string;
}

export class DojoIntegratorOperation extends AgentOperationWithTools<
	GenerationContext,
	DojoIntegratorInputs,
	DojoIntegratorOutputs,
	DojoIntegratorSession
> {
	protected getCallbacks(
		inputs: DojoIntegratorInputs,
		_options: OperationOptions<GenerationContext>,
	): ToolCallbacks {
		const { streamCb, toolRenderer } = inputs;
		return {
			streamCb,
			toolRenderer,
		};
	}

	protected buildSession(
		inputs: DojoIntegratorInputs,
		options: OperationOptions<GenerationContext>,
	): DojoIntegratorSession {
		const { agent, context, logger } = options;

		logger.info('Starting Dojo integration session', {
			goal: inputs.goal,
			fileCount: inputs.filesIndex.length,
		});

		const templateInfo = context.templateDetails
			? PROMPT_UTILS.serializeTemplate(context.templateDetails)
			: undefined;

		const fileSummaries = PROMPT_UTILS.summarizeFiles(inputs.filesIndex);

		return {
			agent,
			templateInfo,
			fileSummaries,
		};
	}

	protected async buildMessages(
		inputs: DojoIntegratorInputs,
		_options: OperationOptions<GenerationContext>,
		session: DojoIntegratorSession,
	): Promise<Message[]> {
		const system = createSystemMessage(SYSTEM_PROMPT);
		const user = createUserMessage(
			USER_PROMPT(
				inputs.goal,
				session.fileSummaries,
				session.templateInfo,
			),
		);

		return [system, user];
	}

	protected buildTools(
		_inputs: DojoIntegratorInputs,
		options: OperationOptions<GenerationContext>,
		session: DojoIntegratorSession,
		_callbacks: ToolCallbacks,
	): ToolDefinition<unknown, unknown>[] {
		const { logger } = options;

		const rawTools: ToolDefinition<any, any>[] = [
			createReadFilesTool(session.agent, logger),
			createRunAnalysisTool(session.agent, logger),
			createExecCommandsTool(session.agent, logger),
			createRegenerateFileTool(session.agent, logger),
			createGenerateFilesTool(session.agent, logger),
			createDeployPreviewTool(session.agent, logger),
			createGetRuntimeErrorsTool(session.agent, logger),
			createGetLogsTool(session.agent, logger),
			createWaitTool(logger),
			createGitTool(session.agent, logger),
			createMarkDojoIntegrationCompleteTool(logger),
		];

		return rawTools;
	}

	protected getAgentConfig(
		inputs: DojoIntegratorInputs,
		options: OperationOptions<GenerationContext>,
		_session: DojoIntegratorSession,
	) {
		options.logger.info('Configuring Dojo integrator', {
			goal: inputs.goal,
		});

		return {
			agentActionName: 'deepDebugger' as AgentActionKey,
			completionSignalName: 'mark_dojo_integration_complete',
			operationalMode: 'initial' as const,
			allowWarningInjection: true,
		};
	}

	protected mapResultToOutput(
		_inputs: DojoIntegratorInputs,
		options: OperationOptions<GenerationContext>,
		_session: DojoIntegratorSession,
		result: InferResponseString,
	): DojoIntegratorOutputs {
		const transcript = result?.string || '';

		options.logger.info('Dojo integration session completed', {
			transcriptLength: transcript.length,
		});

		return { transcript };
	}

	protected async runToolInference(
		options: OperationOptions<GenerationContext>,
		params: {
			messages: Message[];
			tools: ToolDefinition<unknown, unknown>[];
			agentActionName: AgentActionKey;
			streamCb?: (chunk: string) => void;
			onAssistantMessage?: (message: Message) => Promise<void>;
			completionConfig?: CompletionConfig;
		},
	): Promise<InferResponseString> {
		try {
			return await super.runToolInference(options, params);
		} catch (error) {
			if (error instanceof InferError) {
				return error.partialResponse();
			}

			throw error;
		}
	}
}
