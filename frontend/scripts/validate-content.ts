#!/usr/bin/env npx tsx
/**
 * validate-content.ts — Build-time content validation
 *
 * Validates all learning path JSON, domain, and achievement files
 * against Zod schemas. Runs in CI and as a pre-build hook.
 *
 * Usage: npx tsx scripts/validate-content.ts
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, relative } from 'path';
import {
	learningPathSchema,
	domainsSchema,
	achievementsSchema
} from '../src/schemas/content';

const CONTENT_DIR = join(__dirname, '..', 'src', 'content');
const LOCALES = ['en', 'fr'];

let errors = 0;
let validated = 0;

function log(status: string, message: string) {
	const icon = status === 'ok' ? '[PASS]' : status === 'fail' ? '[FAIL]' : '[WARN]';
	console.log(`${icon} ${message}`);
}

function validateJsonFile(filePath: string, schema: any, label: string) {
	const rel = relative(CONTENT_DIR, filePath);
	try {
		const raw = readFileSync(filePath, 'utf-8');
		const data = JSON.parse(raw);
		const result = schema.safeParse(data);

		if (result.success) {
			validated++;
			log('ok', `${rel}: valid ${label}`);
		} else {
			errors++;
			log('fail', `${rel}: invalid ${label}`);
			for (const issue of result.error.issues) {
				console.log(`       - [${issue.path.join('.')}] ${issue.message}`);
			}
		}
	} catch (e: any) {
		errors++;
		log('fail', `${rel}: ${e.message}`);
	}
}

console.log('Reverse Academy — Content Validation\n');

// Validate paths
for (const locale of LOCALES) {
	const pathsDir = join(CONTENT_DIR, locale, 'paths');
	if (!existsSync(pathsDir)) {
		log('warn', `Missing paths directory: ${locale}/paths/`);
		continue;
	}

	const files = readdirSync(pathsDir).filter((f) => f.endsWith('.json'));
	for (const file of files) {
		validateJsonFile(join(pathsDir, file), learningPathSchema, 'learning path');
	}
}

// Validate domains
for (const locale of LOCALES) {
	const domainFile = join(CONTENT_DIR, locale, 'domains.json');
	if (existsSync(domainFile)) {
		validateJsonFile(domainFile, domainsSchema, 'domains');
	} else {
		log('warn', `Missing ${locale}/domains.json`);
	}
}

// Validate achievements
for (const locale of LOCALES) {
	const achievementsFile = join(CONTENT_DIR, locale, 'achievements.json');
	if (existsSync(achievementsFile)) {
		validateJsonFile(achievementsFile, achievementsSchema, 'achievements');
	} else {
		log('warn', `Missing ${locale}/achievements.json`);
	}
}

// Cross-locale consistency check
console.log('\n--- Cross-Locale Consistency ---');
const enPaths = join(CONTENT_DIR, 'en', 'paths');
const frPaths = join(CONTENT_DIR, 'fr', 'paths');

if (existsSync(enPaths) && existsSync(frPaths)) {
	const enFiles = new Set(readdirSync(enPaths).filter((f) => f.endsWith('.json')));
	const frFiles = new Set(readdirSync(frPaths).filter((f) => f.endsWith('.json')));

	for (const file of enFiles) {
		if (!frFiles.has(file)) {
			errors++;
			log('fail', `Missing FR translation: fr/paths/${file}`);
		} else {
			// Check step count matches
			try {
				const enData = JSON.parse(readFileSync(join(enPaths, file), 'utf-8'));
				const frData = JSON.parse(readFileSync(join(frPaths, file), 'utf-8'));

				if (enData.steps?.length !== frData.steps?.length) {
					errors++;
					log('fail', `Step count mismatch in ${file}: EN=${enData.steps?.length}, FR=${frData.steps?.length}`);
				} else {
					// Check step IDs match
					const enIds = enData.steps.map((s: any) => s.id);
					const frIds = frData.steps.map((s: any) => s.id);
					const mismatch = enIds.some((id: string, i: number) => id !== frIds[i]);
					if (mismatch) {
						errors++;
						log('fail', `Step ID mismatch in ${file}`);
					} else {
						log('ok', `${file}: EN/FR consistent (${enIds.length} steps)`);
					}
				}
			} catch {
				// Parse errors already caught above
			}
		}
	}

	for (const file of frFiles) {
		if (!enFiles.has(file)) {
			errors++;
			log('fail', `Missing EN source: en/paths/${file}`);
		}
	}
}

// Summary
console.log(`\n--- Summary ---`);
console.log(`Validated: ${validated} files`);
console.log(`Errors: ${errors}`);

if (errors > 0) {
	console.error('\nContent validation FAILED.');
	process.exit(1);
} else {
	console.log('\nAll content valid.');
}
