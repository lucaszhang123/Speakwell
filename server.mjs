import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {extname, join, normalize} from 'node:path';
import {fileURLToPath} from 'node:url';
import {evaluateContent} from './server/content-analysis.js';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'dist');
const port = Number(process.env.PORT || 4173);
const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json'};
const sendJson = (response, body, status = 200) => { response.writeHead(status, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'}); response.end(JSON.stringify(body)); };

createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/api/auth-config') {
    sendJson(response, {url: process.env.SUPABASE_URL || '', publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || ''});
    return;
  }
  if (request.method === 'POST' && request.url === '/api/analyze-content') {
    try {
      let raw = '';
      for await (const chunk of request) {
        raw += chunk;
        if (raw.length > 15000) throw Object.assign(new Error('Request is too large.'), {status: 413});
      }
      const result = await evaluateContent(JSON.parse(raw), {apiKey: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL || 'gpt-5-mini'});
      sendJson(response, result);
    } catch (error) {
      sendJson(response, {error: error.message, code: error.code || 'analysis_failed'}, error.status || (error instanceof SyntaxError ? 400 : 500));
    }
    return;
  }
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  let path = normalize(join(root, pathname === '/' ? 'index.html' : pathname));
  if (!path.startsWith(root)) { response.writeHead(403); response.end(); return; }
  try {
    if ((await stat(path)).isDirectory()) path = join(path, 'index.html');
    const data = await readFile(path);
    response.writeHead(200, {'Content-Type': types[extname(path)] || 'application/octet-stream'});
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch { response.writeHead(404); response.end('Not found'); }
}).listen(port, () => {
  console.log('\nSpeakwell is ready. Open this link:');
  console.log(`http://localhost:${port}/\n`);
});
