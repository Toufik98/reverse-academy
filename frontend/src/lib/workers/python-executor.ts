import type { ExecutionResult } from '$types/execution';

let pyodide: any = null;

/**
 * Lazy-load Pyodide (~11MB WASM bundle) on first Python challenge.
 * Cached after first load.
 */
async function ensurePyodide(): Promise<any> {
	if (!pyodide) {
		const { loadPyodide } = await import('pyodide');
		pyodide = await loadPyodide({
			indexURL: '/pyodide/'
		});
	}
	return pyodide;
}

/**
 * Execute Python code using Pyodide (CPython 3.11 WASM).
 */
export async function executePython(
	code: string,
	timeout: number
): Promise<ExecutionResult> {
	try {
		const py = await ensurePyodide();

		// Capture stdout
		py.runPython('import io, sys; sys.stdout = io.StringIO(); sys.stderr = io.StringIO()');

		const timeoutPromise = new Promise<ExecutionResult>((resolve) => {
			setTimeout(() => {
				resolve({
					success: false,
					output: '',
					error: 'Python execution timeout',
					tier: 'browser'
				});
			}, timeout);
		});

		const executionPromise = new Promise<ExecutionResult>((resolve) => {
			try {
				py.runPython(code);
				const stdout = py.runPython('sys.stdout.getvalue()');
				const stderr = py.runPython('sys.stderr.getvalue()');

				resolve({
					success: !stderr,
					output: stdout,
					error: stderr || null,
					tier: 'browser'
				});
			} catch (err: any) {
				resolve({
					success: false,
					output: '',
					error: err.message || String(err),
					tier: 'browser'
				});
			}
		});

		return Promise.race([executionPromise, timeoutPromise]);
	} catch (err: any) {
		return {
			success: false,
			output: '',
			error: `Failed to load Python runtime: ${err.message}`,
			tier: 'browser'
		};
	}
}
