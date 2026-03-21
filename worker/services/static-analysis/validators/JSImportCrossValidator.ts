import path from 'node:path';
import type { CodeIssue, CrossFileValidator, FileInput } from '../types';

const IMPORT_PATTERNS = [
	/\bimport\s+(?:type\s+)?(?:[^'"]+?\s+from\s+)?['"]([^'"]+)['"]/g,
	/\bexport\s+[^'"]*?\s+from\s+['"]([^'"]+)['"]/g,
	/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
];

const RESOLVABLE_EXTENSIONS = [
	'.ts',
	'.tsx',
	'.js',
	'.jsx',
	'.mjs',
	'.cjs',
	'.css',
	'.json',
	'.html',
];

const SOURCE_EXTENSIONS = new Set([
	'.ts',
	'.tsx',
	'.js',
	'.jsx',
	'.mjs',
	'.cjs',
]);

export class JSImportCrossValidator implements CrossFileValidator {
	validate(files: FileInput[]): CodeIssue[] {
		const issues: CodeIssue[] = [];
		const knownPaths = new Set(files.map((file) => this.normalizePath(file.path)));

		for (const file of files) {
			if (!this.isSourceFile(file.path)) {
				continue;
			}

			for (const source of this.extractImports(file.content)) {
				if (!this.isLocalImport(source)) {
					continue;
				}

				if (this.canResolveImport(file.path, source, knownPaths)) {
					continue;
				}

				issues.push({
					message: `Cannot resolve import "${source}" from "${file.path}"`,
					filePath: file.path,
					line: this.findImportLine(file.content, source),
					column: 0,
					severity: 'error',
					ruleId: 'IMPORT_NOT_FOUND',
					source: 'in-memory-import-validator',
				});
			}
		}

		return issues;
	}

	private extractImports(content: string): string[] {
		const imports = new Set<string>();

		for (const pattern of IMPORT_PATTERNS) {
			for (const match of content.matchAll(pattern)) {
				const source = match[1]?.trim();
				if (source) {
					imports.add(source);
				}
			}
		}

		return [...imports];
	}

	private isLocalImport(source: string): boolean {
		return source.startsWith('./') || source.startsWith('../') || source.startsWith('@/');
	}

	private canResolveImport(
		filePath: string,
		source: string,
		knownPaths: Set<string>,
	): boolean {
		const basePath = this.normalizePath(
			source.startsWith('@/') ? path.posix.join('src', source.slice(2)) : path.posix.join(path.posix.dirname(filePath), source),
		);

		for (const candidate of this.getCandidates(basePath)) {
			if (knownPaths.has(candidate)) {
				return true;
			}
		}

		return false;
	}

	private getCandidates(basePath: string): string[] {
		const normalizedBasePath = this.normalizePath(basePath);
		const ext = path.posix.extname(normalizedBasePath);
		const candidates = new Set<string>([normalizedBasePath]);

		if (ext.length > 0) {
			return [...candidates];
		}

		for (const candidateExt of RESOLVABLE_EXTENSIONS) {
			candidates.add(`${normalizedBasePath}${candidateExt}`);
			candidates.add(this.normalizePath(path.posix.join(normalizedBasePath, `index${candidateExt}`)));
		}

		return [...candidates];
	}

	private isSourceFile(filePath: string): boolean {
		return SOURCE_EXTENSIONS.has(path.posix.extname(filePath).toLowerCase());
	}

	private normalizePath(filePath: string): string {
		return path.posix.normalize(filePath);
	}

	private findImportLine(content: string, source: string): number {
		const lines = content.split('\n');
		const index = lines.findIndex((line) => line.includes(source));
		return index === -1 ? 1 : index + 1;
	}
}
