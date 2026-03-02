#!/usr/bin/env node
/**
 * Seed script: Import all learning path JSON files into the database via the Admin API.
 *
 * Usage:
 *   node scripts/seed-paths.cjs [--api-url http://localhost:8080] [--token dev-admin-token]
 */

const fs = require('fs');
const path = require('path');

const API_URL = process.argv.includes('--api-url')
  ? process.argv[process.argv.indexOf('--api-url') + 1]
  : 'http://localhost:8080';

const TOKEN = process.argv.includes('--token')
  ? process.argv[process.argv.indexOf('--token') + 1]
  : 'dev-admin-token';

const CONTENT_DIR = path.join(__dirname, '..', 'frontend', 'src', 'content', 'en', 'paths');

async function importPath(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const fileName = path.basename(filePath, '.json');

  console.log(`  Importing: ${data.title} (${data.steps.length} steps, ${data.xpReward} XP)...`);

  const res = await fetch(`${API_URL}/api/v1/admin/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`    FAIL (${res.status}): ${text}`);
    return false;
  }

  const result = await res.json();
  console.log(`    OK: ${result.message}`);
  return true;
}

async function main() {
  console.log(`Seeding paths from: ${CONTENT_DIR}`);
  console.log(`API: ${API_URL}`);
  console.log('');

  const files = fs.readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.json'))
    .sort();

  let success = 0;
  let fail = 0;

  for (const file of files) {
    const ok = await importPath(path.join(CONTENT_DIR, file));
    if (ok) success++;
    else fail++;
  }

  console.log('');
  console.log(`Done: ${success} imported, ${fail} failed out of ${files.length} paths.`);

  // Verify
  const verifyRes = await fetch(`${API_URL}/api/v1/paths`);
  const paths = await verifyRes.json();
  console.log(`\nAPI now serves ${paths.length} paths:`);
  for (const p of paths) {
    console.log(`  - ${p.slug} (${p.stepCount} steps, ${p.difficulty})`);
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
