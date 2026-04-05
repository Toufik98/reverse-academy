import type { ExecutionResult, SupportedLanguage } from '$types/execution';
import { BROWSER_LANGUAGES, LANGUAGE_CONFIG } from '$types/execution';

const API_URL = '/api/v1';

/** Cached TypeScript module — loaded once, reused. */
let tsModule: typeof import('typescript') | null = null;

async function loadTS() {
	if (!tsModule) tsModule = await import('typescript');
	return tsModule;
}

/**
 * Routes code execution to browser WASM or backend Piston
 * based on the language's tier configuration.
 */
export async function executeCode(
	code: string,
	language: SupportedLanguage,
	timeout: number = 5000
): Promise<ExecutionResult> {
	if (BROWSER_LANGUAGES.includes(language)) {
		return executeBrowser(code, language, timeout);
	}
	return executeBackend(code, language, timeout);
}

// ─── Tier 1: Browser Execution ───────────────────────────────────

async function executeBrowser(
	code: string,
	language: SupportedLanguage,
	timeout: number
): Promise<ExecutionResult> {
	switch (language) {
		case 'javascript':
			return executeJavaScript(code, timeout);
		case 'typescript':
			return executeTypeScript(code, timeout);
		case 'python':
			return executePython(code, timeout);
		case 'sql':
			return executeSQL(code, timeout);
		default:
			return { success: false, output: '', error: `Unsupported browser language: ${language}`, tier: 'browser' };
	}
}

function executeJavaScript(code: string, timeout: number): Promise<ExecutionResult> {
	return new Promise((resolve) => {
		const worker = new Worker(
			new URL('../workers/js-executor.worker.ts', import.meta.url),
			{ type: 'module' }
		);

		const timer = setTimeout(() => {
			worker.terminate();
			resolve({
				success: false,
				output: '',
				error: 'Execution timeout (5s)',
				tier: 'browser'
			});
		}, timeout);

		worker.onmessage = (e: MessageEvent) => {
			clearTimeout(timer);
			worker.terminate();
			resolve({ ...e.data, tier: 'browser' });
		};

		worker.onerror = (err) => {
			clearTimeout(timer);
			worker.terminate();
			resolve({
				success: false,
				output: '',
				error: err.message || 'Worker error',
				tier: 'browser'
			});
		};

		worker.postMessage({ code, timeout });
	});
}

/**
 * Minimal ambient declarations so that `noLib` programs can reference
 * common globals (console, setTimeout, Promise, Array, etc.) without
 * pulling in the full 200 KB+ lib.es5.d.ts.
 *
 * Kept intentionally small — only what challenge code realistically uses.
 */
const TS_PREAMBLE = `
declare var console: { log(...a: any[]): void; error(...a: any[]): void; warn(...a: any[]): void; info(...a: any[]): void };
declare function setTimeout(fn: (...args: any[]) => void, ms?: number): number;
declare function setInterval(fn: (...args: any[]) => void, ms?: number): number;
declare function clearTimeout(id: number): void;
declare function clearInterval(id: number): void;
declare function parseInt(s: string, radix?: number): number;
declare function parseFloat(s: string): number;
declare function isNaN(v: any): boolean;
declare function isFinite(v: any): boolean;
interface Array<T> { [n: number]: T; length: number; push(...items: T[]): number; pop(): T | undefined; map<U>(fn: (v: T, i: number, a: T[]) => U): U[]; filter(fn: (v: T, i: number, a: T[]) => boolean): T[]; forEach(fn: (v: T, i: number, a: T[]) => void): void; indexOf(v: T): number; includes(v: T): boolean; join(sep?: string): string; slice(start?: number, end?: number): T[]; splice(start: number, deleteCount?: number, ...items: T[]): T[]; reduce<U>(fn: (acc: U, v: T, i: number, a: T[]) => U, init: U): U; find(fn: (v: T) => boolean): T | undefined; some(fn: (v: T) => boolean): boolean; every(fn: (v: T) => boolean): boolean; sort(fn?: (a: T, b: T) => number): T[]; reverse(): T[]; flat<D extends number = 1>(depth?: D): T[]; flatMap<U>(fn: (v: T) => U | U[]): U[]; }
interface ReadonlyArray<T> { readonly [n: number]: T; readonly length: number; map<U>(fn: (v: T, i: number, a: readonly T[]) => U): U[]; filter(fn: (v: T, i: number, a: readonly T[]) => boolean): T[]; forEach(fn: (v: T, i: number, a: readonly T[]) => void): void; indexOf(v: T): number; includes(v: T): boolean; join(sep?: string): string; slice(start?: number, end?: number): T[]; reduce<U>(fn: (acc: U, v: T, i: number, a: readonly T[]) => U, init: U): U; find(fn: (v: T) => boolean): T | undefined; some(fn: (v: T) => boolean): boolean; every(fn: (v: T) => boolean): boolean; }
interface String { length: number; charAt(i: number): string; charCodeAt(i: number): number; indexOf(s: string): number; includes(s: string): boolean; slice(start?: number, end?: number): string; substring(start: number, end?: number): string; toLowerCase(): string; toUpperCase(): string; trim(): string; split(sep: string | RegExp): string[]; replace(pattern: string | RegExp, replacement: string): string; startsWith(s: string): boolean; endsWith(s: string): boolean; padStart(len: number, fill?: string): string; padEnd(len: number, fill?: string): string; repeat(n: number): string; match(regexp: RegExp): RegExpMatchArray | null; }
interface Number { toFixed(digits?: number): string; toString(radix?: number): string; valueOf(): number; }
interface Boolean { valueOf(): boolean; }
interface Object { toString(): string; valueOf(): any; hasOwnProperty(v: string): boolean; }
interface Function { (...args: any[]): any; call(thisArg: any, ...args: any[]): any; apply(thisArg: any, args?: any[]): any; bind(thisArg: any, ...args: any[]): Function; }
interface RegExp { test(s: string): boolean; exec(s: string): RegExpExecArray | null; }
interface RegExpMatchArray extends Array<string> { index?: number; input?: string; }
interface RegExpExecArray extends Array<string> { index: number; input: string; }
interface Promise<T> { then<R1 = T, R2 = never>(onFulfilled?: (v: T) => R1 | PromiseLike<R1>, onRejected?: (reason: any) => R2 | PromiseLike<R2>): Promise<R1 | R2>; catch<R = never>(onRejected?: (reason: any) => R | PromiseLike<R>): Promise<T | R>; finally(onFinally?: () => void): Promise<T>; }
interface PromiseLike<T> { then<R1 = T, R2 = never>(onFulfilled?: (v: T) => R1 | PromiseLike<R1>, onRejected?: (reason: any) => R2 | PromiseLike<R2>): PromiseLike<R1 | R2>; }
interface PromiseConstructor { new <T>(executor: (resolve: (value: T) => void, reject: (reason?: any) => void) => void): Promise<T>; resolve<T>(value: T): Promise<T>; reject(reason?: any): Promise<never>; all<T>(values: Promise<T>[]): Promise<T[]>; race<T>(values: Promise<T>[]): Promise<T>; }
declare var Promise: PromiseConstructor;
interface Map<K, V> { get(key: K): V | undefined; set(key: K, value: V): this; has(key: K): boolean; delete(key: K): boolean; clear(): void; size: number; forEach(fn: (value: V, key: K) => void): void; }
interface MapConstructor { new <K, V>(entries?: [K, V][]): Map<K, V>; }
declare var Map: MapConstructor;
interface Set<T> { add(value: T): this; has(value: T): boolean; delete(value: T): boolean; clear(): void; size: number; forEach(fn: (value: T) => void): void; }
interface SetConstructor { new <T>(values?: T[]): Set<T>; }
declare var Set: SetConstructor;
interface Error { message: string; name: string; stack?: string; }
interface ErrorConstructor { new(message?: string): Error; (message?: string): Error; }
declare var Error: ErrorConstructor;
interface JSON { parse(text: string): any; stringify(value: any, replacer?: any, space?: any): string; }
declare var JSON: JSON;
interface Math { abs(x: number): number; ceil(x: number): number; floor(x: number): number; max(...values: number[]): number; min(...values: number[]): number; pow(base: number, exponent: number): number; random(): number; round(x: number): number; sqrt(x: number): number; PI: number; }
declare var Math: Math;
declare var undefined: undefined;
declare var NaN: number;
declare var Infinity: number;
type Partial<T> = { [P in keyof T]?: T[P] };
type Required<T> = { [P in keyof T]-?: T[P] };
type Readonly<T> = { readonly [P in keyof T]: T[P] };
type Record<K extends string | number | symbol, T> = { [P in K]: T };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Omit<T, K extends string | number | symbol> = Pick<T, Exclude<keyof T, K>>;
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
type NonNullable<T> = T extends null | undefined ? never : T;
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;
`;

/** Line count of the preamble so we can offset diagnostics. */
const PREAMBLE_LINES = TS_PREAMBLE.split('\n').length;

async function executeTypeScript(code: string, timeout: number): Promise<ExecutionResult> {
	try {
		const ts = await loadTS();

		// Combine preamble (globals) with user code in a single virtual file.
		const combined = TS_PREAMBLE + '\n' + code;

		// ── In-memory compiler host ──
		const files: Record<string, string> = { 'main.ts': combined };

		const compilerHost: import('typescript').CompilerHost = {
			getSourceFile(name, target) {
				if (files[name]) {
					return ts.createSourceFile(name, files[name], target, true);
				}
				return undefined;
			},
			getDefaultLibFileName: () => '',
			writeFile: () => {},
			getCurrentDirectory: () => '/',
			getCanonicalFileName: (f: string) => f,
			useCaseSensitiveFileNames: () => true,
			getNewLine: () => '\n',
			fileExists: (f: string) => f in files,
			readFile: (f: string) => files[f] ?? '',
		};

		const program = ts.createProgram(['main.ts'], {
			target: ts.ScriptTarget.ES2022,
			module: ts.ModuleKind.ESNext,
			strict: true,
			noLib: true,
			noEmit: true,
			skipDefaultLibCheck: true,
		}, compilerHost);

		// Collect semantic + syntactic diagnostics, skip preamble lines.
		const allDiags = [
			...program.getSyntacticDiagnostics(),
			...program.getSemanticDiagnostics(),
		];

		const userDiags = allDiags.filter(d => {
			if (!d.file || d.file.fileName !== 'main.ts' || d.start === undefined) return false;
			const pos = d.file.getLineAndCharacterOfPosition(d.start);
			return pos.line >= PREAMBLE_LINES; // only user code, not preamble
		});

		if (userDiags.length > 0) {
			const errors = userDiags.map(d => {
				const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n');
				if (d.file && d.start !== undefined) {
					const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
					const userLine = line - PREAMBLE_LINES + 1;
					return `Line ${userLine}:${character + 1} — ${msg}`;
				}
				return msg;
			}).join('\n');
			return { success: false, output: '', error: errors, tier: 'browser' };
		}

		// ── Transpile & run ──
		const transpiled = ts.transpileModule(code, {
			compilerOptions: {
				target: ts.ScriptTarget.ES2022,
				module: ts.ModuleKind.ESNext,
				strict: true,
			},
		});

		return executeJavaScript(transpiled.outputText, timeout);
	} catch (err: any) {
		return { success: false, output: '', error: err.message, tier: 'browser' };
	}
}

async function executePython(code: string, timeout: number): Promise<ExecutionResult> {
	try {
		const { executePython: runPy } = await import('../workers/python-executor');
		return runPy(code, timeout);
	} catch (err: any) {
		return { success: false, output: '', error: err.message, tier: 'browser' };
	}
}

async function executeSQL(code: string, timeout: number): Promise<ExecutionResult> {
	try {
		const { executeSQL: runSql } = await import('../workers/sql-executor');
		return runSql(code, timeout);
	} catch (err: any) {
		return { success: false, output: '', error: err.message, tier: 'browser' };
	}
}

// ─── Tier 2: Backend Execution ───────────────────────────────────

async function executeBackend(
	code: string,
	language: SupportedLanguage,
	timeout: number
): Promise<ExecutionResult> {
	try {
		const config = LANGUAGE_CONFIG[language];
		const response = await fetch(`${API_URL}/execute`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				language,
				version: config.version,
				code,
				timeout
			})
		});

		if (!response.ok) {
			if (response.status === 429) {
				return {
					success: false,
					output: '',
					error: 'Rate limit exceeded. Please wait a moment before running again.',
					tier: 'backend'
				};
			}
			const text = await response.text();
			return { success: false, output: '', error: text || 'Backend execution failed', tier: 'backend' };
		}

		const result = await response.json();
		return {
			success: result.success,
			output: result.output,
			error: result.error,
			executionTimeMs: result.execution_time_ms,
			tier: 'backend'
		};
	} catch (err: any) {
		return {
			success: false,
			output: '',
			error: `Backend unavailable: ${err.message}. Try a browser-supported language (JS, TS, Python).`,
			tier: 'backend'
		};
	}
}
