// api/_utils.js — 공통 유틸
const https = require('https');

// CORS 헤더 설정
function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

// body 파싱 (Vercel Node.js Runtime은 자동 파싱하지만 안전하게 처리)
function parseBody(req) {
  const b = req.body;
  if (!b) return {};
  if (typeof b === 'object') return b;
  try { return JSON.parse(b); } catch { return {}; }
}

// HTTPS 요청
function request(method, url, body, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method,
      headers: {
        ...(token && { 'Authorization': 'Bearer ' + token }),
        ...(payload && {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        }),
      },
    }, (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(d); } catch { parsed = { raw: d }; }
        if (r.statusCode >= 400) {
          const msg = parsed?.error?.message || parsed?.error?.status || JSON.stringify(parsed);
          reject(new Error(`HTTP ${r.statusCode}: ${msg}`));
        } else {
          resolve(parsed);
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// token 교환 (form-urlencoded)
function tokenRequest(params) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(params).toString();
    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(d); } catch { parsed = {}; }
        if (parsed.error) reject(new Error(parsed.error_description || parsed.error));
        else resolve(parsed);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = { setCORS, parseBody, request, tokenRequest };
