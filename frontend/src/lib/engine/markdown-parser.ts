/**
 * Markdown-to-LearningPath parser.
 *
 * Parses a structured markdown document (following LEARNING-PATH-TEMPLATE.md)
 * into the JSON shape expected by the Reverse Academy import API.
 *
 * Designed to be forgiving with whitespace but strict on structure.
 */

export interface ParsedPath {
	id: string;
	slug: string;
	title: string;
	domain: string;
	mode: string;
	difficulty: string;
	description: string;
	estimatedMinutes: number;
	xpReward: number;
	steps: ParsedStep[];
}

export interface ParsedStep {
	id: string;
	order: number;
	title: string;
	type: string;
	content: Record<string, unknown>;
	xpReward: number;
}

export interface ParseResult {
	ok: boolean;
	data: ParsedPath | null;
	errors: string[];
	warnings: string[];
}

// ─── Helpers ─────────────────────────────────────────────

/** Extract the text inside the first ```yaml ... ``` block from a section string. */
function extractYamlBlock(text: string): string | null {
	const match = text.match(/```ya?ml\s*\n([\s\S]*?)```/i);
	return match ? match[1].trim() : null;
}

/** Simple YAML-like key:value parser (flat, no nesting). */
function parseSimpleYaml(block: string): Record<string, string> {
	const result: Record<string, string> = {};
	for (const line of block.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const idx = trimmed.indexOf(':');
		if (idx === -1) continue;
		const key = trimmed.slice(0, idx).trim();
		const val = trimmed.slice(idx + 1).trim();
		result[key] = val;
	}
	return result;
}

/** Extract a blockquote (> ...) as plain text. */
function extractBlockquote(section: string): string | null {
	const lines: string[] = [];
	let found = false;
	for (const line of section.split('\n')) {
		if (line.trimStart().startsWith('>')) {
			lines.push(line.trimStart().replace(/^>\s?/, ''));
			found = true;
		} else if (found && line.trim() === '') {
			break; // End of blockquote
		}
	}
	return found ? lines.join('\n').trim() : null;
}

/** Extract the first fenced code block (any language) as { lang, code }. */
function extractCodeBlock(section: string): { lang: string; code: string } | null {
	const match = section.match(/```(\w+)?\s*\n([\s\S]*?)```/);
	if (!match) return null;
	return { lang: match[1] || '', code: match[2].trimEnd() };
}

/** Extract a plain ``` block content (no language). */
function extractPlainBlock(section: string): string | null {
	const match = section.match(/```\s*\n([\s\S]*?)```/);
	return match ? match[1].trim() : null;
}

/**
 * Get all text after the heading line, excluding child ### headings.
 * Used for Theory/Content sections that contain full markdown.
 */
function getSectionBody(section: string): string {
	const lines = section.split('\n');
	// Skip first line (the heading itself)
	return lines.slice(1).join('\n').trim();
}

/**
 * Extract expandable sections from theory/content.
 * They look like: ### Expandable: Title\n\nContent...
 */
function extractExpandables(text: string): Array<{ title: string; content: string }> {
	const results: Array<{ title: string; content: string }> = [];
	const regex = /###\s+Expandable:\s*(.+)\n([\s\S]*?)(?=###\s|$)/gi;
	let match;
	while ((match = regex.exec(text)) !== null) {
		const title = match[1].trim();
		const content = match[2].trim();
		if (title && content) {
			results.push({ title, content });
		}
	}
	return results;
}

/** Extract a $$ math formula block. */
function extractFormula(text: string): string | null {
	const match = text.match(/\$\$([\s\S]*?)\$\$/);
	return match ? match[1].trim() : null;
}

// ─── Section Splitters ──────────────────────────────────

/** Split markdown into top-level sections by ## headings. */
function splitByH2(md: string): Array<{ heading: string; body: string }> {
	const sections: Array<{ heading: string; body: string }> = [];
	const regex = /^## (.+)/gm;
	const headings: Array<{ title: string; index: number }> = [];
	let match;
	while ((match = regex.exec(md)) !== null) {
		headings.push({ title: match[1].trim(), index: match.index });
	}
	for (let i = 0; i < headings.length; i++) {
		const start = headings[i].index;
		const end = i < headings.length - 1 ? headings[i + 1].index : md.length;
		const body = md.slice(start, end);
		sections.push({ heading: headings[i].title, body });
	}
	return sections;
}

/** Split a step body into subsections by ### headings. */
function splitByH3(body: string): Record<string, string> {
	const sections: Record<string, string> = {};
	const regex = /^### (.+)/gm;
	const headings: Array<{ title: string; index: number }> = [];
	let match;
	while ((match = regex.exec(body)) !== null) {
		headings.push({ title: match[1].trim(), index: match.index });
	}
	for (let i = 0; i < headings.length; i++) {
		const start = headings[i].index;
		const end = i < headings.length - 1 ? headings[i + 1].index : body.length;
		const sectionText = body.slice(start, end);
		sections[headings[i].title.toLowerCase()] = sectionText;
	}
	return sections;
}

// ─── Step Parsers ────────────────────────────────────────

function parseChallengeStep(sub: Record<string, string>, errors: string[], stepNum: number): Record<string, unknown> {
	const scenario = sub['scenario'] ? extractBlockquote(sub['scenario']) || getSectionBody(sub['scenario']) : '';
	const codeSection = sub['code'] ? extractCodeBlock(sub['code']) : null;
	const hint = sub['hint'] ? extractBlockquote(sub['hint']) || getSectionBody(sub['hint']) : '';
	const expectedFix = sub['expected fix'] ? (extractPlainBlock(sub['expected fix']) || extractCodeBlock(sub['expected fix'])?.code || getSectionBody(sub['expected fix'])) : undefined;
	const validationRegex = sub['validation regex'] ? (extractPlainBlock(sub['validation regex']) || extractCodeBlock(sub['validation regex'])?.code || getSectionBody(sub['validation regex'])) : undefined;
	const errorMessage = sub['error message'] ? (extractPlainBlock(sub['error message']) || extractCodeBlock(sub['error message'])?.code || getSectionBody(sub['error message'])) : undefined;

	if (!scenario) errors.push(`Step ${stepNum}: Challenge missing Scenario`);
	if (!codeSection) errors.push(`Step ${stepNum}: Challenge missing Code block`);

	return {
		type: 'challenge',
		scenario: scenario || '',
		code: codeSection?.code || '',
		language: codeSection?.lang || 'typescript',
		...(hint ? { hint } : {}),
		...(expectedFix ? { expectedFix: expectedFix.trim() } : {}),
		...(validationRegex ? { validationRegex: validationRegex.trim() } : {}),
		...(errorMessage ? { errorMessage: errorMessage.trim() } : {})
	};
}

function parseRevealStep(sub: Record<string, string>, errors: string[], stepNum: number): Record<string, unknown> {
	const theorySection = sub['theory'] ? getSectionBody(sub['theory']) : '';
	const keyInsight = sub['key insight'] ? extractBlockquote(sub['key insight']) || getSectionBody(sub['key insight']) : '';
	const formula = sub['formula'] ? extractFormula(sub['formula']) : null;
	const expandables = extractExpandables(Object.values(sub).join('\n'));

	// Clean theory: remove expandable headings from theory text
	let cleanTheory = theorySection;
	for (const exp of expandables) {
		const expRegex = new RegExp(`###\\s+Expandable:\\s*${exp.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?(?=###\\s|$)`, 'i');
		cleanTheory = cleanTheory.replace(expRegex, '').trim();
	}

	if (!cleanTheory) errors.push(`Step ${stepNum}: Reveal missing Theory`);
	if (!keyInsight) errors.push(`Step ${stepNum}: Reveal missing Key Insight`);

	return {
		type: 'reveal',
		theory: cleanTheory || '',
		keyInsight: keyInsight || '',
		formula: formula ?? null,
		...(expandables.length > 0 ? { expandableSections: expandables } : {})
	};
}

function parseSandboxStep(sub: Record<string, string>, errors: string[], stepNum: number): Record<string, unknown> {
	const prompt = sub['prompt'] ? extractBlockquote(sub['prompt']) || getSectionBody(sub['prompt']) : '';
	const codeSection = sub['initial code'] ? extractCodeBlock(sub['initial code']) : null;

	if (!prompt) errors.push(`Step ${stepNum}: Sandbox missing Prompt`);
	if (!codeSection) errors.push(`Step ${stepNum}: Sandbox missing Initial Code`);

	return {
		type: 'sandbox',
		prompt: prompt || '',
		initialCode: codeSection?.code || '',
		language: codeSection?.lang || 'typescript'
	};
}

function parseTheoryStep(sub: Record<string, string>, errors: string[], stepNum: number): Record<string, unknown> {
	const content = sub['content'] ? getSectionBody(sub['content']) : '';
	const expandables = extractExpandables(Object.values(sub).join('\n'));

	let cleanContent = content;
	for (const exp of expandables) {
		const expRegex = new RegExp(`###\\s+Expandable:\\s*${exp.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?(?=###\\s|$)`, 'i');
		cleanContent = cleanContent.replace(expRegex, '').trim();
	}

	if (!cleanContent) errors.push(`Step ${stepNum}: Theory missing Content`);

	return {
		type: 'theory',
		content: cleanContent || '',
		...(expandables.length > 0 ? { expandableSections: expandables } : {})
	};
}

// ─── Main Parser ─────────────────────────────────────────

export function parseMarkdownPath(markdown: string): ParseResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	if (!markdown || typeof markdown !== 'string') {
		return { ok: false, data: null, errors: ['Input is empty or not a string'], warnings: [] };
	}

	const sections = splitByH2(markdown);
	if (sections.length < 2) {
		return { ok: false, data: null, errors: ['Markdown must have a "## Path Metadata" section and at least one "## Step N" section'], warnings: [] };
	}

	// ─── Parse Path Metadata ───────────────────────────────
	const metaSection = sections.find(s => s.heading.toLowerCase().includes('path metadata'));
	if (!metaSection) {
		return { ok: false, data: null, errors: ['Missing "## Path Metadata" section'], warnings: [] };
	}

	const yamlBlock = extractYamlBlock(metaSection.body);
	if (!yamlBlock) {
		return { ok: false, data: null, errors: ['Path Metadata section must contain a ```yaml block'], warnings: [] };
	}

	const meta = parseSimpleYaml(yamlBlock);

	const requiredMeta = ['id', 'slug', 'title', 'domain', 'mode', 'difficulty', 'description', 'estimatedMinutes', 'xpReward'];
	for (const key of requiredMeta) {
		if (!meta[key]) {
			errors.push(`Path metadata missing required field: ${key}`);
		}
	}

	if (errors.length > 0) {
		return { ok: false, data: null, errors, warnings };
	}

	// ─── Parse Steps ───────────────────────────────────────
	const stepSections = sections.filter(s => /^step\s+\d+$/i.test(s.heading));

	if (stepSections.length === 0) {
		errors.push('No "## Step N" sections found');
		return { ok: false, data: null, errors, warnings };
	}

	const steps: ParsedStep[] = [];

	for (let i = 0; i < stepSections.length; i++) {
		const stepNum = i + 1;
		const stepSection = stepSections[i];
		const sub = splitByH3(stepSection.body);

		// Parse step metadata
		const stepMeta = sub['metadata'] ? extractYamlBlock(sub['metadata']) : null;
		if (!stepMeta) {
			errors.push(`Step ${stepNum}: Missing ### Metadata with a yaml block`);
			continue;
		}

		const sm = parseSimpleYaml(stepMeta);
		if (!sm.title) errors.push(`Step ${stepNum}: Missing title in metadata`);
		if (!sm.type) errors.push(`Step ${stepNum}: Missing type in metadata`);

		const stepType = (sm.type || '').toLowerCase();
		const validTypes = ['challenge', 'reveal', 'sandbox', 'theory'];
		if (stepType && !validTypes.includes(stepType)) {
			errors.push(`Step ${stepNum}: Invalid type "${sm.type}". Must be one of: ${validTypes.join(', ')}`);
			continue;
		}

		let content: Record<string, unknown> = {};

		switch (stepType) {
			case 'challenge':
				content = parseChallengeStep(sub, errors, stepNum);
				break;
			case 'reveal':
				content = parseRevealStep(sub, errors, stepNum);
				break;
			case 'sandbox':
				content = parseSandboxStep(sub, errors, stepNum);
				break;
			case 'theory':
				content = parseTheoryStep(sub, errors, stepNum);
				break;
		}

		steps.push({
			id: `step-${stepNum}`,
			order: stepNum,
			title: sm.title || `Step ${stepNum}`,
			type: stepType,
			content,
			xpReward: parseInt(sm.xpReward || '5', 10)
		});
	}

	if (steps.length === 0) {
		errors.push('No valid steps parsed');
	}

	// ─── Warnings ────────────────────────────────────────
	if (steps.length < 3) {
		warnings.push('Learning paths typically have 6+ steps. Consider adding more.');
	}

	const challengeCount = steps.filter(s => s.type === 'challenge').length;
	const revealCount = steps.filter(s => s.type === 'reveal').length;
	if (challengeCount > 0 && revealCount === 0) {
		warnings.push('No reveal steps found. Consider adding theory after challenges.');
	}

	const path: ParsedPath = {
		id: meta.id,
		slug: meta.slug,
		title: meta.title,
		domain: meta.domain,
		mode: meta.mode,
		difficulty: meta.difficulty,
		description: meta.description,
		estimatedMinutes: parseInt(meta.estimatedMinutes || '30', 10),
		xpReward: parseInt(meta.xpReward || '100', 10),
		steps
	};

	return {
		ok: errors.length === 0,
		data: path,
		errors,
		warnings
	};
}
