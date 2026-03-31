import { describe, expect, it } from 'vitest';
import {
	BUILTIN_MINIMAL_VITE_TEMPLATE_NAME,
	createHelloWorldViteTemplateDetails,
	getBuiltInTemplateDetails,
} from './templates';

describe('templates', () => {
	it('builds the minimal-vite starter as a real Dojo scaffold', () => {
		const template = createHelloWorldViteTemplateDetails();

		expect(template.name).toBe(BUILTIN_MINIMAL_VITE_TEMPLATE_NAME);
		expect(template.projectType).toBe('app');
		expect(template.description.selection).toContain('Dojo-ready');
		expect(template.description.usage).toContain(
			'working Dojo + Cartridge clicker example',
		);
		expect(template.description.usage).toContain(
			'src/systems/actions.cairo',
		);
		expect(template.allFiles['package.json']).toContain(
			'"dev": "bash ./scripts/dev.sh"',
		);
		expect(template.allFiles['package.json']).toContain(
			'"dojo:devnet": "katana --dev --http.port ${KATANA_PORT:-5050}',
		);
		expect(template.allFiles['package.json']).toContain(
			"--cartridge.paymaster",
		);
		expect(template.allFiles['package.json']).toContain(
			'"dojo:check": "bash ./scripts/dojo-check.sh"',
		);
		expect(template.allFiles['package.json']).toContain(
			'"framer-motion": "12.23.24"',
		);
		expect(template.allFiles['package.json']).toContain(
			'"lucide-react": "0.541.0"',
		);
		expect(template.allFiles['package.json']).toContain(
			'"@walletconnect/types": "2.23.2"',
		);
		expect(template.allFiles['vite.config.ts']).toContain(
			"@cloudflare/vite-plugin",
		);
		expect(template.allFiles['vite.config.ts']).toContain(
			"@tailwindcss/vite",
		);
		expect(template.allFiles['vite.config.ts']).toContain(
			"vite-plugin-wasm",
		);
		expect(template.allFiles['vite.config.ts']).toContain(
			"vite-plugin-top-level-await",
		);
		expect(template.allFiles['vite.config.ts']).toContain('/__dojo/katana');
		expect(template.allFiles['vite.config.ts']).toContain('/__dojo/torii');
		expect(template.allFiles['vite.config.ts']).toContain('katanaPort');
		expect(template.allFiles['vite.config.ts']).toContain('toriiPort');
		expect(template.allFiles['vite.config.ts']).toContain('cors: true');
		expect(template.allFiles['vite.config.ts']).not.toContain(
			'vite-plugin-node-polyfills',
		);
		expect(template.allFiles['wrangler.jsonc']).toContain(
			'"main": "worker/index.ts"',
		);
		expect(template.allFiles['src/main.tsx']).toContain(
			'<DojoProviderRoot>',
		);
		expect(template.allFiles['src/main.tsx']).toContain(
			'only supported provider topology',
		);
		expect(template.allFiles['src/main.tsx']).not.toContain('StrictMode');
		expect(template.allFiles['src/starknet.tsx']).toContain(
			'StarknetConfig',
		);
		expect(template.allFiles['src/starknet.tsx']).toContain(
			'ControllerConnector',
		);
		expect(template.allFiles['src/starknet.tsx']).toContain(
			'audited starter infrastructure',
		);
		expect(template.allFiles['src/starknet.tsx']).toContain(
			'jsonRpcProvider',
		);
		expect(template.allFiles['src/starknet.tsx']).toContain(
			'paymasterRpcProvider',
		);
		expect(template.allFiles['src/starknet.tsx']).toContain(
			'ControllerSessionBoundary',
		);
		expect(template.allFiles['src/starknet.tsx']).toContain(
			'const originalControllerProbe =',
		);
		expect(template.allFiles['src/starknet.tsx']).toContain(
			'controllerConnector.controller.probe = async () => {',
		);
		expect(template.allFiles['src/starknet.tsx']).toContain(
			'normalizeRpcUrl(accountRpcUrl) !== normalizeRpcUrl(KATANA_RPC_URL)',
		);
		expect(template.allFiles['src/starknet.tsx']).toContain(
			'controllerConnector.disconnect().catch',
		);
		expect(template.allFiles['src/starknet.tsx']).toContain(
			'disconnectAsync().catch',
		);
		expect(template.allFiles['src/starknet.tsx']).toContain(
			"getDojoServiceUrl('/__dojo/katana')",
		);
		expect(template.allFiles['src/starknet.tsx']).toContain(
			"const KATANA_CHAIN_ID = '0x4b4154414e41'",
		);
		expect(template.allFiles['src/starknet.tsx']).toContain(
			'const controllerPolicies = {',
		);
		expect(template.allFiles['src/starknet.tsx']).toContain(
			"entrypoint: 'buy_upgrade'",
		);
		expect(template.allFiles['src/starknet.tsx']).toContain(
			"chains: [{ rpcUrl: KATANA_RPC_URL }]",
		);
		expect(template.allFiles['src/starknet.tsx']).toContain(
			'defaultChainId: KATANA_CHAIN_ID',
		);
		expect(template.allFiles['src/starknet.tsx']).toContain(
			'paymasterProvider={paymasterRpcProvider({',
		);
		expect(template.allFiles['src/starknet.tsx']).toContain(
			'policies: controllerPolicies',
		);
		expect(template.allFiles['src/starknet.tsx']).not.toContain('sepolia');
		expect(template.allFiles['src/lib/dojo.tsx']).toContain(
			'DojoSdkProvider',
		);
		expect(template.allFiles['src/lib/dojo.tsx']).toContain(
			'single Dojo SDK provider',
		);
		expect(template.allFiles['src/lib/dojo.tsx']).toContain(
			'createDojoConfig',
		);
		expect(template.allFiles['src/lib/dojo.tsx']).toContain(
			"getDojoServiceUrl('/__dojo/torii')",
		);
		expect(template.allFiles['src/lib/dojo.tsx']).toContain(
			'feeTokenAddress: KATANA_STRK_CONTRACT_ADDRESS',
		);
		expect(template.allFiles['src/components/DojoClickerShell.tsx']).toContain(
			'A working onchain clicker baseline',
		);
		expect(template.allFiles['src/components/DojoClickerShell.tsx']).toContain(
			"useCallback, useEffect, useState, useTransition",
		);
		expect(template.allFiles['src/components/DojoClickerShell.tsx']).toContain(
			'const refreshPlayer = useCallback(async () => {',
		);
		expect(template.allFiles['src/components/DojoClickerShell.tsx']).toContain(
			'}, [address, sdk]);',
		);
		expect(template.allFiles['src/components/DojoClickerShell.tsx']).toContain(
			'}, [refreshPlayer]);',
		);
		expect(template.allFiles['src/components/DojoClickerShell.tsx']).not.toContain(
			'useEffectEvent',
		);
		expect(template.allFiles['src/components/ConnectWallet.tsx']).toContain(
			'Connect Cartridge Controller',
		);
		expect(template.allFiles['Scarb.toml']).toContain('name = "vibes_clicker"');
		expect(template.allFiles['src/models.cairo']).toContain(
			'pub struct ClickerPlayer',
		);
		expect(template.allFiles['src/systems/actions.cairo']).toContain(
			'fn buy_upgrade',
		);
		expect(template.allFiles['package.json']).toContain(
			'"dojo:migrate": "sozo build && sozo migrate --rpc-url ${STARKNET_RPC_URL:-http://127.0.0.1:5050}"',
		);
		expect(template.allFiles['scripts/dev.sh']).toContain(
			'KATANA_PORT="${KATANA_PORT:-$((PORT + 1000))}"',
		);
		expect(template.allFiles['scripts/dev.sh']).toContain(
			'TORII_PORT="${TORII_PORT:-$((PORT + 2000))}"',
		);
		expect(template.allFiles['scripts/dev.sh']).toContain(
			'sozo migrate --rpc-url "$KATANA_RPC_URL"',
		);
		expect(template.allFiles['scripts/dev.sh']).toContain(
			'--http.port "$KATANA_PORT"',
		);
		expect(template.allFiles['scripts/dev.sh']).toContain(
			'--cartridge.paymaster',
		);
		expect(template.allFiles['scripts/dev.sh']).toContain('torii --world');
		expect(template.allFiles['scripts/dojo-check.sh']).toContain(
			'sozo migrate --rpc-url "$KATANA_RPC_URL"',
		);
		expect(template.allFiles['scripts/dojo-check.sh']).toContain(
			'--cartridge.paymaster',
		);
		expect(template.allFiles['scripts/dojo-check.sh']).toContain(
			'wait_for_http "http://127.0.0.1:$TORII_PORT"',
		);
		expect(template.dontTouchFiles).toEqual([
			'src/main.tsx',
			'src/starknet.tsx',
		]);
	});

	it('includes controller and dojo-ready starter dependencies', () => {
		const template = createHelloWorldViteTemplateDetails();
		const packageJson = JSON.parse(template.allFiles['package.json']) as {
			dependencies: Record<string, string>;
			devDependencies: Record<string, string>;
			overrides: Record<string, string>;
		};

		expect(packageJson.dependencies).toMatchObject({
			'@cartridge/connector': '0.13.10',
			'@cartridge/controller': '0.13.10',
			'@dojoengine/core': '1.8.8',
			'@dojoengine/create-burner': '1.8.10',
			'@dojoengine/sdk': '1.9.0',
			'@dojoengine/state': '1.8.5',
			'@dojoengine/torii-client': '1.8.2',
			'@dojoengine/utils': '1.8.4',
			'@starknet-react/chains': '5.0.3',
			'@starknet-react/core': '5.0.3',
			'@tanstack/react-query': '^5.95.2',
			clsx: '^2.1.1',
			'framer-motion': '12.23.24',
			'lucide-react': '0.541.0',
			react: '19.2.4',
			'react-dom': '19.2.4',
			starknet: '8.9.2',
			'tailwind-merge': '^3.4.0',
		});
		expect(packageJson.devDependencies).toMatchObject({
			'@tailwindcss/vite': '^4.2.2',
			'@types/react': '19.2.14',
			'@types/react-dom': '19.2.3',
			'@vitejs/plugin-react': '5.1.2',
			tailwindcss: '^4.2.2',
			vite: '7.2.7',
			'vite-plugin-top-level-await': '^1.6.0',
			'vite-plugin-wasm': '^3.6.0',
		});
		expect(packageJson.overrides).toMatchObject({
			'@walletconnect/types': '2.23.2',
		});
		expect(packageJson.devDependencies).not.toHaveProperty('eslint');
	});

	it('returns built-in templates by name', () => {
		expect(
			getBuiltInTemplateDetails(BUILTIN_MINIMAL_VITE_TEMPLATE_NAME)?.name,
		).toBe(BUILTIN_MINIMAL_VITE_TEMPLATE_NAME);
		expect(getBuiltInTemplateDetails('does-not-exist')).toBeNull();
	});
});
