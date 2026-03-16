import { RpcProvider, validateAndParseAddress, verifyMessageInStarknet } from 'starknet';
import type { TypedData } from 'starknet';
import { generateSecureToken } from '../../utils/cryptoUtils';
import { JWTUtils } from '../../utils/jwtUtils';
import { SecurityError, SecurityErrorType } from 'shared/types/errors';

export type ControllerChainId = 'SN_MAIN' | 'SN_SEPOLIA';

interface ControllerChallengeClaims {
	purpose: 'controller_auth_challenge';
	address: string;
	chainId: ControllerChainId;
	nonce: string;
	issuedAt: string;
	uri: string;
}

interface CreateChallengeInput {
	address: string;
	chainId: string;
	request: Request;
	env: Env;
}

interface VerifyChallengeInput {
	address: string;
	chainId: string;
	challengeToken: string;
	signature: string[];
	env: Env;
}

export interface ControllerChallengeResponse {
	challengeToken: string;
	expiresAt: string;
	typedData: TypedData;
}

const CONTROLLER_CHALLENGE_TTL_SECONDS = 5 * 60;

const CONTROLLER_RPC_URLS: Record<ControllerChainId, string> = {
	SN_MAIN: 'https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9',
	SN_SEPOLIA: 'https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9',
};

function normalizeControllerChainId(chainId: string): ControllerChainId {
	if (chainId === 'SN_MAIN' || chainId === 'SN_SEPOLIA') {
		return chainId;
	}

	throw new SecurityError(
		SecurityErrorType.INVALID_INPUT,
		'Unsupported Cartridge Controller chain',
		400,
	);
}

export function normalizeControllerAddress(address: string): string {
	try {
		return validateAndParseAddress(address).toLowerCase();
	} catch {
		throw new SecurityError(
			SecurityErrorType.INVALID_INPUT,
			'Invalid Controller account address',
			400,
		);
	}
}

function buildControllerTypedData(claims: ControllerChallengeClaims): TypedData {
	return {
		types: {
			StarknetDomain: [
				{ name: 'name', type: 'shortstring' },
				{ name: 'version', type: 'shortstring' },
				{ name: 'chainId', type: 'shortstring' },
				{ name: 'revision', type: 'shortstring' },
			],
			ControllerLogin: [
				{ name: 'statement', type: 'string' },
				{ name: 'uri', type: 'string' },
				{ name: 'nonce', type: 'felt' },
				{ name: 'issuedAt', type: 'string' },
			],
		},
		primaryType: 'ControllerLogin',
		domain: {
			name: 'VibeSDK',
			version: '1',
			chainId: claims.chainId,
			revision: '1',
		},
		message: {
			statement: 'Sign in to VibeSDK',
			uri: claims.uri,
			nonce: claims.nonce,
			issuedAt: claims.issuedAt,
		},
	};
}

export class ControllerAuthService {
	static async createChallenge({
		address,
		chainId,
		request,
		env,
	}: CreateChallengeInput): Promise<ControllerChallengeResponse> {
		const normalizedAddress = normalizeControllerAddress(address);
		const normalizedChainId = normalizeControllerChainId(chainId);
		const issuedAt = new Date().toISOString();
		const expiresAt = new Date(
			Date.now() + CONTROLLER_CHALLENGE_TTL_SECONDS * 1000,
		).toISOString();
		const nonce = `0x${generateSecureToken(16)}`;
		const uri = new URL(request.url).origin;
		const jwtUtils = JWTUtils.getInstance(env);

		const challengeToken = await jwtUtils.signPayload(
			{
				purpose: 'controller_auth_challenge',
				address: normalizedAddress,
				chainId: normalizedChainId,
				nonce,
				issuedAt,
				uri,
			},
			CONTROLLER_CHALLENGE_TTL_SECONDS,
		);

		return {
			challengeToken,
			expiresAt,
			typedData: buildControllerTypedData({
				purpose: 'controller_auth_challenge',
				address: normalizedAddress,
				chainId: normalizedChainId,
				nonce,
				issuedAt,
				uri,
			}),
		};
	}

	static async verifyChallenge({
		address,
		chainId,
		challengeToken,
		signature,
		env,
	}: VerifyChallengeInput): Promise<{
		address: string;
		chainId: ControllerChainId;
	}> {
		const normalizedAddress = normalizeControllerAddress(address);
		const normalizedChainId = normalizeControllerChainId(chainId);
		const jwtUtils = JWTUtils.getInstance(env);
		const payload = await jwtUtils.verifyPayload(challengeToken);

		if (
			!payload ||
			payload.purpose !== 'controller_auth_challenge' ||
			typeof payload.address !== 'string' ||
			typeof payload.chainId !== 'string' ||
			typeof payload.nonce !== 'string' ||
			typeof payload.issuedAt !== 'string' ||
			typeof payload.uri !== 'string'
		) {
			throw new SecurityError(
				SecurityErrorType.INVALID_TOKEN,
				'Invalid Controller login challenge',
				401,
			);
		}

		const tokenAddress = normalizeControllerAddress(payload.address);
		const tokenChainId = normalizeControllerChainId(payload.chainId);

		if (
			tokenAddress !== normalizedAddress ||
			tokenChainId !== normalizedChainId
		) {
			throw new SecurityError(
				SecurityErrorType.INVALID_TOKEN,
				'Controller login challenge does not match the connected account',
				401,
			);
		}

		const provider = new RpcProvider({
			nodeUrl: CONTROLLER_RPC_URLS[tokenChainId],
		});
		const typedData = buildControllerTypedData({
			purpose: 'controller_auth_challenge',
			address: tokenAddress,
			chainId: tokenChainId,
			nonce: payload.nonce,
			issuedAt: payload.issuedAt,
			uri: payload.uri,
		});
		const isValidSignature = await verifyMessageInStarknet(
			provider,
			typedData,
			signature,
			tokenAddress,
		);

		if (!isValidSignature) {
			throw new SecurityError(
				SecurityErrorType.UNAUTHORIZED,
				'Invalid Controller signature',
				401,
			);
		}

		return {
			address: tokenAddress,
			chainId: tokenChainId,
		};
	}
}
