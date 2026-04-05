/**
 * SQL executor using sql.js (SQLite WASM).
 *
 * Lazy-loads ~1.5MB WASM bundle on first SQL challenge.
 * Uses an in-memory database pre-seeded with challenge data.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import initSqlJs from 'sql.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SQL: any = null;

async function ensureSqlJs() {
	if (!SQL) {
		SQL = await initSqlJs({
			locateFile: (file: string) => `/pyodide/${file}`
		});
	}
	return SQL;
}

export async function executeSQL(
	code: string,
	timeout: number = 5000
): Promise<{ success: boolean; output: string; error: string | null; tier: 'browser' }> {
	try {
		const timer = setTimeout(() => {
			throw new Error('SQL execution timeout');
		}, timeout);

		const SqlJs = await ensureSqlJs();
		const database = new SqlJs.Database();

		try {
			database.run(code);

			const results: string[] = [];
			const lastResult = database.getResults();

			if (lastResult.length > 0) {
				const columns = database.getColumnNames();
				const headerRow = columns.join(' | ');
				const separator = columns
					.map((c: string) => '-'.repeat(Math.max(c.length, 3)))
					.join('-+-');
				const dataRows = lastResult.map((row: string[]) =>
					row.map((cell: string) => String(cell ?? 'NULL')).join(' | ')
				);

				results.push(headerRow);
				results.push(separator);
				results.push(...dataRows);
				results.push(`\n(${lastResult.length} row${lastResult.length === 1 ? '' : 's'})`);
			} else {
				const changes = database.getRowsModified();
				results.push(`OK (${changes} row${changes === 1 ? '' : 's'} affected)`);
			}

			clearTimeout(timer);
			database.close();

			return {
				success: true,
				output: results.join('\n'),
				error: null,
				tier: 'browser'
			};
		} catch (err) {
			clearTimeout(timer);
			database.close();
			const message = err instanceof Error ? err.message : String(err);
			return {
				success: false,
				output: '',
				error: message,
				tier: 'browser'
			};
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return {
			success: false,
			output: '',
			error: message,
			tier: 'browser'
		};
	}
}
