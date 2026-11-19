// transfer.js — OMP points transfer (Cloudflare Worker, Firestore REST, no dependencies)
//
// Required Worker secrets/vars (already configured):
//   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
// Optional var: ALLOWED_ORIGIN (defaults to "*")
//
// Request:  POST /transfer
//   Header: Authorization: Bearer <Firebase ID token>
//   Body:   { "recipientNumericId": "1234567890", "amount": 100, "requestId": "<unique id>" }
//   (the body may also use "numericId" for the recipient)

const SCOPE = 'https://www.googleapis.com/auth/datastore';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const MAX_AMOUNT = 1_000_000_000;
const MAX_ATTEMPTS = 4;

class TransferError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

const enc = new TextEncoder();

// ---------- helpers ----------
function b64urlToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function bytesToB64url(buf) {
  let bin = '';
  for (const b of new Uint8Array(buf)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}
function json(status, body, env) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...corsHeaders(env) },
  });
}

// ---------- Firebase ID token verification ----------
let jwksCache = { keys: null, exp: 0 };

async function getJwks(force = false) {
  if (!force && jwksCache.keys && Date.now() < jwksCache.exp) return jwksCache.keys;
  const r = await fetch(JWKS_URL);
  if (!r.ok) throw new Error('JWKS_FETCH_FAILED');
  const body = await r.json();
  const m = /max-age=(\d+)/.exec(r.headers.get('cache-control') || '');
  jwksCache = { keys: body.keys || [], exp: Date.now() + (m ? Number(m[1]) : 3600) * 1000 };
  return jwksCache.keys;
}

async function verifyIdToken(idToken, projectId) {
  const bad = () => new TransferError(401, 'INVALID_TOKEN');
  const parts = idToken.split('.');
  if (parts.length !== 3) throw bad();

  let header, payload;
  try {
    header = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[0])));
    payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[1])));
  } catch {
    throw bad();
  }
  if (header.alg !== 'RS256' || !header.kid) throw bad();

  let jwk = (await getJwks()).find((k) => k.kid === header.kid);
  if (!jwk) jwk = (await getJwks(true)).find((k) => k.kid === header.kid);
  if (!jwk) throw bad();

  let ok = false;
  try {
    const key = await crypto.subtle.importKey(
      'jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']
    );
    ok = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5', key, b64urlToBytes(parts[2]), enc.encode(parts[0] + '.' + parts[1])
    );
  } catch {
    ok = false;
  }
  if (!ok) throw bad();

  const now = Math.floor(Date.now() / 1000);
  const skew = 60;
  if (
    payload.aud !== projectId ||
    payload.iss !== `https://securetoken.google.com/${projectId}` ||
    typeof payload.sub !== 'string' || !payload.sub || payload.sub.length > 128 ||
    typeof payload.exp !== 'number' || payload.exp < now - skew ||
    typeof payload.iat !== 'number' || payload.iat > now + skew ||
    (typeof payload.auth_time === 'number' && payload.auth_time > now + skew)
  ) throw bad();

  return payload.sub; // sender UID, taken only from the verified token
}

// ---------- Service account -> OAuth access token ----------
let accessCache = { token: null, exp: 0 };

async function importPrivateKey(pem) {
  const clean = String(pem)
    .trim()
    .replace(/^"|"$/g, '')
    .replace(/\\n/g, '\n')
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  return crypto.subtle.importKey(
    'pkcs8', b64urlToBytes(clean.replace(/\+/g, '-').replace(/\//g, '_')),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
  );
}

async function getAccessToken(env) {
  if (accessCache.token && Date.now() < accessCache.exp - 60_000) return accessCache.token;
  const misconfigured = () => new TransferError(500, 'SERVER_MISCONFIGURED');

  const now = Math.floor(Date.now() / 1000);
  const unsigned =
    bytesToB64url(enc.encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))) + '.' +
    bytesToB64url(enc.encode(JSON.stringify({
      iss: env.FIREBASE_CLIENT_EMAIL, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600,
    })));

  let jwt;
  try {
    const key = await importPrivateKey(env.FIREBASE_PRIVATE_KEY);
    const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc.encode(unsigned));
    jwt = unsigned + '.' + bytesToB64url(sig);
  } catch {
    throw misconfigured();
  }

  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  if (!r.ok) throw misconfigured();
  const data = await r.json();
  accessCache = { token: data.access_token, exp: Date.now() + (data.expires_in || 3600) * 1000 };
  return accessCache.token;
}

// ---------- Firestore REST ----------
async function fsCall(env, suffix, body) {
  const token = await getAccessToken(env);
  const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents${suffix}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  let data = null;
  try { data = await r.json(); } catch { /* ignore */ }
  if (!r.ok) {
    const e = new Error('FIRESTORE_' + (data?.error?.status || r.status));
    e.fsStatus = data?.error?.status || '';
    e.httpStatus = r.status;
    throw e;
  }
  return data;
}

const numOf = (v) => {
  if (v === undefined || v === null) return 0; // missing field counts as 0
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  return NaN;
};
const earnedOf = (doc) => numOf(doc.fields?.wallet?.mapValue?.fields?.earned);
const numField = (n) => (Number.isSafeInteger(n) ? { integerValue: String(n) } : { doubleValue: n });
const walletWrite = (name, updateTime, newEarned) => ({
  update: { name, fields: { wallet: { mapValue: { fields: { earned: numField(newEarned) } } } } },
  updateMask: { fieldPaths: ['wallet.earned'] }, // never touches wallet.gift
  currentDocument: { updateTime },
});

async function findRecipientUid(env, numericId) {
  const res = await fsCall(env, ':runQuery', {
    structuredQuery: {
      from: [{ collectionId: 'users' }],
      where: { fieldFilter: { field: { fieldPath: 'numericId' }, op: 'EQUAL', value: { stringValue: numericId } } },
      limit: 1,
    },
  });
  const hit = Array.isArray(res) ? res.find((x) => x.document) : null;
  if (!hit) throw new TransferError(404, 'RECIPIENT_NOT_FOUND');
  return hit.document.name.split('/').pop();
}

async function attemptTransfer(env, { senderUid, recipientUid, numericId, amount, requestId }) {
  const base = `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
  const senderName = `${base}/users/${senderUid}`;
  const recipientName = `${base}/users/${recipientUid}`;
  const txName = `${base}/transactions/transfer_${senderUid}_${requestId}`; // deterministic id => idempotency

  const { transaction } = await fsCall(env, ':beginTransaction', { options: { readWrite: {} } });
  let committed = false;
  try {
    const docs = await fsCall(env, ':batchGet', { documents: [senderName, recipientName, txName], transaction });
    const found = {};
    for (const d of docs) if (d.found) found[d.found.name] = d.found;

    const sender = found[senderName];
    const recipient = found[recipientName];
    const prior = found[txName];

    if (!sender) throw new TransferError(404, 'SENDER_NOT_FOUND');
    if (!recipient || recipient.fields?.numericId?.stringValue !== numericId) {
      throw new TransferError(404, 'RECIPIENT_NOT_FOUND');
    }

    const senderBalance = earnedOf(sender);
    const recipientBalance = earnedOf(recipient);
    if (!Number.isFinite(senderBalance) || !Number.isFinite(recipientBalance)) {
      throw new TransferError(500, 'INTERNAL_ERROR');
    }

    // Same requestId already processed
    if (prior) {
      const f = prior.fields || {};
      const same =
        Number(f.amount?.integerValue ?? f.amount?.doubleValue) === amount &&
        f.senderId?.stringValue === senderUid &&
        f.recipientId?.stringValue === recipientUid;
      if (!same) throw new TransferError(409, 'DUPLICATE_REQUEST');
      return { ok: true, amount, senderBalanceAfter: senderBalance, duplicate: true };
    }

    if (sender.fields?.isBlocked?.booleanValue === true) throw new TransferError(403, 'ACCOUNT_BLOCKED');
    if (senderBalance < amount) throw new TransferError(400, 'INSUFFICIENT_BALANCE');

    const newSender = senderBalance - amount;
    const newRecipient = recipientBalance + amount;

    await fsCall(env, ':commit', {
      transaction,
      writes: [
        walletWrite(senderName, sender.updateTime, newSender),
        walletWrite(recipientName, recipient.updateTime, newRecipient),
        {
          update: {
            name: txName,
            fields: {
              amount: { integerValue: String(amount) },
              recipientId: { stringValue: recipientUid },
              senderId: { stringValue: senderUid },
              type: { stringValue: 'transfer' },
            },
          },
          updateTransforms: [{ fieldPath: 'timestamp', setToServerValue: 'REQUEST_TIME' }],
          currentDocument: { exists: false },
        },
      ],
    });
    committed = true;
    return { ok: true, amount, senderBalanceAfter: newSender, duplicate: false };
  } finally {
    if (!committed) {
      // best-effort release of locks; failure here is harmless
      fsCall(env, ':rollback', { transaction }).catch(() => {});
    }
  }
}

async function runTransfer(env, params) {
  let lastErr;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    try {
      return await attemptTransfer(env, params);
    } catch (e) {
      lastErr = e;
      const retryable = ['ABORTED', 'FAILED_PRECONDITION', 'ALREADY_EXISTS'].includes(e.fsStatus);
      if (!retryable || i === MAX_ATTEMPTS - 1) break;
      await new Promise((r) => setTimeout(r, 50 * (i + 1) + Math.random() * 100));
    }
  }
  throw lastErr;
}

// ---------- input validation ----------
function parseAmount(v) {
  let n;
  if (typeof v === 'number') n = v;
  else if (typeof v === 'string' && /^\d{1,12}$/.test(v.trim())) n = Number(v.trim());
  else return null;
  if (!Number.isSafeInteger(n) || n <= 0 || n > MAX_AMOUNT) return null;
  return n;
}

// ---------- entry point ----------
export async function handleTransfer(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(env) });
  if (request.method !== 'POST') return json(405, { ok: false, error: 'METHOD_NOT_ALLOWED' }, env);

  try {
    const missing = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'].filter((k) => !env[k]);
    if (missing.length) {
      console.error('[transfer] missing env:', missing.join(', '));
      throw new TransferError(500, 'SERVER_MISCONFIGURED');
    }

    const m = /^Bearer\s+(\S+)$/i.exec(request.headers.get('Authorization') || '');
    if (!m) throw new TransferError(401, 'INVALID_TOKEN');
    const senderUid = await verifyIdToken(m[1], env.FIREBASE_PROJECT_ID);

    let body;
    try { body = await request.json(); } catch { throw new TransferError(400, 'INVALID_REQUEST'); }
    if (!body || typeof body !== 'object') throw new TransferError(400, 'INVALID_REQUEST');
    // any uid/senderId/balance in the body is ignored on purpose

    const numericId = String(body.recipientNumericId ?? body.numericId ?? '').trim();
    if (!/^\d{10}$/.test(numericId)) throw new TransferError(400, 'INVALID_RECIPIENT');

    const amount = parseAmount(body.amount);
    if (amount === null) throw new TransferError(400, 'INVALID_AMOUNT');

    const requestId = body.requestId;
    if (typeof requestId !== 'string' || !/^[A-Za-z0-9_-]{8,128}$/.test(requestId)) {
      throw new TransferError(400, 'INVALID_REQUEST');
    }

    const recipientUid = await findRecipientUid(env, numericId);
    if (recipientUid === senderUid) throw new TransferError(400, 'SELF_TRANSFER');

    const result = await runTransfer(env, { senderUid, recipientUid, numericId, amount, requestId });
    return json(200, result, env);
  } catch (e) {
    if (e instanceof TransferError) return json(e.status, { ok: false, error: e.code }, env);
    console.error('[transfer] internal error:', e?.message || 'unknown'); // never log tokens/keys
    return json(500, { ok: false, error: 'INTERNAL_ERROR' }, env);
  }
}
