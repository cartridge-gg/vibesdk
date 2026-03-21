import { parse } from '@babel/parser';
import type { LanguageAnalyzer, FileInput, CodeIssue } from '../types';

export class JavaScriptAnalyzer implements LanguageAnalyzer {
	readonly supportedExtensions = ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx'];

	analyze(file: FileInput): CodeIssue[] {
		const issues: CodeIssue[] = [];

		try {
			parse(file.content, {
				sourceType: 'module',
				errorRecovery: false,
				plugins: this.getParserPlugins(file.path),
			});
		} catch (error: unknown) {
			if (error instanceof SyntaxError) {
				const parseError = error as SyntaxError & {
					loc?: { line: number; column: number };
				};
				issues.push({
					message: parseError.message,
					filePath: file.path,
					line: parseError.loc?.line ?? 1,
					column: parseError.loc?.column ?? 0,
					severity: 'error',
					ruleId: 'JS_TS_SYNTAX_ERROR',
					source: 'babel-parser',
				});
			} else if (error instanceof Error) {
				issues.push({
					message: error.message,
					filePath: file.path,
					line: 1,
					column: 0,
					severity: 'error',
					ruleId: 'JS_TS_PARSE_ERROR',
					source: 'babel-parser',
				});
			}
		}

		return issues;
	}

	private getParserPlugins(filePath: string): Array<'jsx' | 'typescript'> {
		const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
		const isJsxLike = filePath.endsWith('.jsx') || filePath.endsWith('.tsx');
		const plugins: Array<'jsx' | 'typescript'> = [];

		if (isTypeScript) {
			plugins.push('typescript');
		}

		if (isJsxLike) {
			plugins.push('jsx');
		}

		return plugins;
	}
}
