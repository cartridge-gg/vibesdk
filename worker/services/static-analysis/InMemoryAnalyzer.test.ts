import { describe, expect, it } from 'vitest';
import { InMemoryAnalyzer } from './InMemoryAnalyzer';

describe('InMemoryAnalyzer', () => {
	it('detects TSX syntax errors', async () => {
		const analyzer = new InMemoryAnalyzer();

		const result = await analyzer.analyze([
			{
				path: 'src/App.tsx',
				content: `export default function App() {
  return (
    <main>
      <span>
    </main>
  );
}
`,
			},
		]);

		expect(result.lint.issues.some((issue) => issue.ruleId === 'JS_TS_SYNTAX_ERROR')).toBe(true);
	});

	it('detects unresolved alias imports in source files', async () => {
		const analyzer = new InMemoryAnalyzer();

		const result = await analyzer.analyze([
			{
				path: 'src/App.tsx',
				content: `import { cn } from '@/lib/utils';

export default function App() {
  return <div className={cn('ok')}>Hello</div>;
}
`,
			},
			{
				path: 'src/main.tsx',
				content: `import App from './App';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(<App />);
`,
			},
		]);

		expect(result.lint.issues).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					ruleId: 'IMPORT_NOT_FOUND',
					filePath: 'src/App.tsx',
				}),
			]),
		);
	});
});
