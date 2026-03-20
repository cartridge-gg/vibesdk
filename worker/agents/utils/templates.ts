import type { TemplateDetails } from '../../services/sandbox/sandboxTypes';

export const BUILTIN_MINIMAL_VITE_TEMPLATE_NAME = 'minimal-vite';

const HELLO_WORLD_VITE_PACKAGE_JSON = `{
  "name": "minimal-vite",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port \${PORT:-8001}",
    "build": "tsc -b --incremental && vite build",
    "typecheck": "tsc -b --incremental --noEmit",
    "lint": "printf '[]\\n'",
    "preview": "npm run build && vite preview --host 0.0.0.0 --port \${PORT:-8001}",
    "deploy": "npm run build && wrangler deploy",
    "cf-typegen": "wrangler types"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@cloudflare/vite-plugin": "^1.17.1",
    "@cloudflare/workers-types": "^4.20250424.0",
    "@types/node": "^22.15.3",
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "5.8",
    "vite": "^6.3.1",
    "wrangler": "^4.39.0"
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

export default defineConfig({
  plugins: [react(), cloudflare()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: true,
    strictPort: true,
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
    <title>Minimal Vite App</title>
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;

const HELLO_WORLD_VITE_APP = `export default function App() {
  return (
    <main className="app-shell">
      <div className="app-card">
        <p className="app-kicker">Starter Project</p>
        <h1>Hello world.</h1>
        <p>
          This project starts from a minimal Vite + React + Cloudflare baseline.
        </p>
      </div>
    </main>
  );
}
`;

const HELLO_WORLD_VITE_CSS = `:root {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #111827;
  background: #f3f4f6;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

button,
input,
textarea,
select {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at top, rgba(59, 130, 246, 0.16), transparent 40%),
    linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.app-card {
  width: min(560px, 100%);
  padding: 32px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
}

.app-kicker {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #2563eb;
}

h1 {
  margin: 0 0 12px;
  font-size: clamp(2.5rem, 6vw, 4rem);
  line-height: 0.95;
}

p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  color: #374151;
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
            selection: 'Minimal Vite + React + Cloudflare starter',
            usage: `This project starts from the minimal-vite baseline with real config files already in place.

Use this as the default starting point for new app projects when no richer template is required.
- Reuse and edit the existing files instead of recreating them.
- Keep the dependency set minimal unless the user explicitly needs more.
- Do not add linting, formatting, test frameworks, git hooks, or other custom tooling by default.`,
        },
        fileTree: {
            path: '/',
            type: 'directory',
            children: [
                { path: 'index.html', type: 'file' },
                { path: 'package.json', type: 'file' },
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
                        { path: 'src/index.css', type: 'file' },
                        { path: 'src/main.tsx', type: 'file' },
                        { path: 'src/vite-env.d.ts', type: 'file' },
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
            'index.html': HELLO_WORLD_VITE_INDEX_HTML,
            'package.json': HELLO_WORLD_VITE_PACKAGE_JSON,
            'src/App.tsx': HELLO_WORLD_VITE_APP,
            'src/index.css': HELLO_WORLD_VITE_CSS,
            'src/main.tsx': HELLO_WORLD_VITE_MAIN,
            'src/vite-env.d.ts': '/// <reference types="vite/client" />\n',
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
            react: '^18.3.1',
            'react-dom': '^18.3.1',
        },
        projectType: 'app',
        frameworks: ['cloudflare', 'react', 'typescript', 'vite'],
        importantFiles: [
            'package.json',
            'vite.config.ts',
            'wrangler.jsonc',
            'src/App.tsx',
            'worker/index.ts',
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
