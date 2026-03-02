import { describe, it, expect } from 'vitest';

type ExecutionTier = 'browser' | 'backend';

interface ExecutionRoute {
  tier: ExecutionTier;
  runtime: string;
  reason: string;
}

const BROWSER_LANGUAGES = new Set(['javascript', 'typescript', 'python', 'sql']);
const BACKEND_LANGUAGES = new Set(['rust', 'go', 'c++', 'cpp', 'java']);

function routeExecution(language: string): ExecutionRoute {
  const lang = language.toLowerCase().trim();

  if (lang === 'javascript' || lang === 'js') {
    return { tier: 'browser', runtime: 'web-worker', reason: 'JS runs in Web Worker sandbox (0 KB)' };
  }

  if (lang === 'typescript' || lang === 'ts') {
    return { tier: 'browser', runtime: 'ts-wasm-worker', reason: 'TS compiler WASM + Worker (~3 MB lazy)' };
  }

  if (lang === 'python' || lang === 'py') {
    return { tier: 'browser', runtime: 'pyodide', reason: 'Pyodide CPython 3.11 WASM (~11 MB lazy)' };
  }

  if (lang === 'sql') {
    return { tier: 'browser', runtime: 'sql.js', reason: 'sql.js SQLite WASM (~1.5 MB)' };
  }

  if (BACKEND_LANGUAGES.has(lang)) {
    return { tier: 'backend', runtime: 'piston', reason: `${language} executed via Piston sidecar` };
  }

  return { tier: 'backend', runtime: 'piston', reason: `Unknown language ${language}, falling back to Piston` };
}

describe('Execution Router', () => {
  it('routes JavaScript to browser Web Worker', () => {
    const route = routeExecution('javascript');
    expect(route.tier).toBe('browser');
    expect(route.runtime).toBe('web-worker');
  });

  it('routes TypeScript to browser WASM', () => {
    const route = routeExecution('typescript');
    expect(route.tier).toBe('browser');
    expect(route.runtime).toBe('ts-wasm-worker');
  });

  it('routes Python to Pyodide', () => {
    const route = routeExecution('python');
    expect(route.tier).toBe('browser');
    expect(route.runtime).toBe('pyodide');
  });

  it('routes SQL to sql.js', () => {
    const route = routeExecution('sql');
    expect(route.tier).toBe('browser');
    expect(route.runtime).toBe('sql.js');
  });

  it('routes Rust to Piston backend', () => {
    const route = routeExecution('rust');
    expect(route.tier).toBe('backend');
    expect(route.runtime).toBe('piston');
  });

  it('routes Go to Piston backend', () => {
    const route = routeExecution('go');
    expect(route.tier).toBe('backend');
    expect(route.runtime).toBe('piston');
  });

  it('routes C++ to Piston backend', () => {
    const route = routeExecution('c++');
    expect(route.tier).toBe('backend');
  });

  it('handles case-insensitive input', () => {
    expect(routeExecution('JavaScript').tier).toBe('browser');
    expect(routeExecution('PYTHON').tier).toBe('browser');
    expect(routeExecution('RUST').tier).toBe('backend');
  });

  it('handles aliases (js, ts, py)', () => {
    expect(routeExecution('js').tier).toBe('browser');
    expect(routeExecution('ts').tier).toBe('browser');
    expect(routeExecution('py').tier).toBe('browser');
  });

  it('falls back to Piston for unknown languages', () => {
    const route = routeExecution('haskell');
    expect(route.tier).toBe('backend');
    expect(route.runtime).toBe('piston');
  });
});
