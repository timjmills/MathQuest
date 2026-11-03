// A local stand-in for GitHub Pages as a student Chromebook sees it: HTTP/2 over TLS, gzip on text,
// cache-control max-age=600, ETag + 304. Used by ws-chromebook-perf.cjs (Chromebook speed lane, 2026-11-02).
//   const { startServer } = require('../lib/perf-server.cjs');
//   const srv = await startServer({ root }); ... srv.url ... await srv.close();
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const http2 = require('http2');
const zlib = require('zlib');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const TYPES = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff',
    '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8',
};
const GZIP = /^(text\/|application\/(json|manifest)|image\/svg)/;

function selfSignedCert() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mq-perf-cert-'));
    const key = path.join(dir, 'key.pem');
    const cert = path.join(dir, 'cert.pem');
    execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key, '-out', cert,
        '-days', '2', '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1'], { stdio: 'ignore' });
    return { key: fs.readFileSync(key), cert: fs.readFileSync(cert) };
}

function startServer({ root, port = 0, log = null } = {}) {
    const cache = new Map();   // abs path -> {body, gz, etag, type}
    const entry = (abs) => {
        const st = fs.statSync(abs);
        const hit = cache.get(abs);
        if (hit && hit.mtime === st.mtimeMs) return hit;
        const body = fs.readFileSync(abs);
        const type = TYPES[path.extname(abs).toLowerCase()] || 'application/octet-stream';
        const e = { body, type, mtime: st.mtimeMs, etag: '"' + crypto.createHash('sha1').update(body).digest('hex').slice(0, 16) + '"',
            gz: GZIP.test(type) ? zlib.gzipSync(body, { level: 6 }) : null };
        cache.set(abs, e);
        return e;
    };
    const server = http2.createSecureServer({ ...selfSignedCert(), allowHTTP1: true });
    const sockets = new Set();
    server.on('connection', (s) => { sockets.add(s); s.on('close', () => sockets.delete(s)); });
    server.on('request', (req, res) => {
        try {
            const url = new URL(req.url, 'https://localhost');
            let rel = decodeURIComponent(url.pathname);
            if (rel.endsWith('/')) rel += 'index.html';
            const abs = path.join(root, path.normalize(rel));
            if (!abs.startsWith(root) || !fs.existsSync(abs) || fs.statSync(abs).isDirectory()) {
                res.writeHead(404, { 'content-type': 'text/plain' }); res.end('not found'); return;
            }
            const e = entry(abs);
            const headers = { 'content-type': e.type, 'cache-control': 'max-age=600', etag: e.etag, vary: 'Accept-Encoding' };
            if (req.headers['if-none-match'] === e.etag) { res.writeHead(304, headers); res.end(); return; }
            const gz = e.gz && /\bgzip\b/.test(req.headers['accept-encoding'] || '');
            if (gz) headers['content-encoding'] = 'gzip';
            const body = gz ? e.gz : e.body;
            headers['content-length'] = body.length;
            if (log) log(rel, body.length);
            res.writeHead(200, headers);
            res.end(body);
        } catch (err) {
            res.writeHead(500); res.end(String(err));
        }
    });
    return new Promise((resolve) => {
        server.listen(port, '127.0.0.1', () => {
            const p = server.address().port;
            resolve({ url: `https://localhost:${p}`, port: p, close: () => new Promise((r) => { server.close(() => r()); for (const s of sockets) s.destroy(); }) });
        });
    });
}

module.exports = { startServer };
