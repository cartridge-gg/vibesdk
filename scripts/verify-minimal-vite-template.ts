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
	run('bun', ['run', 'build'], tempDir);
}

function runInSandbox(tempDir: string): void {
	const sandboxImage = process.env.SANDBOX_IMAGE ?? 'vibesdk-sandbox-test';
	const sandboxPlatform = process.env.SANDBOX_PLATFORM ?? 'linux/amd64';

	console.log(
		`Running minimal-vite template Dojo verification inside sandbox image ${sandboxImage} (${sandboxPlatform}).`,
	);

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
			'rm -rf node_modules bun.lock bun.lockb && bun install && bun run dojo:check && bun run build',
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
