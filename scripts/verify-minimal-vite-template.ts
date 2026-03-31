import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { createHelloWorldViteTemplateDetails } from '../worker/agents/utils/templates';

function writeFiles(rootDir: string, files: Record<string, string>): void {
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
		timeout: 10 * 60 * 1000,
	});
}

function runLocally(tempDir: string): void {
	console.log('Running minimal-vite template verification on the host.');
	run('bun', ['install'], tempDir);
	run('bun', ['run', 'typecheck'], tempDir);
	run('bun', ['run', 'dojo:check'], tempDir);
	run('bun', ['run', 'build'], tempDir);
}

function runInSandbox(tempDir: string): void {
	const sandboxImage = process.env.SANDBOX_IMAGE ?? 'vibesdk-sandbox-test';
	const sandboxPlatform = process.env.SANDBOX_PLATFORM ?? 'linux/amd64';

	console.log(
		`Running minimal-vite template Dojo verification inside sandbox image ${sandboxImage} (${sandboxPlatform}).`,
	);

	const sandboxCommand = `set -euo pipefail
rm -rf node_modules bun.lock bun.lockb
bun install
bun run typecheck
bun run dojo:build
PORT=8001 bun run dev > /tmp/minimal-vite-dev.log 2>&1 &
DEV_PID=$!
for _ in $(seq 1 120); do
  if curl -fsS http://127.0.0.1:8001 >/dev/null; then
    break
  fi
  sleep 1
done
curl -fsS http://127.0.0.1:8001 >/dev/null
kill $DEV_PID || true
wait $DEV_PID || true
bun run build`;

	run(
		'docker',
		[
			'run',
			'--rm',
			'--platform',
			sandboxPlatform,
			'--entrypoint',
			'bash',
			'-v',
			`${tempDir}:/workspace/app`,
			'-w',
			'/workspace/app',
			sandboxImage,
			'-lc',
			sandboxCommand,
		],
		process.cwd(),
	);
}

function main(): void {
	const template = createHelloWorldViteTemplateDetails();
	const tempDir = mkdtempSync(join(tmpdir(), 'vibesdk-minimal-vite-'));
	const keepFixture = process.env.KEEP_TEMPLATE_FIXTURE === '1';
	const verifyInSandbox = process.env.VERIFY_IN_SANDBOX === '1';

	try {
		writeFiles(tempDir, template.allFiles);

		console.log(`Template fixture written to ${tempDir}`);
		runLocally(tempDir);

		if (verifyInSandbox) {
			runInSandbox(tempDir);
		}

		console.log('Minimal Vite template verification passed.');
	} finally {
		if (!keepFixture) {
			rmSync(tempDir, { force: true, recursive: true });
		}
	}
}

main();
