/**
 * Over Mods - Points Transfer (transfer.js)
 * Cloudflare Workers (ES Modules). Standalone: it imports nothing and does not
 * touch worker.js. It uses the same environment variables as worker.js:
 *   FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID  (secrets)
 *
 * Usage later from worker.js (not done here):
 *   import { handleTransfer } from "./transfer.js";
 *   ...
 *   return handleTransfer(request, env, cors);   // cors = the CORS headers object worker.js already builds
 *
 * Request:  POST  Authorization: Bearer <Firebase ID Token>
 *           Content-Type: application/json
 *           { "recipientNumericId": "4349566787", "amount": 25.5, "requestId": "<uuid>" }
 *
 * requestId is the idempotency key. The client must generate it ONCE per
 * user action (e.g. crypto.randomUUID() when the button is pressed) and
 * reuse the same value if it has to re-send the request. It is sent in the
 * JSON body on purpose: a custom header would require changing the CORS
 * allowed-headers list in worker.js.
 *
 * NOTE: this file was written without being run against your Firebase project
 * or Cloudflare account. Follow the test steps given with it.
 */

const CONFIG = {
  MAX_BODY_BYTES: 4096,
  MAX_DOC_ID_BYTES: 1500,
  MAX_UID_CHARS: 128,
  MAX_TX_ATTEMPTS: 4,
  FETCH_TIMEOUT_MS: 8000,

  // Token clock skew: exp has no tolerance; iat/auth_time may be up to 60s in the future.
  IAT_SKEW_SECONDS: 60,
  EXP_SKEW_SECONDS: 0,

  JWKS_URL:
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  JWKS_MIN_TTL_SECONDS: 60,
  JWKS_MAX_TTL_SECONDS: 86400,
  JWKS_UNKNOWN_KID_REFRESH_MS: 60000,
  JWKS_RETRY_BACKOFF_MS: 30000,
  JWKS_STALE_GRACE_MS: 3600000,

  TOKEN_URL: "https://oauth2.googleapis.com/token",
  SCOPE: "https://www.googleapis.com/auth/datastore",

  USERS: "users",
  TRANSACTIONS: "transactions",
  NUMERIC_ID_FIELD: "numericId", // stored as a string in users/{uid}
  NUMERIC_ID_REGEX: /^\d{10}$/, // the UI asks for 10 digits; change if your IDs differ

  // Amount policy: at most 2 decimals (the UI shows 0.00), 0.01 <= amount <= 10,000,000.
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 10000000,

  // Idempotency: when true, requests without a valid requestId are rejected.
  // When false, a request without requestId is treated as a NEW transfer
  // (no protection against the client re-sending it).
  REQUIRE_REQUEST_ID: true,
  REQUEST_ID_REGEX: /^[A-Za-z0-9_-]{16,100}$/,
  ID_LABEL: "overmods-transfer-v1", // hashing label only; never stored
};

/* ------------------------------ errors ------------------------------ */

class HttpError extends Error {
  constructor(status, code, message, headers) {
    super(message);
    this.status = status;
    this.code = code;
    this.headers = headers || null;
  }
}

class FirestoreError extends Error {
  // httpStatus 0 = no HTTP response (network/timeout): the outcome is UNKNOWN.
  constructor(httpStatus, fsStatus) {
    super("Firestore error " + httpStatus + " " + fsStatus);
    this.httpStatus = httpStatus;
    this.fsStatus = fsStatus;
  }
  get contention() {
    return (
      this.httpStatus === 409 ||
      ["ABORTED", "ALREADY_EXISTS", "FAILED_PRECONDITION"].includes(this.fsStatus)
    );
  }
  get transient() {
    return (
      this.httpStatus === 0 ||
      this.httpStatus === 429 ||
      this.httpStatus >= 500 ||
      ["UNAVAILABLE", "DEADLINE_EXCEEDED", "RESOURCE_EXHAUSTED"].includes(this.fsStatus)
    );
  }
  get retryable() {
    return this.contention || this.transient;
  }
}

/* ------------------------------ helpers ------------------------------ */

const textEnc = new TextEncoder();
const textDec = new TextDecoder();

function b64urlToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToB64url(bytes) {
  let bin = "";
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const strToB64url = (s) => bytesToB64url(textEnc.encode(s));
const parseJsonPart = (p) => JSON.parse(textDec.decode(b64urlToBytes(p)));
const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hex = (buf) =>
  Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

function isWellFormedUtf16(s) {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff) {
      const n = s.charCodeAt(i + 1);
      if (n >= 0xdc00 && n <= 0xdfff) { i++; continue; }
      return false;
    }
    if (c >= 0xdc00 && c <= 0xdfff) return false;
  }
  return true;
}

// Firestore document ID rules: valid UTF-8, <= 1500 bytes, no "/", not "." or "..", not __.*__.
// Extra: no control characters.
function isValidFirestoreDocId(v, maxBytes) {
  if (typeof v !== "string" || v.length === 0) return false;
  if (!isWellFormedUtf16(v)) return false;
  const bytes = textEnc.encode(v).length;
  if (bytes < 1 || bytes > (maxBytes || CONFIG.MAX_DOC_ID_BYTES)) return false;
  if (v.includes("/")) return false;
  if (v === "." || v === "..") return false;
  if (/^__.*__$/.test(v)) return false;
  if (/[\u0000-\u001F\u007F-\u009F\u2028\u2029]/.test(v)) return false;
  return true;
}

function checkEnv(env) {
  if (
    !env.FIREBASE_CLIENT_EMAIL ||
    !env.FIREBASE_PRIVATE_KEY ||
    !env.FIREBASE_PROJECT_ID ||
    !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(String(env.FIREBASE_PROJECT_ID))
  ) {
    console.error("TRANSFER MISCONFIGURED: missing or malformed Firebase secrets");
    throw new HttpError(500, "SERVER_MISCONFIGURED", "Server configuration error");
  }
}

/* ------------------------------ responses ------------------------------ */

function jsonResponse(status, body, cors, extra) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...(cors || {}),
      ...(extra || {}),
    },
  });
}

function errorResponse(e, cors) {
  if (e instanceof HttpError) {
    return jsonResponse(e.status, { ok: false, code: e.code, message: e.message }, cors, e.headers);
  }
  console.error("TRANSFER_UNHANDLED", e && e.name);
  return jsonResponse(500, { ok: false, code: "INTERNAL_ERROR", message: "Internal error" }, cors);
}

async function readJsonBody(request) {
  const ct = request.headers.get("Content-Type") || "";
  if (!/^application\/json(\s*;|$)/i.test(ct)) {
    throw new HttpError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json");
  }
  const cl = request.headers.get("Content-Length");
  if (cl && Number(cl) > CONFIG.MAX_BODY_BYTES) {
    throw new HttpError(413, "BODY_TOO_LARGE", "Request body too large");
  }
  if (!request.body) throw new HttpError(400, "BAD_REQUEST", "Request body is missing");
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > CONFIG.MAX_BODY_BYTES) {
      try { await reader.cancel(); } catch (_) {}
      throw new HttpError(413, "BODY_TOO_LARGE", "Request body too large");
    }
    chunks.push(value);
  }
  const buf = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { buf.set(c, off); off += c.length; }
  let data;
  try {
    data = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(buf));
  } catch (_) {
    throw new HttpError(400, "INVALID_JSON", "Invalid JSON");
  }
  if (!isPlainObject(data)) throw new HttpError(400, "INVALID_JSON", "Invalid JSON");
  return data;
}

/* ------------------------------ Firebase ID token verification ------------------------------ */
/* Same checks as worker.js: RS256 signature against Google's JWKS, exp, iat, auth_time,
   aud == project, iss == https://securetoken.google.com/<project>, sub = UID. */

let jwksCache = null;
let jwksPromise = null;
let jwksRetryAt = 0;

async function fetchJwks() {
  const unavailable = () => new HttpError(503, "AUTH_KEYS_UNAVAILABLE", "Service temporarily unavailable");
  let res;
  try {
    res = await fetch(CONFIG.JWKS_URL, { signal: AbortSignal.timeout(CONFIG.FETCH_TIMEOUT_MS) });
  } catch (_) {
    throw unavailable();
  }
  if (!res.ok) throw unavailable();
  let data;
  try { data = await res.json(); } catch (_) { throw unavailable(); }
  if (!data || !Array.isArray(data.keys)) throw unavailable();
  const m = /max-age=(\d+)/.exec(res.headers.get("Cache-Control") || "");
  const ttl = Math.max(
    CONFIG.JWKS_MIN_TTL_SECONDS,
    Math.min(m ? Number(m[1]) : 3600, CONFIG.JWKS_MAX_TTL_SECONDS)
  );
  const keys = new Map();
  for (const jwk of data.keys) {
    if (jwk && jwk.kty === "RSA" && typeof jwk.kid === "string") {
      try {
        keys.set(
          jwk.kid,
          await crypto.subtle.importKey(
            "jwk",
            jwk,
            { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
            false,
            ["verify"]
          )
        );
      } catch (_) { /* skip unusable key */ }
    }
  }
  if (keys.size === 0) throw unavailable();
  const now = Date.now();
  jwksCache = { keys, fetchedAt: now, expiresAt: now + ttl * 1000 };
}

function refreshJwks() {
  if (!jwksPromise) {
    jwksPromise = fetchJwks()
      .catch((e) => { jwksRetryAt = Date.now() + CONFIG.JWKS_RETRY_BACKOFF_MS; throw e; })
      .finally(() => { jwksPromise = null; });
  }
  return jwksPromise;
}

async function getVerificationKey(kid) {
  const now = Date.now();
  if (!jwksCache || now >= jwksCache.expiresAt) {
    const staleUsable = jwksCache && now < jwksCache.expiresAt + CONFIG.JWKS_STALE_GRACE_MS;
    if (staleUsable && now < jwksRetryAt) {
      // Google unreachable a moment ago; keep using recently expired keys
    } else {
      try {
        await refreshJwks();
      } catch (e) {
        if (!staleUsable) throw e;
        console.error("TRANSFER JWKS_REFRESH_FAILED using recently expired keys");
      }
    }
  }
  let key = jwksCache.keys.get(kid);
  if (!key && Date.now() - jwksCache.fetchedAt > CONFIG.JWKS_UNKNOWN_KID_REFRESH_MS) {
    await refreshJwks();
    key = jwksCache.keys.get(kid);
  }
  return key || null;
}

async function verifyIdToken(token, projectId) {
  const fail = () => new HttpError(401, "UNAUTHORIZED", "Unauthorized");
  if (typeof token !== "string" || token.length > 4096) throw fail();
  const parts = token.split(".");
  if (parts.length !== 3) throw fail();
  let header, payload, sig;
  try {
    header = parseJsonPart(parts[0]);
    payload = parseJsonPart(parts[1]);
    sig = b64urlToBytes(parts[2]);
  } catch (_) {
    throw fail();
  }
  if (!isPlainObject(header) || !isPlainObject(payload)) throw fail();
  if (header.alg !== "RS256" || typeof header.kid !== "string") throw fail();

  const key = await getVerificationKey(header.kid);
  if (!key) throw fail();
  const ok = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    sig,
    textEnc.encode(parts[0] + "." + parts[1])
  );
  if (!ok) throw fail();

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || payload.exp <= now - CONFIG.EXP_SKEW_SECONDS) throw fail();
  if (typeof payload.iat !== "number" || payload.iat > now + CONFIG.IAT_SKEW_SECONDS) throw fail();
  if (typeof payload.auth_time !== "number" || payload.auth_time > now + CONFIG.IAT_SKEW_SECONDS) throw fail();
  if (payload.aud !== projectId) throw fail();
  if (payload.iss !== "https://securetoken.google.com/" + projectId) throw fail();
  if (!isValidFirestoreDocId(payload.sub, CONFIG.MAX_DOC_ID_BYTES) || payload.sub.length > CONFIG.MAX_UID_CHARS) {
    throw fail();
  }
  return { uid: payload.sub };
}

/* ------------------------------ Service Account access token ------------------------------ */

let signingKeyPromise = null;
let tokenCache = null;
let tokenPromise = null;

function getSigningKey(env) {
  if (!signingKeyPromise) {
    signingKeyPromise = (async () => {
      const pem = String(env.FIREBASE_PRIVATE_KEY).trim().replace(/^"|"$/g, "").replace(/\\n/g, "\n");
      const b64 = pem
        .replace(/-----BEGIN PRIVATE KEY-----/, "")
        .replace(/-----END PRIVATE KEY-----/, "")
        .replace(/\s+/g, "");
      const der = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      return crypto.subtle.importKey(
        "pkcs8",
        der,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"]
      );
    })().catch(() => {
      signingKeyPromise = null;
      console.error("TRANSFER PRIVATE_KEY_IMPORT_FAILED");
      throw new HttpError(500, "SERVER_MISCONFIGURED", "Server configuration error");
    });
  }
  return signingKeyPromise;
}

async function mintAccessToken(env) {
  const key = await getSigningKey(env);
  const iat = Math.floor(Date.now() / 1000);
  const claims = {
    iss: env.FIREBASE_CLIENT_EMAIL,
    scope: CONFIG.SCOPE,
    aud: CONFIG.TOKEN_URL,
    iat,
    exp: iat + 3600,
  };
  const unsigned =
    strToB64url(JSON.stringify({ alg: "RS256", typ: "JWT" })) + "." +
    strToB64url(JSON.stringify(claims));
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, textEnc.encode(unsigned));
  const assertion = unsigned + "." + bytesToB64url(sig);

  let res;
  try {
    res = await fetch(CONFIG.TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:
        "grant_type=" + encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer") +
        "&assertion=" + encodeURIComponent(assertion),
      signal: AbortSignal.timeout(CONFIG.FETCH_TIMEOUT_MS),
    });
  } catch (_) {
    console.error("TRANSFER OAUTH_NETWORK_ERROR");
    throw new HttpError(503, "UPSTREAM_UNAVAILABLE", "Service temporarily unavailable");
  }
  if (!res.ok) {
    let code = "";
    try { code = String((await res.json()).error || "").slice(0, 64); } catch (_) {}
    console.error("TRANSFER OAUTH_EXCHANGE_FAILED status=" + res.status + " error=" + code);
    if (res.status >= 400 && res.status < 500 && res.status !== 429) {
      throw new HttpError(500, "SERVER_MISCONFIGURED", "Server configuration error");
    }
    throw new HttpError(503, "UPSTREAM_UNAVAILABLE", "Service temporarily unavailable");
  }
  let data = null;
  try { data = await res.json(); } catch (_) {}
  if (!data || typeof data.access_token !== "string") {
    throw new HttpError(503, "UPSTREAM_UNAVAILABLE", "Service temporarily unavailable");
  }
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + Math.max(60, (Number(data.expires_in) || 3600) - 120) * 1000,
  };
  return tokenCache.token;
}

function getAccessToken(env) {
  if (tokenCache && Date.now() < tokenCache.expiresAt) return Promise.resolve(tokenCache.token);
  if (!tokenPromise) tokenPromise = mintAccessToken(env).finally(() => { tokenPromise = null; });
  return tokenPromise;
}

/* ------------------------------ Firestore REST ------------------------------ */

const dbPath = (env) => "projects/" + env.FIREBASE_PROJECT_ID + "/databases/(default)";
// Resource names are sent inside JSON bodies only (never in URL paths).
const docName = (env, col, id) => dbPath(env) + "/documents/" + col + "/" + id;

async function fsPost(env, method, body, retryAuth = true) {
  const token = await getAccessToken(env);
  let res;
  try {
    res = await fetch(
      "https://firestore.googleapis.com/v1/" + dbPath(env) + "/documents:" + method,
      {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(CONFIG.FETCH_TIMEOUT_MS),
      }
    );
  } catch (_) {
    console.error("TRANSFER FIRESTORE_NETWORK_ERROR method=" + method);
    throw new FirestoreError(0, "NETWORK");
  }
  if (res.status === 401 && retryAuth) {
    tokenCache = null;
    return fsPost(env, method, body, false);
  }
  let data = null;
  try { data = await res.json(); } catch (_) {}
  if (!res.ok) {
    const fsStatus = (data && data.error && data.error.status) || "";
    console.error("TRANSFER FIRESTORE_FAILED method=" + method + " http=" + res.status + " status=" + fsStatus);
    throw new FirestoreError(res.status, fsStatus);
  }
  return data;
}

async function beginTransaction(env) {
  const r = await fsPost(env, "beginTransaction", { options: { readWrite: {} } });
  if (!r || typeof r.transaction !== "string") throw new FirestoreError(0, "BAD_RESPONSE");
  return r.transaction;
}

async function rollbackQuietly(env, tx) {
  try { await fsPost(env, "rollback", { transaction: tx }); } catch (_) {}
}

// Map: name -> document | null (confirmed missing). A name absent from the map was not answered.
async function txBatchGet(env, tx, names) {
  const arr = await fsPost(env, "batchGet", { documents: names, transaction: tx });
  if (!Array.isArray(arr)) throw new FirestoreError(0, "BAD_RESPONSE");
  const map = new Map();
  for (const item of arr) {
    if (item && item.found && item.found.name) map.set(item.found.name, item.found);
    else if (item && typeof item.missing === "string") map.set(item.missing, null);
  }
  return map;
}

function getRaw(fields, path) {
  let cur = { mapValue: { fields: fields || {} } };
  for (const k of path) {
    if (!cur || !cur.mapValue) return undefined;
    cur = (cur.mapValue.fields || {})[k];
  }
  return cur;
}

// Only integerValue / doubleValue are accepted ("NaN"/"Infinity" strings are rejected).
function rawToNumber(v) {
  if (!v) return null;
  if (Object.prototype.hasOwnProperty.call(v, "integerValue")) {
    const n = Number(v.integerValue);
    return Number.isSafeInteger(n) ? n : null;
  }
  if (Object.prototype.hasOwnProperty.call(v, "doubleValue")) {
    const n = Number(v.doubleValue);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

// Keeps the original Firestore number type when possible.
function encodeLike(origRaw, n) {
  const wasInt = origRaw && Object.prototype.hasOwnProperty.call(origRaw, "integerValue");
  if (wasInt && Number.isSafeInteger(n)) return { integerValue: String(n) };
  return { doubleValue: n };
}

const encNumber = (n) => (Number.isSafeInteger(n) ? { integerValue: String(n) } : { doubleValue: n });
const encStr = (s) => ({ stringValue: s });

/* ------------------------------ input validation ------------------------------ */

function parseAmount(v) {
  // Only real JSON numbers are accepted (no strings like "1e2" or " 10 ").
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  if (v < CONFIG.MIN_AMOUNT || v > CONFIG.MAX_AMOUNT) return null;
  const scaled = Math.round(v * 100);
  if (Math.abs(v * 100 - scaled) > 1e-6) return null; // more than 2 decimals
  const amount = scaled / 100;
  return amount >= CONFIG.MIN_AMOUNT ? amount : null;
}

function parseRecipientNumericId(v) {
  // Normally a string ("4349566787"). A JSON integer is tolerated and converted.
  const s = typeof v === "number" && Number.isSafeInteger(v) ? String(v) : v;
  return typeof s === "string" && CONFIG.NUMERIC_ID_REGEX.test(s) ? s : null;
}

function parseRequestId(v) {
  if (v === undefined || v === null) return null;
  return typeof v === "string" && CONFIG.REQUEST_ID_REGEX.test(v) ? v : false;
}

/* ------------------------------ recipient lookup ------------------------------ */

async function findRecipientUid(env, numericId) {
  const arr = await fsPost(env, "runQuery", {
    structuredQuery: {
      from: [{ collectionId: CONFIG.USERS }],
      where: {
        fieldFilter: {
          field: { fieldPath: CONFIG.NUMERIC_ID_FIELD },
          op: "EQUAL",
          value: { stringValue: numericId },
        },
      },
      select: { fields: [{ fieldPath: "__name__" }] },
      limit: 2, // 2 is enough to detect an ambiguous (duplicated) numericId
    },
  });
  if (!Array.isArray(arr)) throw new FirestoreError(0, "BAD_RESPONSE");
  const prefix = dbPath(env) + "/documents/" + CONFIG.USERS + "/";
  const uids = [];
  for (const item of arr) {
    if (item && item.document && typeof item.document.name === "string") {
      const name = item.document.name;
      if (!name.startsWith(prefix)) continue;
      const id = name.slice(prefix.length);
      if (!isValidFirestoreDocId(id, CONFIG.MAX_DOC_ID_BYTES)) continue;
      uids.push(id);
    }
  }
  if (uids.length === 0) throw new HttpError(404, "RECIPIENT_NOT_FOUND", "Recipient not found");
  if (uids.length > 1) {
    console.error("TRANSFER AMBIGUOUS_NUMERIC_ID");
    throw new HttpError(409, "RECIPIENT_UNRESOLVED", "Recipient could not be resolved");
  }
  return uids[0];
}

/* ------------------------------ transfer transaction ------------------------------ */

// Transaction document ID: deterministic from (sender, requestId), so a re-sent
// request maps to the SAME document. ASCII, fixed length.
async function deriveTransferDocId(senderId, requestId) {
  const input = JSON.stringify([CONFIG.ID_LABEL, senderId, requestId]);
  const digest = await crypto.subtle.digest("SHA-256", textEnc.encode(input));
  return "tr_" + hex(digest);
}

async function attemptTransfer(env, p) {
  const { senderId, recipientId, recipientNumericId, amount, transferDocId } = p;
  const senderN = docName(env, CONFIG.USERS, senderId);
  const recipientN = docName(env, CONFIG.USERS, recipientId);
  const transN = docName(env, CONFIG.TRANSACTIONS, transferDocId);

  const tx = await beginTransaction(env);
  let finished = false;
  try {
    const docs = await txBatchGet(env, tx, [senderN, recipientN, transN]);
    for (const n of [senderN, recipientN, transN]) {
      if (!docs.has(n)) {
        console.error("TRANSFER BATCHGET_UNANSWERED_NAME");
        throw new HttpError(502, "UPSTREAM_INCONSISTENT", "Unexpected database response");
      }
    }
    const sender = docs.get(senderN);
    const recipient = docs.get(recipientN);
    const existing = docs.get(transN);

    if (!sender) throw new HttpError(403, "UNAUTHORIZED", "Unauthorized");
    if (!recipient) throw new HttpError(404, "RECIPIENT_NOT_FOUND", "Recipient not found");

    // The recipient must still own the numericId that was looked up.
    const rn = getRaw(recipient.fields, [CONFIG.NUMERIC_ID_FIELD]);
    if (!rn || rn.stringValue !== recipientNumericId) {
      throw new HttpError(404, "RECIPIENT_NOT_FOUND", "Recipient not found");
    }

    const senderEarnedRaw = getRaw(sender.fields, ["wallet", "earned"]);
    const senderEarned = rawToNumber(senderEarnedRaw);

    // Idempotent replay: the transaction record already exists for this requestId.
    if (existing) {
      const exSender = getRaw(existing.fields, ["senderId"]);
      const exRecipient = getRaw(existing.fields, ["recipientId"]);
      const exType = getRaw(existing.fields, ["type"]);
      const exAmount = rawToNumber(getRaw(existing.fields, ["amount"]));
      if (
        exSender && exSender.stringValue === senderId &&
        exRecipient && exRecipient.stringValue === recipientId &&
        exType && exType.stringValue === "transfer" &&
        exAmount === amount
      ) {
        finished = true;
        await rollbackQuietly(env, tx); // nothing to write; release locks
        return { duplicate: true, senderBalanceAfter: senderEarned }; // current balance, nothing charged
      }
      throw new HttpError(
        409,
        "REQUEST_ID_CONFLICT",
        "This requestId was already used for a different transfer"
      );
    }

    if (senderEarned === null || senderEarned < 0) {
      throw new HttpError(422, "INVALID_BALANCE", "Your balance is unavailable");
    }
    const recipientEarnedRaw = getRaw(recipient.fields, ["wallet", "earned"]);
    const recipientEarned = rawToNumber(recipientEarnedRaw);
    if (recipientEarned === null || recipientEarned < 0) {
      throw new HttpError(422, "RECIPIENT_UNAVAILABLE", "Recipient cannot receive points right now");
    }

    // Exact comparison; single subtraction / addition, no artificial rounding.
    if (senderEarned < amount) {
      throw new HttpError(402, "INSUFFICIENT_BALANCE", "Insufficient balance");
    }
    const senderAfter = senderEarned - amount;
    const recipientAfter = recipientEarned + amount;
    if (
      !Number.isFinite(senderAfter) || senderAfter < 0 ||
      !Number.isFinite(recipientAfter) || recipientAfter < 0
    ) {
      throw new HttpError(422, "INVALID_BALANCE", "Your balance is unavailable");
    }

    const writes = [
      {
        // sender: only wallet.earned (wallet.gift and all other fields untouched)
        update: {
          name: senderN,
          fields: { wallet: { mapValue: { fields: { earned: encodeLike(senderEarnedRaw, senderAfter) } } } },
        },
        updateMask: { fieldPaths: ["wallet.earned"] },
        currentDocument: { updateTime: sender.updateTime },
      },
      {
        // recipient: only wallet.earned
        update: {
          name: recipientN,
          fields: { wallet: { mapValue: { fields: { earned: encodeLike(recipientEarnedRaw, recipientAfter) } } } },
        },
        updateMask: { fieldPaths: ["wallet.earned"] },
        currentDocument: { updateTime: recipient.updateTime },
      },
      {
        // transaction record: exactly amount, recipientId, senderId, timestamp, type
        update: {
          name: transN,
          fields: {
            amount: encNumber(amount),
            recipientId: encStr(recipientId),
            senderId: encStr(senderId),
            type: encStr("transfer"),
          },
        },
        updateTransforms: [{ fieldPath: "timestamp", setToServerValue: "REQUEST_TIME" }],
        currentDocument: { exists: false }, // can never create a second record for the same requestId
      },
    ];

    // Once the commit is sent the transaction is consumed whatever happens. If the
    // outcome is unknown (network/timeout) the retry re-reads the transaction
    // record: if the first commit succeeded it is returned as a duplicate, no new charge.
    finished = true;
    await fsPost(env, "commit", { transaction: tx, writes });
    return { duplicate: false, senderBalanceAfter: senderAfter };
  } catch (e) {
    if (!finished) await rollbackQuietly(env, tx);
    throw e;
  }
}

function mapFirestoreError(e) {
  if (e.contention && !e.transient) {
    return new HttpError(409, "CONFLICT_RETRY", "Concurrent request detected, please retry", { "Retry-After": "1" });
  }
  if (e.transient) {
    return new HttpError(503, "UPSTREAM_UNAVAILABLE", "Service temporarily unavailable, please retry", { "Retry-After": "2" });
  }
  if (e.httpStatus === 401 || e.httpStatus === 403) {
    return new HttpError(500, "SERVER_MISCONFIGURED", "Server configuration error");
  }
  return new HttpError(500, "INTERNAL_ERROR", "Internal error");
}

async function transferWithRetry(env, p) {
  let last;
  for (let i = 1; i <= CONFIG.MAX_TX_ATTEMPTS; i++) {
    try {
      return await attemptTransfer(env, p);
    } catch (e) {
      last = e;
      if (e instanceof FirestoreError && e.retryable && i < CONFIG.MAX_TX_ATTEMPTS) {
        await sleep(60 * 2 ** (i - 1) + Math.floor(Math.random() * 80));
        continue;
      }
      break;
    }
  }
  if (last instanceof FirestoreError) throw mapFirestoreError(last);
  throw last;
}

/* ------------------------------ public handler ------------------------------ */

/**
 * @param {Request} request
 * @param {object}  env   Cloudflare env (same secrets as worker.js)
 * @param {object}  [corsHeaders] headers added to EVERY response (success and errors)
 * @returns {Promise<Response>}
 */
export async function handleTransfer(request, env, corsHeaders = {}) {
  try {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: { ...corsHeaders, "Cache-Control": "no-store" } });
    }
    if (request.method !== "POST") {
      return jsonResponse(
        405,
        { ok: false, code: "METHOD_NOT_ALLOWED", message: "Method not allowed" },
        corsHeaders,
        { Allow: "POST, OPTIONS" }
      );
    }
    checkEnv(env);

    const m = /^Bearer\s+(\S+)$/i.exec(request.headers.get("Authorization") || "");
    if (!m) throw new HttpError(401, "UNAUTHORIZED", "Unauthorized");

    const body = await readJsonBody(request);

    // Identity comes ONLY from the verified token. Any uid / balance sent by the client is ignored.
    const { uid: senderId } = await verifyIdToken(m[1], env.FIREBASE_PROJECT_ID);

    const amount = parseAmount(body.amount);
    if (amount === null) throw new HttpError(400, "INVALID_AMOUNT", "Invalid amount");

    const recipientNumericId = parseRecipientNumericId(body.recipientNumericId);
    if (!recipientNumericId) throw new HttpError(400, "INVALID_RECIPIENT_ID", "Invalid recipient ID");

    let requestId = parseRequestId(body.requestId);
    if (requestId === false) throw new HttpError(400, "INVALID_REQUEST_ID", "Invalid requestId");
    if (requestId === null) {
      if (CONFIG.REQUIRE_REQUEST_ID) throw new HttpError(400, "REQUEST_ID_REQUIRED", "requestId is required");
      // No client key: unique per request. Safe against internal retries only.
      requestId = crypto.randomUUID();
    }

    let recipientId;
    try {
      recipientId = await findRecipientUid(env, recipientNumericId);
    } catch (e) {
      if (e instanceof FirestoreError) throw mapFirestoreError(e);
      throw e;
    }
    if (recipientId === senderId) {
      throw new HttpError(400, "SELF_TRANSFER", "Cannot transfer to yourself");
    }

    const transferDocId = await deriveTransferDocId(senderId, requestId);
    const result = await transferWithRetry(env, {
      senderId,
      recipientId,
      recipientNumericId,
      amount,
      transferDocId,
    });

    return jsonResponse(
      200,
      {
        ok: true,
        message: result.duplicate
          ? "Transfer already completed"
          : "Transfer completed successfully",
        amount,
        senderBalanceAfter: result.senderBalanceAfter,
        duplicate: result.duplicate,
      },
      corsHeaders
    );
  } catch (e) {
    return errorResponse(e, corsHeaders);
  }
}
