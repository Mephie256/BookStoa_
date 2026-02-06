import http from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { auth } from './src/lib/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

const port = Number(process.env.PORT || 3000);

const contentTypeByExt = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
};

const isFile = async (p) => {
  try {
    const s = await fs.stat(p);
    return s.isFile();
  } catch {
    return false;
  }
};

const readReqBody = async (req) => {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return undefined;
  return Buffer.concat(chunks);
};

const buildAbsoluteUrl = (req) => {
  const proto = (req.headers['x-forwarded-proto'] || 'http').toString();
  const host = (req.headers['x-forwarded-host'] || req.headers.host || 'localhost').toString();
  return `${proto}://${host}${req.url || '/'}`;
};

const loadDefaultHandler = async (modulePath) => {
  const mod = await import(modulePath);
  if (!mod?.default) {
    throw new Error(`Handler module missing default export: ${modulePath}`);
  }
  return mod.default;
};

const handleBetterAuth = async (req, res) => {
  const url = buildAbsoluteUrl(req).trim();

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null) continue;
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'host' || lowerKey === 'connection' || lowerKey === 'content-length') continue;
    headers.set(key, Array.isArray(value) ? value[0] : value);
  }

  const body = await readReqBody(req);

  const request = new Request(url, {
    method: req.method,
    headers,
    body,
  });

  const response = await auth.handler(request);

  res.statusCode = response.status;

  const setCookie = response.headers.getSetCookie?.();
  if (setCookie && setCookie.length > 0) {
    res.setHeader('Set-Cookie', setCookie);
  }

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return;
    res.setHeader(key, value);
  });

  const buf = Buffer.from(await response.arrayBuffer());
  res.end(buf);
};

const serveStatic = async (req, res) => {
  const reqUrl = new URL(req.url || '/', 'http://localhost');
  let pathname = decodeURIComponent(reqUrl.pathname);

  if (pathname === '/' || pathname === '') {
    const html = await fs.readFile(indexHtmlPath);
    res.statusCode = 200;
    res.setHeader('Content-Type', contentTypeByExt['.html']);
    res.end(html);
    return;
  }

  pathname = pathname.replace(/^\/+/, '');
  const filePath = path.join(distDir, pathname);

  if (await isFile(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    res.statusCode = 200;
    res.setHeader('Content-Type', contentTypeByExt[ext] || 'application/octet-stream');
    res.end(await fs.readFile(filePath));
    return;
  }

  const html = await fs.readFile(indexHtmlPath);
  res.statusCode = 200;
  res.setHeader('Content-Type', contentTypeByExt['.html']);
  res.end(html);
};

const server = http.createServer(async (req, res) => {
  try {
    const url = req.url || '/';

    if (url.startsWith('/api/auth')) {
      await handleBetterAuth(req, res);
      return;
    }

    if (url.startsWith('/api/pesapal')) {
      const pesapalHandler = await loadDefaultHandler('./api/pesapal/[...all].js');
      await pesapalHandler(req, res);
      return;
    }

    if (url.startsWith('/api/upload')) {
      const uploadHandler = await loadDefaultHandler('./api/upload/index.js');
      await uploadHandler(req, res);
      return;
    }

    if (url.startsWith('/api/books')) {
      const booksHandler = await loadDefaultHandler('./api/books/index.js');
      await booksHandler(req, res);
      return;
    }

    await serveStatic(req, res);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: err?.message || 'Internal server error' }));
  }
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
