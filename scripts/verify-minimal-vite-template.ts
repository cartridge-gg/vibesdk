import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { createHelloWorldViteTemplateDetails } from '../worker/agents/utils/templates';

const smokeIntegrationFiles: Record<string, string> = {
	'src/components/ConnectWallet.tsx': `import { useAccount, useConnect, useDisconnect } from '@starknet-react/core';
import { controllerConnector } from '../starknet';

function shortenAddress(address: string): string {
	return address.slice(0, 6) + '...' + address.slice(-4);
}

export function ConnectWallet() {
	const { address } = useAccount();
	const { connect, connectors, status, error } = useConnect();
	const { disconnect } = useDisconnect();

	const connector =
		connectors.find((item) => item.id === controllerConnector.id) ??
		controllerConnector;

	if (address) {
		return (
			<div className="flex items-center gap-3">
				<span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
					{shortenAddress(address)}
				</span>
				<button
					type="button"
					onClick={() => disconnect()}
					className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
				>
					Disconnect
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<button
				type="button"
				onClick={() => connect({ connector })}
				disabled={status === 'pending'}
				className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70"
			>
				{status === 'pending'
					? 'Connecting...'
					: 'Connect Cartridge Controller'}
			</button>
			{error ? (
				<p className="text-sm text-rose-600">{error.message}</p>
			) : null}
		</div>
	);
}
`,
	'src/starknet.tsx': `import type { ReactNode } from 'react';
import { ControllerConnector } from '@cartridge/connector';
import { mainnet, sepolia } from '@starknet-react/chains';
import {
	StarknetConfig,
	cartridge,
	cartridgeProvider,
} from '@starknet-react/core';

export const controllerConnector = new ControllerConnector({
	lazyload: true,
	signupOptions: ['webauthn'],
});

export function StarknetProvider({ children }: { children: ReactNode }) {
	return (
		<StarknetConfig
			autoConnect
			chains={[mainnet, sepolia]}
			defaultChainId={sepolia.id}
			provider={cartridgeProvider()}
			connectors={[controllerConnector]}
			explorer={cartridge}
		>
			{children}
		</StarknetConfig>
	);
}
`,
	'src/lib/dojo.ts': `import { ControllerConnector } from '@cartridge/connector';
import { DojoSdkProvider } from '@dojoengine/sdk/react';
import { ToriiClient } from '@dojoengine/torii-client';

export const dojoImportSmoke = {
	controllerConnectorName: ControllerConnector.name,
	dojoSdkProviderName: DojoSdkProvider.name,
	toriiClientName: ToriiClient.name,
};
`,
	'src/App.tsx': `import { ConnectWallet } from './components/ConnectWallet';
import { dojoImportSmoke } from './lib/dojo';

export default function App() {
	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14),_transparent_42%),_linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-6 py-12 text-slate-900">
			<div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-4xl items-center justify-center">
				<section className="w-full rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur md:p-12">
					<p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-sky-600">
						Starter Smoke Test
					</p>
					<div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
						<div className="max-w-2xl">
							<h1 className="mb-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 md:text-6xl">
								Minimal Vite starter with working Cartridge auth.
							</h1>
							<p className="text-base leading-7 text-slate-700 md:text-lg">
								This smoke fixture proves the built-in starter can mount React,
								wrap StarknetConfig, compile the Cartridge Controller flow,
								resolve public Dojo package entrypoints, and still ship as a
								normal Cloudflare + Vite app.
							</p>
							<div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
								<span>{dojoImportSmoke.controllerConnectorName}</span>
								<span>{dojoImportSmoke.dojoSdkProviderName}</span>
								<span>{dojoImportSmoke.toriiClientName}</span>
							</div>
						</div>
						<ConnectWallet />
					</div>
				</section>
			</div>
		</main>
	);
}
`,
	'src/main.tsx': `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { StarknetProvider } from './starknet';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<StarknetProvider>
			<App />
		</StarknetProvider>
	</StrictMode>,
);
`,
};

function writeFiles(
	rootDir: string,
	files: Record<string, string>,
): void {
	for (const [filePath, contents] of Object.entries(files)) {
		const absolutePath = join(rootDir, filePath);
		mkdirSync(dirname(absolutePath), { recursive: true });
		writeFileSync(absolutePath, contents);
	}
}

function run(command: string, args: string[], cwd: string): void {
	execFileSync(command, args, {
		cwd,
		stdio: 'inherit',
		timeout: 5 * 60 * 1000,
	});
}

function main(): void {
	const template = createHelloWorldViteTemplateDetails();
	const tempDir = mkdtempSync(join(tmpdir(), 'vibesdk-minimal-vite-'));
	const keepFixture = process.env.KEEP_TEMPLATE_FIXTURE === '1';

	try {
		writeFiles(tempDir, template.allFiles);
		writeFiles(tempDir, smokeIntegrationFiles);

		console.log(`Template fixture written to ${tempDir}`);
		run('bun', ['install'], tempDir);
		run('bun', ['run', 'build'], tempDir);
		console.log('Minimal Vite template smoke verification passed.');
	} finally {
		if (!keepFixture) {
			rmSync(tempDir, { force: true, recursive: true });
		}
	}
}

main();
