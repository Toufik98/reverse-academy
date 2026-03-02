export type ExecutionTier = 'browser' | 'backend';

export interface ExecutionResult {
	success: boolean;
	output: string;
	error: string | null;
	executionTimeMs?: number;
	tier: ExecutionTier;
}

export type SupportedLanguage =
	| 'javascript'
	| 'typescript'
	| 'python'
	| 'sql'
	| 'rust'
	| 'go'
	| 'cpp'
	| 'java';

export interface LanguageConfig {
	tier: ExecutionTier;
	displayName: string;
	version: string;
	fileExtension: string;
	codemirrorLang: string;
}

export const LANGUAGE_CONFIG: Record<SupportedLanguage, LanguageConfig> = {
	javascript: {
		tier: 'browser',
		displayName: 'JavaScript',
		version: 'ES2023',
		fileExtension: '.js',
		codemirrorLang: 'javascript'
	},
	typescript: {
		tier: 'browser',
		displayName: 'TypeScript',
		version: '5.3',
		fileExtension: '.ts',
		codemirrorLang: 'typescript'
	},
	python: {
		tier: 'browser',
		displayName: 'Python',
		version: '3.11',
		fileExtension: '.py',
		codemirrorLang: 'python'
	},
	sql: {
		tier: 'browser',
		displayName: 'SQL',
		version: 'SQLite',
		fileExtension: '.sql',
		codemirrorLang: 'sql'
	},
	rust: {
		tier: 'backend',
		displayName: 'Rust',
		version: '1.75',
		fileExtension: '.rs',
		codemirrorLang: 'rust'
	},
	go: {
		tier: 'backend',
		displayName: 'Go',
		version: '1.21',
		fileExtension: '.go',
		codemirrorLang: 'go'
	},
	cpp: {
		tier: 'backend',
		displayName: 'C++',
		version: 'C++20',
		fileExtension: '.cpp',
		codemirrorLang: 'cpp'
	},
	java: {
		tier: 'backend',
		displayName: 'Java',
		version: '21',
		fileExtension: '.java',
		codemirrorLang: 'java'
	}
};

export const BROWSER_LANGUAGES: SupportedLanguage[] = ['javascript', 'typescript', 'python', 'sql'];
