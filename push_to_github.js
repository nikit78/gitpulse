// Script to push project files to GitHub via API
// Excludes: node_modules, dist, .env, .vercel

const fs = require('fs');
const path = require('path');
const https = require('https');

const GITHUB_TOKEN = process.argv[2];
const REPO_OWNER = 'nikit78';
const REPO_NAME = 'gitpulse';
const PROJECT_ROOT = path.join(__dirname, '../gitpulse');

// Files/folders to exclude
const EXCLUDE = new Set([
  'node_modules', 'dist', 'dist-ssr', '.git', '.vercel',
  '.env', '.env.local', '.env.production',
  'package-lock.json' // too large, not needed
]);

function shouldExclude(filePath) {
  const parts = filePath.split(path.sep);
  return parts.some(p => EXCLUDE.has(p));
}

function getAllFiles(dir, base = '') {
  const results = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relPath = base ? `${base}/${item}` : item;
    if (shouldExclude(fullPath)) continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...getAllFiles(fullPath, relPath));
    } else {
      results.push({ fullPath, relPath });
    }
  }
  return results;
}

function apiRequest(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: endpoint,
      method,
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'GitPulse-Uploader',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function uploadFile(filePath, content) {
  const encoded = Buffer.from(content).toString('base64');
  const res = await apiRequest('PUT', `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`, {
    message: `feat: add ${filePath}`,
    content: encoded
  });
  return res;
}

async function main() {
  if (!GITHUB_TOKEN) {
    console.error('Usage: node push_to_github.js <GITHUB_TOKEN>');
    process.exit(1);
  }

  console.log('📁 Collecting files...');
  const files = getAllFiles(PROJECT_ROOT);
  console.log(`Found ${files.length} files to upload\n`);

  let success = 0, failed = 0;
  for (const { fullPath, relPath } of files) {
    try {
      const content = fs.readFileSync(fullPath);
      // Skip binary files > 1MB
      if (content.length > 1024 * 1024) {
        console.log(`⏭  Skipped (too large): ${relPath}`);
        continue;
      }
      const res = await uploadFile(relPath, content);
      if (res.status === 201) {
        console.log(`✅ ${relPath}`);
        success++;
      } else if (res.status === 422) {
        console.log(`⏭  Already exists: ${relPath}`);
      } else {
        console.log(`❌ Failed (${res.status}): ${relPath}`);
        failed++;
      }
    } catch (e) {
      console.log(`❌ Error: ${relPath} — ${e.message}`);
      failed++;
    }
    // Rate limit: small delay
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n🎉 Done! ${success} uploaded, ${failed} failed`);
  console.log(`🔗 https://github.com/${REPO_OWNER}/${REPO_NAME}`);
}

main();
