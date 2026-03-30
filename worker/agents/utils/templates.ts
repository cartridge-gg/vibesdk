import type { TemplateDetails } from '../../services/sandbox/sandboxTypes';

export const BUILTIN_MINIMAL_VITE_TEMPLATE_NAME = 'minimal-vite';

const HELLO_WORLD_VITE_PACKAGE_JSON = `{
  "name": "minimal-vite",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "bash ./scripts/dev.sh",
    "dev:web": "vite --host 0.0.0.0 --port \${PORT:-8001}",
    "build": "tsc -b --incremental && vite build",
    "typecheck": "tsc -b --incremental --noEmit",
    "lint": "printf '[]\\n'",
    "preview": "npm run build && vite preview --host 0.0.0.0 --port \${PORT:-8001}",
    "deploy": "npm run build && wrangler deploy",
    "cf-typegen": "wrangler types",
    "dojo:devnet": "katana --dev --http.port \${KATANA_PORT:-5050} --http.api dev,starknet --dev.no-fee --http.cors_origins '*'",
    "dojo:build": "sozo build",
    "dojo:migrate": "sozo build && sozo migrate apply --rpc-url \${STARKNET_RPC_URL:-http://127.0.0.1:5050}",
    "dojo:indexer": "bash ./scripts/torii.sh",
    "dojo:check": "bash ./scripts/dojo-check.sh"
  },
  "dependencies": {
    "@cartridge/connector": "0.13.10",
    "@cartridge/controller": "0.13.10",
    "@dojoengine/core": "1.8.8",
    "@dojoengine/create-burner": "1.8.10",
    "@dojoengine/sdk": "1.9.0",
    "@dojoengine/state": "1.8.5",
    "@dojoengine/torii-client": "1.8.2",
    "@dojoengine/utils": "1.8.4",
    "@starknet-react/chains": "5.0.3",
    "@starknet-react/core": "5.0.3",
    "@tanstack/react-query": "^5.95.2",
    "clsx": "^2.1.1",
    "framer-motion": "12.23.24",
    "lucide-react": "0.541.0",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "starknet": "8.9.2",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "@cloudflare/vite-plugin": "^1.17.1",
    "@tailwindcss/vite": "^4.2.2",
    "@cloudflare/workers-types": "^4.20250424.0",
    "@types/node": "^22.15.3",
    "@types/react": "19.2.14",
    "@types/react-dom": "19.2.3",
    "@vitejs/plugin-react": "5.1.2",
    "tailwindcss": "^4.2.2",
    "typescript": "5.8",
    "vite": "7.2.7",
    "vite-plugin-top-level-await": "^1.6.0",
    "vite-plugin-wasm": "^3.6.0",
    "wrangler": "^4.39.0"
  },
  "overrides": {
    "@walletconnect/types": "2.23.2"
  }
}
`;

const HELLO_WORLD_VITE_WRANGLER_CONFIG = `{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "minimal-vite",
  "main": "worker/index.ts",
  "compatibility_date": "2025-08-10",
  "assets": {
    "not_found_handling": "single-page-application",
    "run_worker_first": ["/api/*"]
  },
  "observability": {
    "enabled": true
  }
}
`;

const HELLO_WORLD_VITE_CONFIG = `import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';

const previewPort = Number(process.env.PORT ?? '8001');
const katanaPort = Number(process.env.KATANA_PORT ?? String(previewPort + 1000));
const toriiPort = Number(process.env.TORII_PORT ?? String(previewPort + 2000));

export default defineConfig({
  plugins: [
    react(),
    cloudflare(),
    tailwindcss(),
    wasm(),
    topLevelAwait(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: true,
    strictPort: true,
    proxy: {
      '/__dojo/katana': {
        target: \`http://127.0.0.1:\${katanaPort}\`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/__dojo\\/katana/, ''),
      },
      '/__dojo/torii': {
        target: \`http://127.0.0.1:\${toriiPort}\`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/__dojo\\/torii/, ''),
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    force: true,
  },
});
`;

const HELLO_WORLD_VITE_INDEX_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dojo Clicker Starter</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

const HELLO_WORLD_VITE_TSCONFIG = `{
  "files": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.node.json"
    },
    {
      "path": "./tsconfig.worker.json"
    }
  ],
  "compilerOptions": {
    "incremental": true,
    "types": ["@cloudflare/workers-types"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "skipLibCheck": true
  }
}
`;

const HELLO_WORLD_VITE_TSCONFIG_APP = `{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
`;

const HELLO_WORLD_VITE_TSCONFIG_NODE = `{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "types": ["@cloudflare/workers-types", "vite/client"],
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
`;

const HELLO_WORLD_VITE_TSCONFIG_WORKER = `{
  "extends": "./tsconfig.node.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.worker.tsbuildinfo",
    "types": ["@cloudflare/workers-types", "vite/client"],
    "lib": ["ES2023", "WebWorker", "ESNext.Intl"]
  },
  "include": ["worker"]
}
`;

const HELLO_WORLD_VITE_MAIN = `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { DojoProviderRoot } from './lib/dojo';
import { StarknetProvider } from './starknet';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StarknetProvider>
      <DojoProviderRoot>
        <App />
      </DojoProviderRoot>
    </StarknetProvider>
  </StrictMode>,
);
`;

const HELLO_WORLD_VITE_STARKNET = `import type { ReactNode } from 'react';
import { ControllerConnector } from '@cartridge/connector';
import type { Chain } from '@starknet-react/chains';
import {
  StarknetConfig,
  cartridgeProvider,
} from '@starknet-react/core';

function getDojoServiceUrl(path: string): string {
  if (typeof window === 'undefined') {
    return path;
  }

  return new URL(path, window.location.origin).toString();
}

const KATANA_RPC_URL = getDojoServiceUrl('/__dojo/katana');
const KATANA_DEV_CHAIN_ID = '0x534e5f5345504f4c4941';

const katana = {
  id: BigInt(KATANA_DEV_CHAIN_ID),
  network: 'katana',
  name: 'Katana',
  nativeCurrency: {
    address:
      '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  testnet: true,
  rpcUrls: {
    default: {
      http: [],
    },
    public: {
      http: [KATANA_RPC_URL],
    },
    cartridge: {
      http: [KATANA_RPC_URL],
    },
  },
  paymasterRpcUrls: {
    avnu: {
      http: [KATANA_RPC_URL],
    },
  },
} as const satisfies Chain;

export const controllerConnector = new ControllerConnector({
  lazyload: true,
  signupOptions: ['webauthn'],
  chains: [{ rpcUrl: KATANA_RPC_URL }],
  defaultChainId: KATANA_DEV_CHAIN_ID,
});

export function StarknetProvider({ children }: { children: ReactNode }) {
  return (
    <StarknetConfig
      autoConnect
      chains={[katana]}
      defaultChainId={katana.id}
      provider={cartridgeProvider()}
      connectors={[controllerConnector]}
    >
      {children}
    </StarknetConfig>
  );
}
`;

const HELLO_WORLD_VITE_APP = `import { DojoClickerShell } from './components/DojoClickerShell';

export default function App() {
  return <DojoClickerShell />;
}
`;

const HELLO_WORLD_VITE_CONNECT_WALLET = `import { useAccount, useConnect, useDisconnect } from '@starknet-react/core';
import { LoaderCircle, LogOut, Wallet } from 'lucide-react';
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
      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
          {shortenAddress(address)}
        </div>
        <button
          type="button"
          onClick={() => disconnect()}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          <LogOut className="size-4" />
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
        className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70"
      >
        {status === 'pending' ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Wallet className="size-4" />
        )}
        {status === 'pending' ? 'Connecting...' : 'Connect Cartridge Controller'}
      </button>
      {error ? (
        <p className="text-sm text-rose-600">{error.message}</p>
      ) : null}
    </div>
  );
}
`;

const HELLO_WORLD_VITE_DOJO = `import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  DojoProvider,
  KATANA_ETH_CONTRACT_ADDRESS,
  createDojoConfig,
  getContractByName,
} from '@dojoengine/core';
import { DojoSdkProvider, useDojoSDK } from '@dojoengine/sdk/react';
import { KeysClause, ToriiQueryBuilder, init, type SDK, type SchemaType } from '@dojoengine/sdk';
import { addAddressPadding, type AccountInterface, type InvokeFunctionResponse } from 'starknet';
import manifest from '../../manifest_dev.json';

const DOJO_NAMESPACE = 'vibes_clicker';

const DOJO_DOMAIN = {
  name: 'Vibes Clicker Starter',
  version: '1.0.0',
  chainId: 'KATANA',
  revision: '1',
} as const;

export interface ClickerPlayerModel {
  player: string;
  clicks: number;
  multiplier: number;
}

interface ClickerEntity {
  models?: {
    vibes_clicker?: {
      ClickerPlayer?: ClickerPlayerModel;
    };
  };
}

interface ManifestContract {
  address: string;
}

type DojoSchema = SchemaType;

function getDojoServiceUrl(path: string): string {
  if (typeof window === 'undefined') {
    return path;
  }

  return new URL(path, window.location.origin).toString();
}

const KATANA_RPC_URL = getDojoServiceUrl('/__dojo/katana');
const TORII_URL = getDojoServiceUrl('/__dojo/torii');

const dojoConfig = createDojoConfig({
  manifest,
  rpcUrl: KATANA_RPC_URL,
  toriiUrl: TORII_URL,
  feeTokenAddress: KATANA_ETH_CONTRACT_ADDRESS,
});

let sdkPromise: Promise<SDK<DojoSchema>> | null = null;

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown Dojo error';
}

function getActionsAddress(): string {
  const contract = getContractByName(
    dojoConfig.manifest,
    DOJO_NAMESPACE,
    'actions',
  ) as ManifestContract | undefined;

  return contract?.address ?? '0x0';
}

async function getSdk(): Promise<SDK<DojoSchema>> {
  if (!sdkPromise) {
    sdkPromise = init<DojoSchema>({
      client: {
        toriiUrl: dojoConfig.toriiUrl,
        worldAddress: dojoConfig.manifest.world.address ?? '',
      },
      domain: DOJO_DOMAIN,
    });
  }

  return sdkPromise;
}

async function executeAction(
  account: AccountInterface,
  entrypoint: 'spawn' | 'click' | 'buy_upgrade',
): Promise<InvokeFunctionResponse> {
  return account.execute([
    {
      contractAddress: getActionsAddress(),
      entrypoint,
      calldata: [],
    },
  ]);
}

export function createDojoClient(provider: DojoProvider) {
  return {
    provider,
    spawn(account: AccountInterface) {
      return executeAction(account, 'spawn');
    },
    click(account: AccountInterface) {
      return executeAction(account, 'click');
    },
    buyUpgrade(account: AccountInterface) {
      return executeAction(account, 'buy_upgrade');
    },
  };
}

export async function loadClickerPlayer(
  sdk: SDK<DojoSchema>,
  address: string,
): Promise<ClickerPlayerModel | null> {
  const result = await sdk.getEntities({
    query: new ToriiQueryBuilder()
      .withClause(
        KeysClause([\`\${DOJO_NAMESPACE}-ClickerPlayer\`], [], 'VariableLen').build(),
      )
      .withLimit(250),
  });

  const normalizedAddress = addAddressPadding(address).toLowerCase();
  const match = (result.getItems() as ClickerEntity[]).find((entity) => {
    const player = entity.models?.vibes_clicker?.ClickerPlayer?.player;
    return (
      typeof player === 'string' &&
      addAddressPadding(player).toLowerCase() === normalizedAddress
    );
  });

  return match?.models?.vibes_clicker?.ClickerPlayer ?? null;
}

export function DojoProviderRoot({ children }: { children: ReactNode }) {
  const [sdk, setSdk] = useState<SDK<DojoSchema> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void getSdk()
      .then((nextSdk) => {
        if (!cancelled) {
          setSdk(nextSdk);
        }
      })
      .catch((nextError) => {
        if (!cancelled) {
          setError(toErrorMessage(nextError));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
        <div className="max-w-lg rounded-[28px] border border-rose-500/30 bg-rose-950/60 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.5)]">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-rose-300">
            Dojo bootstrap failed
          </p>
          <p className="text-sm leading-6 text-rose-100">{error}</p>
        </div>
      </div>
    );
  }

  if (!sdk) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
        <div className="max-w-lg rounded-[28px] border border-white/10 bg-white/10 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.5)]">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
            Starting local Dojo stack
          </p>
          <p className="text-sm leading-6 text-slate-200">
            Katana, Sozo migration, and Torii are booting inside the sandbox before the app loads.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DojoSdkProvider dojoConfig={dojoConfig} sdk={sdk} clientFn={createDojoClient}>
      {children}
    </DojoSdkProvider>
  );
}

export function useDojoApp() {
  return useDojoSDK<typeof createDojoClient, DojoSchema>();
}

export { dojoConfig };
`;

const HELLO_WORLD_VITE_DOJO_CLICKER_SHELL = `import { useAccount } from '@starknet-react/core';
import { useEffect, useEffectEvent, useState, useTransition } from 'react';
import { Activity, Pickaxe, Rocket, Sparkles, Zap } from 'lucide-react';
import { ConnectWallet } from './ConnectWallet';
import {
  dojoConfig,
  loadClickerPlayer,
  useDojoApp,
  type ClickerPlayerModel,
} from '../lib/dojo';

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown app error';
}

export function DojoClickerShell() {
  const { account, address } = useAccount();
  const { client, sdk } = useDojoApp();
  const [player, setPlayer] = useState<ClickerPlayerModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Local Dojo stack is ready.');
  const [isPending, startTransition] = useTransition();

  const refreshPlayer = useEffectEvent(async () => {
    if (!address) {
      setPlayer(null);
      setError(null);
      return;
    }

    try {
      const nextPlayer = await loadClickerPlayer(sdk, address);
      setPlayer(nextPlayer);
      setError(null);
    } catch (nextError) {
      setError(toErrorMessage(nextError));
    }
  });

  useEffect(() => {
    void refreshPlayer();
  }, [address, refreshPlayer]);

  const runAction = (action: 'spawn' | 'click' | 'buy_upgrade') => {
    if (!account) {
      return;
    }

    startTransition(() => {
      void (async () => {
        try {
          const label =
            action === 'spawn'
              ? 'Deploying player entity...'
              : action === 'click'
                ? 'Submitting click transaction...'
                : 'Buying an upgrade onchain...';

          setStatus(label);
          setError(null);

          const response =
            action === 'spawn'
              ? await client.spawn(account)
              : action === 'click'
                ? await client.click(account)
                : await client.buyUpgrade(account);

          await account.waitForTransaction(response.transaction_hash, {
            retryInterval: 250,
          });

          await refreshPlayer();
          setStatus('State synced from Torii.');
        } catch (nextError) {
          setError(toErrorMessage(nextError));
          setStatus('Last action failed.');
        }
      })();
    });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_32%),_radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.12),_transparent_30%),_linear-gradient(180deg,_#020617_0%,_#0f172a_42%,_#111827_100%)] px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_28px_120px_rgba(2,6,23,0.55)] backdrop-blur md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-sky-300">
                Built-in Dojo starter
              </p>
              <h1 className="text-4xl font-semibold tracking-[-0.05em] text-white md:text-6xl">
                A working onchain clicker baseline, not just Dojo-shaped files.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                The starter already ships a Cairo world, migration config, Torii wiring,
                Cartridge auth, and a live click loop. New apps should adapt this scaffold
                instead of reinstalling the stack from scratch.
              </p>
            </div>
            <ConnectWallet />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-sky-400/20 bg-slate-950/70 p-8 shadow-[0_28px_120px_rgba(2,6,23,0.4)]">
            <div className="flex items-center gap-3 text-sky-300">
              <Pickaxe className="size-5" />
              <p className="text-sm font-semibold uppercase tracking-[0.16em]">
                Click loop
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                  Clicks
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {player?.clicks ?? 0}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                  Multiplier
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {player?.multiplier ?? 1}x
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                  World
                </p>
                <p className="mt-3 text-sm font-medium text-slate-200">
                  {dojoConfig.manifest.world.address?.slice(0, 16) ?? '0x0'}...
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {!player ? (
                <button
                  type="button"
                  disabled={!account || isPending}
                  onClick={() => runAction('spawn')}
                  className="inline-flex items-center gap-2 rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Rocket className="size-4" />
                  Spawn Player
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={!account || isPending}
                    onClick={() => runAction('click')}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Zap className="size-4" />
                    Mine Clicks
                  </button>
                  <button
                    type="button"
                    disabled={!account || isPending}
                    onClick={() => runAction('buy_upgrade')}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Sparkles className="size-4" />
                    Buy Upgrade
                  </button>
                </>
              )}
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              {isPending ? 'Waiting for transaction confirmation...' : status}
            </div>

            {error ? (
              <div className="mt-4 rounded-3xl border border-rose-500/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_28px_120px_rgba(2,6,23,0.35)]">
              <div className="flex items-center gap-3 text-emerald-300">
                <Activity className="size-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.16em]">
                  Stack wiring
                </p>
              </div>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                <li>Katana starts before Vite, so preview URLs come up with a live local chain.</li>
                <li>Sozo migrates the bundled world and refreshes manifest_dev.json automatically.</li>
                <li>Torii starts against that world before the frontend mounts the Dojo SDK provider.</li>
                <li>Cartridge Controller signs actions while Dojo owns the authoritative game state.</li>
              </ul>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_28px_120px_rgba(2,6,23,0.35)]">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-200">
                Files to adapt first
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                <li>src/models.cairo for authoritative game data.</li>
                <li>src/systems/actions.cairo for onchain rules and transactions.</li>
                <li>src/lib/dojo.tsx for client-side queries and contract calls.</li>
                <li>src/components/DojoClickerShell.tsx for presentation and UX.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
`;

const HELLO_WORLD_VITE_SCARB = `[package]
name = "vibes_clicker"
version = "1.0.0"
edition = "2024_07"

[cairo]
sierra-replace-ids = true

[dependencies]
dojo = "1.8.0"
starknet = "2.13.1"

[[target.starknet-contract]]
build-external-contracts = ["dojo::world::world_contract::world"]

[tool.scarb]
allow-prebuilt-plugins = ["dojo_cairo_macros"]
`;

const HELLO_WORLD_VITE_DOJO_DEV_TOML = `[world]
name = "Vibes Clicker Starter"
description = "Built-in Dojo starter for Vibes SDK."
seed = "vibes_clicker"

[namespace]
default = "vibes_clicker"

[env]
rpc_url = "http://127.0.0.1:5050/"
account_address = "0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec"
private_key = "0xc5b2fcab997346f3ea1c00b002ecf6f382c5f9c9659a3894eb783c5320f912"

[writers]
"vibes_clicker" = ["vibes_clicker-actions"]
`;

const HELLO_WORLD_VITE_TORII_DEV_TOML = `[indexing]
contracts = [
  "erc20:0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  "erc20:0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
]
`;

const HELLO_WORLD_VITE_MANIFEST_DEV = `{
  "world": {
    "address": "0x0"
  },
  "contracts": [
    {
      "tag": "vibes_clicker-actions",
      "address": "0x0"
    }
  ]
}
`;

const HELLO_WORLD_VITE_CAIRO_LIB = `pub mod systems {
    pub mod actions;
}

pub mod models;
`;

const HELLO_WORLD_VITE_CAIRO_MODELS = `use starknet::ContractAddress;

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct ClickerPlayer {
    #[key]
    pub player: ContractAddress,
    pub clicks: u32,
    pub multiplier: u32,
}
`;

const HELLO_WORLD_VITE_CAIRO_ACTIONS = `use vibes_clicker::models::ClickerPlayer;

#[starknet::interface]
pub trait IActions<T> {
    fn spawn(ref self: T);
    fn click(ref self: T);
    fn buy_upgrade(ref self: T);
}

#[dojo::contract]
pub mod actions {
    use dojo::event::EventStorage;
    use dojo::model::ModelStorage;
    use starknet::{ContractAddress, get_caller_address};
    use super::{ClickerPlayer, IActions, upgrade_cost};

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct Clicked {
        #[key]
        pub player: ContractAddress,
        pub amount: u32,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct Upgraded {
        #[key]
        pub player: ContractAddress,
        pub next_multiplier: u32,
    }

    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn spawn(ref self: ContractState) {
            let mut world = self.world_default();
            let player = get_caller_address();

            world.write_model(@ClickerPlayer {
                player,
                clicks: 0,
                multiplier: 1,
            });
        }

        fn click(ref self: ContractState) {
            let mut world = self.world_default();
            let player = get_caller_address();
            let mut state: ClickerPlayer = world.read_model(player);

            if state.multiplier == 0 {
                state.multiplier = 1;
            }

            state.clicks += state.multiplier;
            world.write_model(@state);
            world.emit_event(@Clicked {
                player,
                amount: state.multiplier,
            });
        }

        fn buy_upgrade(ref self: ContractState) {
            let mut world = self.world_default();
            let player = get_caller_address();
            let mut state: ClickerPlayer = world.read_model(player);

            if state.multiplier == 0 {
                state.multiplier = 1;
            }

            let cost = upgrade_cost(state.multiplier);
            if state.clicks < cost {
                return;
            }

            state.clicks -= cost;
            state.multiplier += 1;
            world.write_model(@state);
            world.emit_event(@Upgraded {
                player,
                next_multiplier: state.multiplier,
            });
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"vibes_clicker")
        }
    }
}

fn upgrade_cost(multiplier: u32) -> u32 {
    multiplier * 10
}
`;

const HELLO_WORLD_VITE_DEV_SCRIPT = `#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")/.." && pwd)"
PORT="\${PORT:-8001}"
KATANA_PORT="\${KATANA_PORT:-$((PORT + 1000))}"
TORII_PORT="\${TORII_PORT:-$((PORT + 2000))}"
KATANA_RPC_URL="http://127.0.0.1:\${KATANA_PORT}"

cd "$ROOT_DIR"
mkdir -p .dojo

cleanup() {
  if [[ -n "\${TORII_PID:-}" ]]; then
    kill "$TORII_PID" 2>/dev/null || true
  fi

  if [[ -n "\${KATANA_PID:-}" ]]; then
    kill "$KATANA_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

wait_for_rpc() {
  for _ in $(seq 1 60); do
    if curl -sS -X POST "$KATANA_RPC_URL" \
      -H 'content-type: application/json' \
      --data '{"jsonrpc":"2.0","id":1,"method":"starknet_chainId","params":[]}' | grep -q '"result"'; then
      return 0
    fi
    sleep 0.5
  done

  echo "Katana did not become ready in time" >&2
  return 1
}

wait_for_http() {
  local url="$1"
  for _ in $(seq 1 60); do
    if curl -sS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.5
  done

  echo "Service at $url did not become ready in time" >&2
  return 1
}

katana --dev --http.port "$KATANA_PORT" --http.api dev,starknet --dev.no-fee --http.cors_origins '*' > .dojo/katana.log 2>&1 &
KATANA_PID=$!

wait_for_rpc
sozo build
sozo migrate apply --rpc-url "$KATANA_RPC_URL"

WORLD_ADDRESS="$(bun -e "import manifest from './manifest_dev.json' assert { type: 'json' }; console.log(manifest.world?.address ?? '')")"
if [[ -z "$WORLD_ADDRESS" || "$WORLD_ADDRESS" == "0x0" ]]; then
  echo "World address not found after migration" >&2
  exit 1
fi

torii --world "$WORLD_ADDRESS" --rpc "$KATANA_RPC_URL" --http.port "$TORII_PORT" --http.cors_origins '*' > .dojo/torii.log 2>&1 &
TORII_PID=$!
wait_for_http "http://127.0.0.1:$TORII_PORT"

bunx vite --host 0.0.0.0 --port "$PORT" &
VITE_PID=$!
wait "$VITE_PID"
`;

const HELLO_WORLD_VITE_TORII_SCRIPT = `#!/usr/bin/env bash
set -euo pipefail

PORT="\${PORT:-8001}"
KATANA_PORT="\${KATANA_PORT:-$((PORT + 1000))}"
TORII_PORT="\${TORII_PORT:-$((PORT + 2000))}"
KATANA_RPC_URL="http://127.0.0.1:\${KATANA_PORT}"

WORLD_ADDRESS="$(bun -e "import manifest from './manifest_dev.json' assert { type: 'json' }; console.log(manifest.world?.address ?? '')")"

if [[ -z "$WORLD_ADDRESS" || "$WORLD_ADDRESS" == "0x0" ]]; then
  echo "manifest_dev.json does not contain a usable world address" >&2
  exit 1
fi

torii --world "$WORLD_ADDRESS" --rpc "$KATANA_RPC_URL" --http.port "$TORII_PORT" --http.cors_origins '*'
`;

const HELLO_WORLD_VITE_DOJO_CHECK_SCRIPT = `#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")/.." && pwd)"
PORT="\${PORT:-8001}"
KATANA_PORT="\${KATANA_PORT:-$((PORT + 1000))}"
TORII_PORT="\${TORII_PORT:-$((PORT + 2000))}"
KATANA_RPC_URL="http://127.0.0.1:\${KATANA_PORT}"

cd "$ROOT_DIR"
mkdir -p .dojo

cleanup() {
  if [[ -n "\${TORII_PID:-}" ]]; then
    kill "$TORII_PID" 2>/dev/null || true
  fi

  if [[ -n "\${KATANA_PID:-}" ]]; then
    kill "$KATANA_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

wait_for_rpc() {
  for _ in $(seq 1 60); do
    if curl -sS -X POST "$KATANA_RPC_URL" \
      -H 'content-type: application/json' \
      --data '{"jsonrpc":"2.0","id":1,"method":"starknet_chainId","params":[]}' | grep -q '"result"'; then
      return 0
    fi
    sleep 0.5
  done

  echo "Katana did not become ready in time" >&2
  return 1
}

wait_for_http() {
  local url="$1"
  for _ in $(seq 1 60); do
    if curl -sS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.5
  done

  echo "Service at $url did not become ready in time" >&2
  return 1
}

katana --dev --http.port "$KATANA_PORT" --http.api dev,starknet --dev.no-fee --http.cors_origins '*' > .dojo/katana-check.log 2>&1 &
KATANA_PID=$!

wait_for_rpc
sozo build
sozo migrate apply --rpc-url "$KATANA_RPC_URL"

WORLD_ADDRESS="$(bun -e "import manifest from './manifest_dev.json' assert { type: 'json' }; console.log(manifest.world?.address ?? '')")"
if [[ -z "$WORLD_ADDRESS" || "$WORLD_ADDRESS" == "0x0" ]]; then
  echo "World address not found after migration" >&2
  exit 1
fi

torii --world "$WORLD_ADDRESS" --rpc "$KATANA_RPC_URL" --http.port "$TORII_PORT" --http.cors_origins '*' > .dojo/torii-check.log 2>&1 &
TORII_PID=$!
wait_for_http "http://127.0.0.1:$TORII_PORT"
`;

const HELLO_WORLD_VITE_CSS = `@import "tailwindcss";

:root {
  font-family: Inter, "Helvetica Neue", Arial, sans-serif;
  color: #111827;
  background: #f3f4f6;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
}

button,
input,
textarea,
select {
  font: inherit;
}
`;

const HELLO_WORLD_VITE_UTILS = `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
`;

const HELLO_WORLD_VITE_WORKER = `const json = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data, null, 2), {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
    },
    ...init,
  });

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      return json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (url.pathname === '/api/client-errors' && request.method === 'POST') {
      try {
        const payload = await request.json();
        console.error('[CLIENT ERROR]', JSON.stringify(payload));
        return json({ success: true });
      } catch (error) {
        console.error('[CLIENT ERROR HANDLER] Failed:', error);
        return json({ success: false, error: 'Failed to process' }, { status: 500 });
      }
    }

    return json({ success: false, error: 'Not Found' }, { status: 404 });
  },
} satisfies ExportedHandler;
`;

const VITE_CONFIG_MINIMAL = `
// Making changes to this file is **STRICTLY** forbidden. All the code in here is 100% correct and audited.
import { defineConfig, loadEnv } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { exec } from "node:child_process";
import pino from "pino";
import { cloudflare } from "@cloudflare/vite-plugin";

const logger = pino();

const stripAnsi = (str: string) =>
  str.replace(
    // eslint-disable-next-line no-control-regex -- Allow ANSI escape stripping
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ""
  );

const LOG_MESSAGE_BOUNDARY = /\\n(?=\\[[A-Z][^\\]]*\\])/g;

const emitLog = (level: "info" | "warn" | "error", rawMessage: string) => {
  const cleaned = stripAnsi(rawMessage).replace(/\r\n/g, "\n");
  const parts = cleaned
    .split(LOG_MESSAGE_BOUNDARY)
    .map((part) => part.trimEnd())
    .filter((part) => part.trim().length > 0);

  if (parts.length === 0) {
    logger[level](cleaned.trimEnd());
    return;
  }

  for (const part of parts) {
    logger[level](part);
  }
};

// 3. Create the custom logger for Vite
const customLogger = {
  warnOnce: (msg: string) => emitLog("warn", msg),

  // Use Pino's methods, passing the cleaned message
  info: (msg: string) => emitLog("info", msg),
  warn: (msg: string) => emitLog("warn", msg),
  error: (msg: string) => emitLog("error", msg),
  hasErrorLogged: () => false,

  // Keep these as-is
  clearScreen: () => {},
  hasWarned: false,
};

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd());
  return defineConfig({
    plugins: [react(), cloudflare()],
    build: {
      minify: true,
      sourcemap: "inline", // Use inline source maps for better error reporting
      rollupOptions: {
        output: {
          sourcemapExcludeSources: false, // Include original source in source maps
        },
      },
    },
    customLogger: env.VITE_LOGGER_TYPE === 'json' ? customLogger : undefined,
    // Enable source maps in development too
    css: {
      devSourcemap: true,
    },
    server: {
      allowedHosts: true,   // This is IMPORTANT for dev server to work
      strictPort: true,     // Prevent auto-port-increment which breaks miniflare/preview mapping
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@shared": path.resolve(__dirname, "./shared"),
      },
    },
    optimizeDeps: {
      // This is still crucial for reducing the time from when \`bun run dev\` is executed to when the server is actually ready.
      include: ["react", "react-dom", "react-router-dom"],
      exclude: ["agents"], // Exclude agents package from pre-bundling due to Node.js dependencies
      force: true,
    },
    define: {
      // Define Node.js globals for the agents package
      global: "globalThis",
    },
    cacheDir: "node_modules/.vite",
  });
};

`;

const SCRATCH_TEMPLATE_INSTRUCTIONS = `
To build a valid, previewable and deployable project, it is essential to follow few important rules:

1. The package.json **MUST** be of the following form: 
\`\`\`
...
	"scripts": {
		"dev": "vite --host 0.0.0.0 --port \${PORT:-8001}",
		"build": "vite build",
		"lint": "eslint --cache -f json --quiet .",
		"preview": "bun run build && vite preview --host 0.0.0.0 --port \${PORT:-8001}",
		"deploy": "bun run build && wrangler deploy",
		"cf-typegen": "wrangler types"
	}
...
\`\`\`

Failure to have a compatible package.json would result in the app un-previewable and un-deployable.

2. The project **MUST** be a valid Cloudflare worker/durable object + Vite + bun project. 

3. It must have a valid wrangler.jsonc and a vite.config.ts file.

4. The vite config file MUST have the following minimal config:
\`\`\`ts
${VITE_CONFIG_MINIMAL}
\`\`\`
`;

/**
 * Single source of truth for an in-memory "scratch" template.
 * Used when starting from-scratch (general mode) or when no template fits.
 */
export function createScratchTemplateDetails(): TemplateDetails {
    return {
        name: 'scratch',
        description: { selection: 'from-scratch baseline', usage: `No template. Agent will scaffold as needed. **IT IS RECOMMENDED THAT YOU CHOOSE A VALID PRECONFIGURED TEMPLATE IF POSSIBLE** ${SCRATCH_TEMPLATE_INSTRUCTIONS}` },
        fileTree: { path: '/', type: 'directory', children: [] },
        allFiles: {},
        language: 'typescript',
        deps: {},
        projectType: 'general',
        frameworks: [],
        importantFiles: [],
        dontTouchFiles: [],
        redactedFiles: [],
        disabled: false,
    };
}

export function createHelloWorldViteTemplateDetails(): TemplateDetails {
    return {
        name: BUILTIN_MINIMAL_VITE_TEMPLATE_NAME,
        description: {
            selection: 'Dojo-ready Vite + React + Cloudflare starter',
            usage: `This project starts from the built-in minimal-vite baseline, which now includes a working Dojo + Cartridge clicker example instead of a blank shell.

Use this as the default starting point for new app and game projects when no richer template is required.
- Reuse and adapt the existing Dojo world, frontend wiring, and wallet flow instead of reinstalling or re-bootstrapping the stack.
- The starter already includes Cartridge Controller auth, Dojo SDK wiring, Cairo contracts, migration config, and local Katana/Torii scripts.
- Modify the bundled files first: \`src/models.cairo\`, \`src/systems/actions.cairo\`, \`src/lib/dojo.tsx\`, and \`src/components/DojoClickerShell.tsx\`.
- Keep the dependency set minimal unless the user explicitly needs more.
- For games, prefer native React components, hooks, and browser APIs over any dedicated game engine.
- Do not add linting, formatting, test frameworks, git hooks, or other custom tooling by default.`,
        },
        fileTree: {
            path: '/',
            type: 'directory',
            children: [
                { path: 'Scarb.toml', type: 'file' },
                { path: 'dojo_dev.toml', type: 'file' },
                { path: 'index.html', type: 'file' },
                { path: 'manifest_dev.json', type: 'file' },
                { path: 'package.json', type: 'file' },
                {
                    path: 'scripts',
                    type: 'directory',
                    children: [
                        { path: 'scripts/dev.sh', type: 'file' },
                        { path: 'scripts/dojo-check.sh', type: 'file' },
                        { path: 'scripts/torii.sh', type: 'file' },
                    ],
                },
                { path: 'torii_dev.toml', type: 'file' },
                { path: 'tsconfig.app.json', type: 'file' },
                { path: 'tsconfig.json', type: 'file' },
                { path: 'tsconfig.node.json', type: 'file' },
                { path: 'tsconfig.worker.json', type: 'file' },
                { path: 'vite.config.ts', type: 'file' },
                { path: 'wrangler.jsonc', type: 'file' },
                {
                    path: 'src',
                    type: 'directory',
                    children: [
                        { path: 'src/App.tsx', type: 'file' },
                        {
                            path: 'src/components',
                            type: 'directory',
                            children: [
                                { path: 'src/components/ConnectWallet.tsx', type: 'file' },
                                { path: 'src/components/DojoClickerShell.tsx', type: 'file' },
                            ],
                        },
                        { path: 'src/index.css', type: 'file' },
                        { path: 'src/lib.cairo', type: 'file' },
                        { path: 'src/main.tsx', type: 'file' },
                        { path: 'src/models.cairo', type: 'file' },
                        { path: 'src/starknet.tsx', type: 'file' },
                        { path: 'src/vite-env.d.ts', type: 'file' },
                        {
                            path: 'src/lib',
                            type: 'directory',
                            children: [
                                { path: 'src/lib/dojo.tsx', type: 'file' },
                                { path: 'src/lib/utils.ts', type: 'file' },
                            ],
                        },
                        {
                            path: 'src/systems',
                            type: 'directory',
                            children: [{ path: 'src/systems/actions.cairo', type: 'file' }],
                        },
                    ],
                },
                {
                    path: 'worker',
                    type: 'directory',
                    children: [{ path: 'worker/index.ts', type: 'file' }],
                },
            ],
        },
        allFiles: {
            'Scarb.toml': HELLO_WORLD_VITE_SCARB,
            'dojo_dev.toml': HELLO_WORLD_VITE_DOJO_DEV_TOML,
            'index.html': HELLO_WORLD_VITE_INDEX_HTML,
            'manifest_dev.json': HELLO_WORLD_VITE_MANIFEST_DEV,
            'package.json': HELLO_WORLD_VITE_PACKAGE_JSON,
            'scripts/dev.sh': HELLO_WORLD_VITE_DEV_SCRIPT,
            'scripts/dojo-check.sh': HELLO_WORLD_VITE_DOJO_CHECK_SCRIPT,
            'scripts/torii.sh': HELLO_WORLD_VITE_TORII_SCRIPT,
            'src/App.tsx': HELLO_WORLD_VITE_APP,
            'src/components/ConnectWallet.tsx': HELLO_WORLD_VITE_CONNECT_WALLET,
            'src/components/DojoClickerShell.tsx': HELLO_WORLD_VITE_DOJO_CLICKER_SHELL,
            'src/index.css': HELLO_WORLD_VITE_CSS,
            'src/lib.cairo': HELLO_WORLD_VITE_CAIRO_LIB,
            'src/lib/dojo.tsx': HELLO_WORLD_VITE_DOJO,
            'src/lib/utils.ts': HELLO_WORLD_VITE_UTILS,
            'src/main.tsx': HELLO_WORLD_VITE_MAIN,
            'src/models.cairo': HELLO_WORLD_VITE_CAIRO_MODELS,
            'src/starknet.tsx': HELLO_WORLD_VITE_STARKNET,
            'src/systems/actions.cairo': HELLO_WORLD_VITE_CAIRO_ACTIONS,
            'src/vite-env.d.ts': '/// <reference types="vite/client" />\n',
            'torii_dev.toml': HELLO_WORLD_VITE_TORII_DEV_TOML,
            'tsconfig.app.json': HELLO_WORLD_VITE_TSCONFIG_APP,
            'tsconfig.json': HELLO_WORLD_VITE_TSCONFIG,
            'tsconfig.node.json': HELLO_WORLD_VITE_TSCONFIG_NODE,
            'tsconfig.worker.json': HELLO_WORLD_VITE_TSCONFIG_WORKER,
            'vite.config.ts': HELLO_WORLD_VITE_CONFIG,
            'worker/index.ts': HELLO_WORLD_VITE_WORKER,
            'wrangler.jsonc': HELLO_WORLD_VITE_WRANGLER_CONFIG,
        },
        language: 'typescript',
        deps: {
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
        },
        projectType: 'app',
        frameworks: [
            'cartridge-controller',
            'cloudflare',
            'dojo',
            'react',
            'starknet',
            'tailwindcss',
            'typescript',
            'vite',
        ],
        importantFiles: [
            'Scarb.toml',
            'package.json',
            'src/App.tsx',
            'src/components/DojoClickerShell.tsx',
            'src/lib/dojo.tsx',
            'src/models.cairo',
            'src/systems/actions.cairo',
            'src/starknet.tsx',
            'vite.config.ts',
            'worker/index.ts',
            'wrangler.jsonc',
        ],
        dontTouchFiles: [],
        redactedFiles: [],
        disabled: false,
    };
}

export function getBuiltInTemplateDetails(
    templateName?: string,
): TemplateDetails | null {
    if (templateName === BUILTIN_MINIMAL_VITE_TEMPLATE_NAME) {
        return createHelloWorldViteTemplateDetails();
    }

    if (templateName === 'scratch') {
        return createScratchTemplateDetails();
    }

    return null;
}
