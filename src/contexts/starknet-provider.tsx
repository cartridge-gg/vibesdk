import { ReactNode } from 'react';
import { ControllerConnector } from '@cartridge/connector';
import { mainnet, sepolia } from '@starknet-react/chains';
import { StarknetConfig, cartridge, cartridgeProvider } from '@starknet-react/core';
import { num, shortString } from 'starknet';

export type ControllerChainId = 'SN_MAIN' | 'SN_SEPOLIA';

export const controllerConnector = new ControllerConnector({
	lazyload: true,
	signupOptions: ['webauthn'],
});

export function decodeControllerChainId(
	chainId?: bigint,
): ControllerChainId | null {
	if (!chainId) {
		return null;
	}

	const decodedChainId = shortString.decodeShortString(num.toHex(chainId));
	if (decodedChainId === 'SN_MAIN' || decodedChainId === 'SN_SEPOLIA') {
		return decodedChainId;
	}

	return null;
}

export function StarknetProvider({ children }: { children: ReactNode }) {
	return (
		<StarknetConfig
			autoConnect
			chains={[mainnet, sepolia]}
			defaultChainId={mainnet.id}
			provider={cartridgeProvider()}
			connectors={[controllerConnector]}
			explorer={cartridge}
		>
			{children}
		</StarknetConfig>
	);
}
