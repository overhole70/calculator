/**
 * Over Mods - Unified Cloudflare D1 Database & Auth Worker (workerd1.js)
 * Single Worker containing both User Services & Content Services:
 *
 * --- PART 1: USER SERVICES (Database Binding: env.overmods_d1) ---
 * 1. users
 * 2. support
 * 3. notifications
 * 4. follows
 * 5. transactions
 * 6. app_config
 * 7. app_settings
 * + Auth Email Verification & Password Reset via Resend & Identity Toolkit
 *
 * --- PART 2: CONTENT SERVICES (Database Binding: env["overmods-content"]) ---
 * 1. mods
 * 2. purchases
 * 3. servers
 * 4. game_invites
 * 5. postActions (likes / dislikes)
 * 6. reports
 * 7. private_mod_downloads
 * + Batch Migration & Hydration
 *
 * Dedicated Worker URL: https://workerd1.overmods.site
 */

const CONFIG = {
  DEFAULT_ALLOWED_ORIGINS: [
    "https://overmods.site",
    "https://www.overmods.site",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
  ],
  JWKS_URL: "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  TOKEN_URL: "https://oauth2.googleapis.com/token",
  IDENTITY_TOOLKIT_URL: "https://identitytoolkit.googleapis.com/v1/projects",
  RESEND_API_URL: "https://api.resend.com/emails",
  FROM_EMAIL: "Over Mods <Verify-e@overmods.site>",
  BASE_URL: "https://www.overmods.site",
  FIREBASE_PROJECT_ID: "over-mods-d2d03",
  FIREBASE_API_KEY: "AIzaSyDiBxFISZbY3MveLqDo75T2ILMcH-BNEyQ",
  WORKER_D1_URL: "https://workerd1.overmods.site",
  MAX_BODY_BYTES: 2097152, // 2MB
  MAX_TIMEOUT_MS: 10000,
  ADMIN_EMAIL: "overmods1@gmail.com"
};

/* ------------------------------ Errors ------------------------------ */

class HttpError extends Error {
  constructor(status, code, message, headers) {
    super(message);
    this.status = status;
    this.code = code;
    this.headers = headers || null;
  }
}

/* ------------------------------ Helpers ------------------------------ */

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
  for (let i = 0; i < bin.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const strToB64url = (s) => bytesToB64url(textEnc.encode(s));
const parseJsonPart = (p) => JSON.parse(textDec.decode(b64urlToBytes(p)));
const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

function parseJsonField(val, fallback) {
  if (val === null || val === undefined) return fallback;
  if (typeof val !== "string") return val;
  try {
    return JSON.parse(val);
  } catch (_) {
    return fallback;
  }
}

function corsHeaders(origin, env) {
  const allowed = [
    ...CONFIG.DEFAULT_ALLOWED_ORIGINS,
    ...(env && env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(",").map(s => s.trim()).filter(Boolean) : [])
  ];
  const h = {
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, X-Requested-With",
    "Access-Control-Expose-Headers": "Retry-After",
    "Access-Control-Max-Age": "86400"
  };
  if (origin && (allowed.includes(origin) || origin.endsWith(".overmods.site"))) {
    h["Access-Control-Allow-Origin"] = origin;
  } else {
    h["Access-Control-Allow-Origin"] = "*";
  }
  return h;
}

function jsonResponse(status, body, cors, extra) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...(cors || {}),
      ...(extra || {})
    }
  });
}

function errorResponse(e, cors) {
  if (e instanceof HttpError) {
    return jsonResponse(
      e.status,
      { ok: false, error: { code: e.code, message: e.message } },
      cors,
      e.headers
    );
  }
  console.error("D1_UNIFIED_WORKER_ERROR:", e);
  return jsonResponse(
    500,
    { ok: false, error: { code: "INTERNAL_ERROR", message: e?.message || "حدث خطأ غير متوقع في الخادم." } },
    cors
  );
}

async function readJsonBody(request) {
  const ct = request.headers.get("Content-Type") || "";
  if (!/^application\/json(\s*;|$)/i.test(ct)) {
    throw new HttpError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json.");
  }
  const cl = request.headers.get("Content-Length");
  if (cl && Number(cl) > CONFIG.MAX_BODY_BYTES) {
    throw new HttpError(413, "BODY_TOO_LARGE", "Request body too large.");
  }
  try {
    const text = await request.text();
    if (!text || !text.trim()) return {};
    return JSON.parse(text);
  } catch (err) {
    throw new HttpError(400, "INVALID_JSON", "Invalid JSON format.");
  }
}

/* ------------------------------ D1 Schema Auto-Migration ------------------------------ */

let userSchemaInitializedPromise = null;
let contentSchemaInitializedPromise = null;
let logsSchemaInitializedPromise = null;

async function ensureUserSchema(db) {
  if (!db) return;
  if (userSchemaInitializedPromise) return userSchemaInitializedPromise;

  userSchemaInitializedPromise = (async () => {
    const statements = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        username TEXT UNIQUE,
        displayName TEXT,
        avatar TEXT,
        role TEXT DEFAULT 'User',
        isAdmin INTEGER DEFAULT 0,
        isVerified INTEGER DEFAULT 0,
        balance REAL DEFAULT 0,
        status TEXT DEFAULT 'active',
        banned INTEGER DEFAULT 0,
        banReason TEXT,
        bio TEXT,
        socialLinks TEXT,
        stats TEXT,
        adminPermissions TEXT,
        securityCode TEXT,
        securityCodeFrequency INTEGER,
        loginsSinceLastCode INTEGER,
        raw_data TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );`,
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
      `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`,
      `CREATE INDEX IF NOT EXISTS idx_users_createdAt ON users(createdAt);`,

      `CREATE TABLE IF NOT EXISTS support (
        id TEXT PRIMARY KEY,
        userId TEXT,
        email TEXT,
        username TEXT,
        subject TEXT,
        message TEXT,
        category TEXT DEFAULT 'general',
        status TEXT DEFAULT 'open',
        adminReply TEXT,
        repliedAt TEXT,
        repliedBy TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );`,
      `CREATE INDEX IF NOT EXISTS idx_support_userId ON support(userId);`,
      `CREATE INDEX IF NOT EXISTS idx_support_status ON support(status);`,

      `CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        userId TEXT,
        actorId TEXT,
        actorName TEXT,
        actorAvatar TEXT,
        type TEXT,
        title TEXT,
        message TEXT,
        link TEXT,
        targetId TEXT,
        read INTEGER DEFAULT 0,
        createdAt TEXT
      );`,
      `CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);`,
      `CREATE INDEX IF NOT EXISTS idx_notifications_createdAt ON notifications(createdAt);`,

      `CREATE TABLE IF NOT EXISTS follows (
        id TEXT PRIMARY KEY,
        followerId TEXT,
        followingId TEXT,
        createdAt TEXT
      );`,
      `CREATE INDEX IF NOT EXISTS idx_follows_followerId ON follows(followerId);`,
      `CREATE INDEX IF NOT EXISTS idx_follows_followingId ON follows(followingId);`,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_follows_pair ON follows(followerId, followingId);`,

      `CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        userId TEXT,
        type TEXT,
        amount REAL,
        description TEXT,
        status TEXT DEFAULT 'completed',
        referenceId TEXT,
        createdAt TEXT
      );`,
      `CREATE INDEX IF NOT EXISTS idx_transactions_userId ON transactions(userId);`,

      `CREATE TABLE IF NOT EXISTS app_config (
        id TEXT PRIMARY KEY,
        configKey TEXT UNIQUE,
        configValue TEXT,
        updatedAt TEXT
      );`,

      `CREATE TABLE IF NOT EXISTS app_settings (
        id TEXT PRIMARY KEY,
        settingKey TEXT UNIQUE,
        settingValue TEXT,
        updatedAt TEXT
      );`
    ];

    for (const sql of statements) {
      try {
        await db.prepare(sql).run();
      } catch (e) {
        console.warn("User schema init statement warning:", e?.message);
      }
    }
  })();

  return userSchemaInitializedPromise;
}

async function ensureContentSchema(db) {
  if (!db) return;
  if (contentSchemaInitializedPromise) return contentSchemaInitializedPromise;

  contentSchemaInitializedPromise = (async () => {
    const statements = [
      `CREATE TABLE IF NOT EXISTS mods (
        id TEXT PRIMARY KEY,
        shareCode TEXT,
        modCode TEXT,
        title TEXT,
        description TEXT,
        visibilityLevel TEXT DEFAULT 'public',
        publisherId TEXT,
        type TEXT,
        category TEXT,
        minecraftVersion TEXT,
        mainImage TEXT,
        additionalImages TEXT DEFAULT '[]',
        downloadUrl TEXT,
        fileSize TEXT,
        stats TEXT DEFAULT '{"views":0,"uniqueViews":0,"downloads":0,"likes":0,"dislikes":0,"averageRating":0,"ratingCount":0,"totalRatingScore":0}',
        fakeStats TEXT,
        comments TEXT DEFAULT '[]',
        likedBy TEXT DEFAULT '[]',
        dislikedBy TEXT DEFAULT '[]',
        ratedBy TEXT DEFAULT '{}',
        youtubeUrl TEXT,
        price REAL DEFAULT 0,
        platform TEXT,
        modLoader TEXT,
        disableAds INTEGER DEFAULT 0,
        creatorAdCodes TEXT DEFAULT '[]',
        monetizationEnabled INTEGER DEFAULT 0,
        monetizationSuspended INTEGER DEFAULT 0,
        monetizationSuspendedReason TEXT,
        monetizationActivatedAt INTEGER,
        customAdRate REAL,
        raw_data TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );`,
      `CREATE INDEX IF NOT EXISTS idx_mods_publisherId ON mods(publisherId);`,
      `CREATE INDEX IF NOT EXISTS idx_mods_createdAt ON mods(createdAt);`,
      `CREATE INDEX IF NOT EXISTS idx_mods_category ON mods(category);`,
      `CREATE INDEX IF NOT EXISTS idx_mods_type ON mods(type);`,
      `CREATE INDEX IF NOT EXISTS idx_mods_modCode ON mods(modCode);`,
      `CREATE INDEX IF NOT EXISTS idx_mods_shareCode ON mods(shareCode);`,

      `CREATE TABLE IF NOT EXISTS purchases (
        id TEXT PRIMARY KEY,
        userId TEXT,
        modId TEXT,
        publisherId TEXT,
        amount REAL DEFAULT 0,
        type TEXT DEFAULT 'purchase',
        status TEXT DEFAULT 'completed',
        metadata TEXT,
        raw_data TEXT,
        createdAt TEXT
      );`,
      `CREATE INDEX IF NOT EXISTS idx_purchases_userId ON purchases(userId);`,
      `CREATE INDEX IF NOT EXISTS idx_purchases_modId ON purchases(modId);`,
      `CREATE INDEX IF NOT EXISTS idx_purchases_publisherId ON purchases(publisherId);`,

      `CREATE TABLE IF NOT EXISTS servers (
        id TEXT PRIMARY KEY,
        title TEXT,
        description TEXT,
        ip TEXT,
        port TEXT,
        version TEXT,
        type TEXT DEFAULT 'Server',
        serverType TEXT,
        edition TEXT DEFAULT 'Bedrock',
        platform TEXT,
        category TEXT,
        publisherId TEXT,
        status TEXT DEFAULT 'offline',
        isOnline INTEGER DEFAULT 0,
        javaStatus TEXT DEFAULT 'offline',
        bedrockStatus TEXT DEFAULT 'offline',
        onlinePlayers INTEGER DEFAULT 0,
        maxPlayers INTEGER DEFAULT 0,
        motd TEXT,
        ping INTEGER,
        lastChecked TEXT,
        raw_data TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );`,
      `CREATE INDEX IF NOT EXISTS idx_servers_publisherId ON servers(publisherId);`,
      `CREATE INDEX IF NOT EXISTS idx_servers_createdAt ON servers(createdAt);`,

      `CREATE TABLE IF NOT EXISTS game_invites (
        id TEXT PRIMARY KEY,
        hostId TEXT,
        mcName TEXT,
        version TEXT,
        expiresAt TEXT,
        raw_data TEXT,
        createdAt TEXT
      );`,
      `CREATE INDEX IF NOT EXISTS idx_game_invites_hostId ON game_invites(hostId);`,
      `CREATE INDEX IF NOT EXISTS idx_game_invites_createdAt ON game_invites(createdAt);`,
      `CREATE INDEX IF NOT EXISTS idx_game_invites_expiresAt ON game_invites(expiresAt);`,

      `CREATE TABLE IF NOT EXISTS postActions (
        id TEXT PRIMARY KEY,
        postId TEXT,
        userId TEXT,
        liked INTEGER DEFAULT 0,
        disliked INTEGER DEFAULT 0,
        raw_data TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );`,
      `CREATE INDEX IF NOT EXISTS idx_postActions_postId ON postActions(postId);`,
      `CREATE INDEX IF NOT EXISTS idx_postActions_userId ON postActions(userId);`,

      `CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        modId TEXT,
        modTitle TEXT,
        serverId TEXT,
        postId TEXT,
        publisherId TEXT,
        reporterId TEXT,
        reporterName TEXT,
        reason TEXT,
        status TEXT DEFAULT 'pending',
        raw_data TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );`,
      `CREATE INDEX IF NOT EXISTS idx_reports_modId ON reports(modId);`,
      `CREATE INDEX IF NOT EXISTS idx_reports_publisherId ON reports(publisherId);`,
      `CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);`,

      `CREATE TABLE IF NOT EXISTS private_mod_downloads (
        id TEXT PRIMARY KEY,
        modId TEXT,
        downloadUrl TEXT,
        publisherId TEXT,
        raw_data TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );`,
      `CREATE INDEX IF NOT EXISTS idx_private_mod_downloads_modId ON private_mod_downloads(modId);`,

      `CREATE TABLE IF NOT EXISTS community_posts (
        id TEXT PRIMARY KEY,
        authorId TEXT,
        authorName TEXT,
        authorAvatar TEXT,
        title TEXT,
        description TEXT,
        images TEXT DEFAULT '[]',
        likes TEXT DEFAULT '[]',
        fakeLikes INTEGER,
        comments TEXT DEFAULT '[]',
        expiresAt TEXT,
        raw_data TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );`,
      `CREATE INDEX IF NOT EXISTS idx_community_posts_authorId ON community_posts(authorId);`,
      `CREATE INDEX IF NOT EXISTS idx_community_posts_createdAt ON community_posts(createdAt);`
    ];

    for (const sql of statements) {
      try {
        await db.prepare(sql).run();
      } catch (e) {
        console.warn("Content schema init statement warning:", e?.message);
      }
    }
  })();

  return contentSchemaInitializedPromise;
}

async function ensureLogsSchema(db) {
  if (!db) return;
  if (logsSchemaInitializedPromise) return logsSchemaInitializedPromise;

  logsSchemaInitializedPromise = (async () => {
    const statements = [
      `CREATE TABLE IF NOT EXISTS mod_view_logs (
        id TEXT PRIMARY KEY,
        modId TEXT NOT NULL,
        userId TEXT,
        deviceId TEXT,
        ip TEXT NOT NULL,
        country TEXT,
        createdAt TEXT NOT NULL
      );`,
      `CREATE INDEX IF NOT EXISTS idx_mvl_modId ON mod_view_logs(modId);`,
      `CREATE INDEX IF NOT EXISTS idx_mvl_userId ON mod_view_logs(userId);`,
      `CREATE INDEX IF NOT EXISTS idx_mvl_ip ON mod_view_logs(ip);`,
      `CREATE INDEX IF NOT EXISTS idx_mvl_createdAt ON mod_view_logs(createdAt);`,

      `CREATE TABLE IF NOT EXISTS mod_download_logs (
        id TEXT PRIMARY KEY,
        modId TEXT NOT NULL,
        userId TEXT,
        deviceId TEXT,
        ip TEXT NOT NULL,
        country TEXT,
        createdAt TEXT NOT NULL
      );`,
      `CREATE INDEX IF NOT EXISTS idx_mdl_modId ON mod_download_logs(modId);`,
      `CREATE INDEX IF NOT EXISTS idx_mdl_userId ON mod_download_logs(userId);`,
      `CREATE INDEX IF NOT EXISTS idx_mdl_ip ON mod_download_logs(ip);`,
      `CREATE INDEX IF NOT EXISTS idx_mdl_createdAt ON mod_download_logs(createdAt);`,

      `CREATE TABLE IF NOT EXISTS post_view_logs (
        id TEXT PRIMARY KEY,
        postId TEXT NOT NULL,
        viewerId TEXT,
        deviceId TEXT,
        ip TEXT NOT NULL,
        country TEXT,
        createdAt TEXT NOT NULL
      );`,
      `CREATE INDEX IF NOT EXISTS idx_pvl_postId ON post_view_logs(postId);`,
      `CREATE INDEX IF NOT EXISTS idx_pvl_viewerId ON post_view_logs(viewerId);`,
      `CREATE INDEX IF NOT EXISTS idx_pvl_ip ON post_view_logs(ip);`,
      `CREATE INDEX IF NOT EXISTS idx_pvl_createdAt ON post_view_logs(createdAt);`
    ];

    for (const sql of statements) {
      try {
        await db.prepare(sql).run();
      } catch (e) {
        console.warn("Logs schema init statement warning:", e?.message);
      }
    }
  })();

  return logsSchemaInitializedPromise;
}

/* ------------------------------ Client IP & Country Helpers ------------------------------ */

function getClientIp(request) {
  const xff = request.headers.get("X-Forwarded-For") || "";
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    for (const p of parts) {
      if (/^[0-9A-Fa-f:.]+$/.test(p) && (p.includes(".") || p.includes(":"))) {
        return p;
      }
    }
  }
  const cfIp = (request.headers.get("CF-Connecting-IP") || request.headers.get("X-Real-IP") || "").trim();
  if (cfIp && /^[0-9A-Fa-f:.]+$/.test(cfIp) && (cfIp.includes(".") || cfIp.includes(":"))) {
    return cfIp;
  }
  return "127.0.0.1";
}

async function resolveCountry(request, ip, env) {
  let country = request.headers.get("CF-IPCountry") || (request.cf && request.cf.country) || null;
  if (country && typeof country === "string" && country.length === 2 && country !== "XX" && country !== "T1") {
    return country.toUpperCase();
  }

  // Gracefully attempt IPINFO lookup if token is present (never block or fail if it errors)
  if (env && env.IPINFO_TOKEN && ip && ip !== "127.0.0.1" && !ip.startsWith("192.168.") && !ip.startsWith("10.")) {
    try {
      const url = `https://ipinfo.io/${encodeURIComponent(ip)}/json?token=${encodeURIComponent(env.IPINFO_TOKEN)}`;
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.country === "string" && data.country.length === 2) {
          return data.country.toUpperCase();
        }
      }
    } catch (_) {
      // Graceful fallback: do not throw or reject the recording
    }
  }

  return (typeof country === "string" && country) ? country.toUpperCase() : "UNKNOWN";
}

/* ------------------------------ Firebase ID Token Verification ------------------------------ */

let jwksCache = null;
let jwksExpiresAt = 0;

async function getGoogleJwks() {
  const now = Date.now();
  if (jwksCache && now < jwksExpiresAt) return jwksCache;
  const res = await fetch(CONFIG.JWKS_URL);
  if (!res.ok) throw new Error("فشل استرجاع مفاتيح التحقق من Google.");
  const data = await res.json();
  const maxAge = 3600;
  jwksCache = data.keys || [];
  jwksExpiresAt = now + maxAge * 1000;
  return jwksCache;
}

async function verifyFirebaseToken(idToken, projectId) {
  if (!idToken || typeof idToken !== "string") {
    throw new HttpError(401, "UNAUTHORIZED", "رمز التحقق مفقود.");
  }
  const parts = idToken.split(".");
  if (parts.length !== 3) {
    throw new HttpError(401, "MALFORMED_TOKEN", "رمز التحقق غير صالح.");
  }

  let header, payload;
  try {
    header = parseJsonPart(parts[0]);
    payload = parseJsonPart(parts[1]);
  } catch (err) {
    throw new HttpError(401, "MALFORMED_TOKEN", "تعذر قراءة بيانات الرمز.");
  }

  if (header.alg !== "RS256" || !header.kid) {
    throw new HttpError(401, "INVALID_ALGORITHM", "خوارزمية الرمز غير مدعومة.");
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < nowSec - 60) {
    throw new HttpError(401, "TOKEN_EXPIRED", "انتهت صلاحية جلسة تسجيل الدخول. يرجى تسجيل الدخول مجددًا.");
  }
  if (payload.iat && payload.iat > nowSec + 60) {
    throw new HttpError(401, "TOKEN_FUTURE", "تاريخ إصدار الرمز غير صالح.");
  }

  const expectedIss = `https://securetoken.google.com/${projectId}`;
  if (payload.iss !== expectedIss) {
    throw new HttpError(401, "INVALID_ISSUER", "مصدر الرمز غير موثوق.");
  }
  if (payload.aud !== projectId) {
    throw new HttpError(401, "INVALID_AUDIENCE", "الرمز غير مخصص لهذا المشروع.");
  }
  if (!payload.sub || typeof payload.sub !== "string") {
    throw new HttpError(401, "INVALID_SUBJECT", "معرف المستخدم مفقود.");
  }

  const keys = await getGoogleJwks();
  const jwk = keys.find(k => k.kid === header.kid);
  if (!jwk) {
    throw new HttpError(401, "UNKNOWN_KEY", "مفتاح التحقق غير معروف.");
  }

  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const signedData = textEnc.encode(`${parts[0]}.${parts[1]}`);
  const signatureBytes = b64urlToBytes(parts[2]);
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    signatureBytes,
    signedData
  );

  if (!valid) {
    throw new HttpError(401, "INVALID_SIGNATURE", "توقيع الرمز غير صالح.");
  }

  return {
    uid: payload.sub,
    email: payload.email || null,
    email_verified: Boolean(payload.email_verified)
  };
}

async function extractAuth(request, env) {
  const authHeader = request.headers.get("Authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  try {
    return await verifyFirebaseToken(match[1].trim(), env.FIREBASE_PROJECT_ID || CONFIG.FIREBASE_PROJECT_ID);
  } catch (e) {
    return null;
  }
}

async function requireAuth(request, env) {
  const authHeader = request.headers.get("Authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new HttpError(401, "UNAUTHORIZED", "يرجى تسجيل الدخول أولاً.");
  }
  return await verifyFirebaseToken(match[1].trim(), env.FIREBASE_PROJECT_ID || CONFIG.FIREBASE_PROJECT_ID);
}

/* ------------------------------ Publisher & User Cache ------------------------------ */

const userCache = new Map();

async function fetchUser(userId, env) {
  if (!userId) return null;
  const now = Date.now();
  const cached = userCache.get(userId);
  if (cached && cached.expiresAt > now) {
    return cached.user;
  }

  // Direct fast-path check if overmods_d1 binding is available
  const userDb = env && (env["overmods_d1"] || env.overmods_d1);
  if (userDb) {
    try {
      const row = await userDb.prepare(`SELECT * FROM users WHERE id = ? LIMIT 1`).bind(userId).first();
      if (row) {
        const u = {
          id: row.id,
          username: row.username,
          displayName: row.displayName,
          email: row.email,
          avatar: row.avatar,
          isVerified: Boolean(row.isVerified),
          role: row.role || "User",
          isAdmin: Boolean(row.isAdmin)
        };
        userCache.set(userId, { user: u, expiresAt: now + 60000 });
        return u;
      }
    } catch (_) {}
  }

  return null;
}

async function isUserAdmin(authContext, env) {
  if (!authContext) return false;
  if (authContext.email && authContext.email.toLowerCase() === CONFIG.ADMIN_EMAIL.toLowerCase()) {
    return true;
  }
  const u = await fetchUser(authContext.uid, env);
  return Boolean(u && (u.role === "Admin" || u.isAdmin === true || (u.email && u.email.toLowerCase() === CONFIG.ADMIN_EMAIL.toLowerCase())));
}

/* ------------------------------ Formatters ------------------------------ */

function formatModRow(row, user) {
  if (!row) return null;
  const raw = parseJsonField(row.raw_data, {});

  return {
    ...raw,
    id: row.id,
    shareCode: row.shareCode || row.id,
    modCode: row.modCode || undefined,
    title: row.title || raw.title || "",
    description: row.description || raw.description || "",
    visibilityLevel: row.visibilityLevel || raw.visibilityLevel || "public",
    publisherId: row.publisherId || raw.publisherId || "",
    publisherName: user ? (user.displayName || user.username || user.id) : (raw.publisherName || "مستخدم"),
    publisherAvatar: user ? (user.avatar || raw.publisherAvatar || "") : (raw.publisherAvatar || ""),
    isVerified: user ? Boolean(user.isVerified) : Boolean(raw.isVerified || raw.verified),
    verified: user ? Boolean(user.isVerified) : Boolean(raw.isVerified || raw.verified),
    type: row.type || raw.type || "Mod",
    category: row.category || raw.category || "عام",
    minecraftVersion: row.minecraftVersion || raw.minecraftVersion || "1.21.x",
    mainImage: row.mainImage || raw.mainImage || "",
    additionalImages: parseJsonField(row.additionalImages, raw.additionalImages || []),
    downloadUrl: row.downloadUrl || raw.downloadUrl || "",
    fileSize: row.fileSize || raw.fileSize || "",
    stats: parseJsonField(row.stats, raw.stats || { views: 0, uniqueViews: 0, downloads: 0, likes: 0, dislikes: 0, averageRating: 0, ratingCount: 0, totalRatingScore: 0 }),
    fakeStats: parseJsonField(row.fakeStats, raw.fakeStats || null),
    comments: parseJsonField(row.comments, raw.comments || []),
    likedBy: parseJsonField(row.likedBy, raw.likedBy || []),
    dislikedBy: parseJsonField(row.dislikedBy, raw.dislikedBy || []),
    ratedBy: parseJsonField(row.ratedBy, raw.ratedBy || {}),
    youtubeUrl: row.youtubeUrl || raw.youtubeUrl || "",
    price: Number(row.price || raw.price || 0),
    platform: row.platform || raw.platform || "Bedrock",
    modLoader: row.modLoader || raw.modLoader || undefined,
    disableAds: Boolean(row.disableAds),
    creatorAdCodes: parseJsonField(row.creatorAdCodes, raw.creatorAdCodes || []),
    monetizationEnabled: Boolean(row.monetizationEnabled),
    monetizationSuspended: Boolean(row.monetizationSuspended),
    monetizationSuspendedReason: row.monetizationSuspendedReason || null,
    monetizationActivatedAt: row.monetizationActivatedAt || null,
    customAdRate: row.customAdRate || null,
    createdAt: row.createdAt || raw.createdAt || new Date().toISOString(),
    updatedAt: row.updatedAt || raw.updatedAt || new Date().toISOString()
  };
}

function formatServerRow(row, user) {
  if (!row) return null;
  const raw = parseJsonField(row.raw_data, {});

  return {
    ...raw,
    id: row.id,
    title: row.title || raw.title || "",
    description: row.description || raw.description || "",
    ip: row.ip || raw.ip || "",
    port: row.port || raw.port || "19132",
    version: row.version || raw.version || "1.21.x",
    type: row.type || raw.type || "Server",
    serverType: row.serverType || raw.serverType || "",
    edition: row.edition || raw.edition || "Bedrock",
    platform: row.platform || raw.platform || "Bedrock",
    category: row.category || raw.category || "سيرفر",
    publisherId: row.publisherId || raw.publisherId || "",
    publisherName: user ? (user.displayName || user.username || user.id) : (raw.publisherName || "مستخدم"),
    publisherAvatar: user ? (user.avatar || raw.publisherAvatar || "") : (raw.publisherAvatar || ""),
    status: row.status || raw.status || "offline",
    isOnline: Boolean(row.isOnline),
    javaStatus: row.javaStatus || raw.javaStatus || "offline",
    bedrockStatus: row.bedrockStatus || raw.bedrockStatus || "offline",
    onlinePlayers: Number(row.onlinePlayers || 0),
    maxPlayers: Number(row.maxPlayers || 0),
    motd: row.motd || raw.motd || "",
    ping: row.ping !== null ? Number(row.ping) : undefined,
    lastChecked: row.lastChecked || undefined,
    createdAt: row.createdAt || raw.createdAt || new Date().toISOString(),
    updatedAt: row.updatedAt || raw.updatedAt || new Date().toISOString()
  };
}

/* ------------------------------ Google Service Account Token (Minting) ------------------------------ */

let googleTokenCache = null;
let googleTokenExpiresAt = 0;

async function getGoogleServiceAccountToken(serviceAccountJson) {
  const now = Math.floor(Date.now() / 1000);
  if (googleTokenCache && now < googleTokenExpiresAt - 60) {
    return googleTokenCache;
  }

  const sa = typeof serviceAccountJson === "string" ? JSON.parse(serviceAccountJson) : serviceAccountJson;
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/identitytoolkit",
    aud: CONFIG.TOKEN_URL,
    exp: now + 3600,
    iat: now
  };

  const encHeader = strToB64url(JSON.stringify(header));
  const encClaim = strToB64url(JSON.stringify(claim));
  const input = `${encHeader}.${encClaim}`;

  const cleanKey = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const binaryKey = atob(cleanKey);
  const keyBytes = new Uint8Array(binaryKey.length);
  for (let i = 0; i < binaryKey.length; i++) keyBytes[i] = binaryKey.charCodeAt(i);

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBytes.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    textEnc.encode(input)
  );

  const assertion = `${input}.${bytesToB64url(new Uint8Array(signature))}`;

  const params = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion
  });

  const res = await fetch(CONFIG.TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google OAuth error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  googleTokenCache = data.access_token;
  googleTokenExpiresAt = now + (data.expires_in || 3600);
  return googleTokenCache;
}

/* ------------------------------ Rate Limiter for Emails ------------------------------ */

const emailRateLimitMap = new Map();

function checkEmailRateLimit(key, cooldownSeconds = 60) {
  const now = Date.now();
  const lastSent = emailRateLimitMap.get(key);
  if (lastSent && now - lastSent < cooldownSeconds * 1000) {
    const remaining = Math.ceil((cooldownSeconds * 1000 - (now - lastSent)) / 1000);
    throw new HttpError(429, "TOO_MANY_REQUESTS", `يرجى الانتظار ${remaining} ثانية قبل طلب إعادة إرسال البريد الإلكتروني.`);
  }
  emailRateLimitMap.set(key, now);
}

/* ------------------------------ Identity Toolkit OOB Codes ------------------------------ */

async function getEmailActionLink(requestType, email, continueUrl, env) {
  const saRaw = env.FIREBASE_SERVICE_ACCOUNT || env.GCP_SERVICE_ACCOUNT;
  const url = `${CONFIG.IDENTITY_TOOLKIT_URL}/${env.FIREBASE_PROJECT_ID || CONFIG.FIREBASE_PROJECT_ID}:getEmailActionLink`;

  let authHeader = "";
  if (saRaw) {
    try {
      const gToken = await getGoogleServiceAccountToken(saRaw);
      authHeader = `Bearer ${gToken}`;
    } catch (e) {
      console.warn("Failed to mint Service Account token, attempting API Key fallback:", e?.message);
    }
  }

  const apiKey = env.FIREBASE_API_KEY || env.FIREBASE_WEB_API_KEY || CONFIG.FIREBASE_API_KEY;
  const finalUrl = authHeader ? url : `${url}?key=${apiKey}`;
  const headers = { "Content-Type": "application/json" };
  if (authHeader) headers["Authorization"] = authHeader;

  const targetContinueUrl = continueUrl || "https://www.overmods.site/verify";

  const res = await fetch(finalUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      requestType,
      email,
      returnOobLink: true,
      continueUrl: targetContinueUrl
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const message = errData?.error?.message || "فشل إنشاء رابط التحقق من البريد.";
    throw new HttpError(400, "EMAIL_LINK_FAILED", message);
  }

  const data = await res.json();
  const rawOobLink = data.oobLink;

  try {
    const parsed = new URL(rawOobLink);
    const modeParam = parsed.searchParams.get("mode") || (requestType === "PASSWORD_RESET" ? "resetPassword" : "verifyEmail");
    const oobCodeParam = parsed.searchParams.get("oobCode");
    const apiKeyParam = parsed.searchParams.get("apiKey") || apiKey;

    if (oobCodeParam) {
      return `https://www.overmods.site/verify?mode=${encodeURIComponent(modeParam)}&oobCode=${encodeURIComponent(oobCodeParam)}&apiKey=${encodeURIComponent(apiKeyParam)}&lang=ar`;
    }
  } catch (e) {
    console.warn("Failed to parse oobLink URL, returning raw OOB link:", e);
  }

  return rawOobLink;
}

/* ------------------------------ Resend Email Dispatcher ------------------------------ */

async function sendEmailViaResend(toEmail, subject, htmlContent, textContent, env) {
  const apiKey = env.RESEND_API || env.RESEND_API_KEY;
  if (!apiKey) {
    throw new HttpError(500, "CONFIG_ERROR", "مفتاح Resend API غير مهيأ (RESEND_API).");
  }

  const payload = {
    from: CONFIG.FROM_EMAIL,
    to: [toEmail],
    subject: subject,
    html: htmlContent,
    ...(textContent ? { text: textContent } : {})
  };

  const res = await fetch(CONFIG.RESEND_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Resend API Error:", errText);
    throw new HttpError(res.status, "EMAIL_SEND_FAILED", `فشل إرسال البريد الإلكتروني عبر Resend.`);
  }

  return await res.json();
}

function buildVerificationEmailTemplate(link, displayName, email) {
  return `
  <!DOCTYPE html>
  <html dir="rtl" lang="ar">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تأكيد عنوان بريدك الإلكتروني - Over Mods</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #f3f4f6; -webkit-font-smoothing: antialiased;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0f19; padding: 40px 16px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; max-width: 600px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <tr>
              <td style="padding: 32px 32px 24px 32px; text-align: center; background: linear-gradient(180deg, rgba(34, 197, 94, 0.12) 0%, rgba(17, 24, 39, 0) 100%); border-bottom: 1px solid #1f2937;">
                <h1 style="color: #22c55e; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Over Mods</h1>
                <p style="color: #9ca3af; margin: 6px 0 0 0; font-size: 14px;">منصة تعديلات وماينكرافت الرائدة</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px 32px 24px 32px;">
                <h2 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">تأكيد عنوان بريدك الإلكتروني</h2>
                <p style="color: #d1d5db; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
                  مرحباً ${displayName || "بك"}، شكرًا لانضمامك إلى مجتمع Over Mods! لتفعيل حسابك بالكامل والاستفادة من جميع الميزات، يرجى تأكيد بريدك الإلكتروني بالضغط على الزر أدناه:
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${link}" target="_blank" style="background-color: #22c55e; color: #000000; text-decoration: none; padding: 15px 36px; border-radius: 12px; font-size: 16px; font-weight: 800; display: inline-block; box-shadow: 0 4px 16px rgba(34, 197, 94, 0.35);">
                    تأكيد البريد الإلكتروني
                  </a>
                </div>
                <div style="background-color: #0d131f; border: 1px solid #1f2937; border-radius: 10px; padding: 16px; margin-top: 24px;">
                  <p style="color: #9ca3af; font-size: 13px; margin: 0 0 8px 0; font-weight: 600;">
                    إذا لم يعمل الزر أعلاه، يمكنك انسخ الرابط التالي وافتحه في متصفحك:
                  </p>
                  <a href="${link}" target="_blank" style="color: #3b82f6; word-break: break-all; font-size: 12px; font-family: monospace;">${link}</a>
                </div>
                <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
                  ⏱ هذا الرابط مؤقت وتنتهي صلاحيته تلقائياً لحماية حسابك.<br>
                  🛡 إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذه الرسالة بأمان.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #090d16; padding: 20px 32px; text-align: center; border-top: 1px solid #1f2937;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">© 2026 Over Mods. جميع الحقوق محفوظة.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

function buildVerificationEmailText(link, displayName) {
  return `مرحباً ${displayName || "بك"}،\n\nشكرًا لانضمامك إلى مجتمع Over Mods!\nلتأكيد بريدك الإلكتروني وتفعيل حسابك بالكامل، يرجى فتح الرابط التالي:\n\n${link}\n\nهذا الرابط مؤقت وتنتهي صلاحيته تلقائياً لحماية حسابك.\nإذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذه الرسالة بأمان.\n\n© 2026 Over Mods. جميع الحقوق محفوظة.`;
}

function buildPasswordResetEmailTemplate(link, email) {
  return `
  <!DOCTYPE html>
  <html dir="rtl" lang="ar">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إعادة تعيين كلمة المرور - Over Mods</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #f3f4f6; -webkit-font-smoothing: antialiased;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0f19; padding: 40px 16px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; max-width: 600px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <tr>
              <td style="padding: 32px 32px 24px 32px; text-align: center; background: linear-gradient(180deg, rgba(239, 68, 68, 0.12) 0%, rgba(17, 24, 39, 0) 100%); border-bottom: 1px solid #1f2937;">
                <h1 style="color: #22c55e; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Over Mods</h1>
                <p style="color: #ef4444; margin: 6px 0 0 0; font-size: 14px; font-weight: 700;">طلب إعادة تعيين كلمة المرور</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px 32px 24px 32px;">
                <h2 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">إعادة تعيين كلمة المرور</h2>
                <p style="color: #d1d5db; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
                  تلقينا طلبًا لإعادة تعيين كلمة المرور لحسابك المرتبط بالبريد الإلكتروني (<strong style="color: #ffffff;">${email}</strong>). لاختيار كلمة مرور جديدة، اضغط على الزر أدناه:
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${link}" target="_blank" style="background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 15px 36px; border-radius: 12px; font-size: 16px; font-weight: 800; display: inline-block; box-shadow: 0 4px 16px rgba(239, 68, 68, 0.35);">
                    إعادة تعيين كلمة المرور
                  </a>
                </div>
                <div style="background-color: #0d131f; border: 1px solid #1f2937; border-radius: 10px; padding: 16px; margin-top: 24px;">
                  <p style="color: #9ca3af; font-size: 13px; margin: 0 0 8px 0; font-weight: 600;">
                    إذا لم يعمل الزر أعلاه، يمكنك انسخ الرابط التالي وافتحه في متصفحك:
                  </p>
                  <a href="${link}" target="_blank" style="color: #3b82f6; word-break: break-all; font-size: 12px; font-family: monospace;">${link}</a>
                </div>
                <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
                  ⏱ هذا الرابط مؤقت وتنتهي صلاحيته تلقائياً لحماية حسابك.<br>
                  🛡 إذا لم تطلب إعادة تعيين كلمة المرور، فيمكنك تجاهل هذا البريد بأمان ولن تتغير كلمة مرورك.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #090d16; padding: 20px 32px; text-align: center; border-top: 1px solid #1f2937;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">© 2026 Over Mods. جميع الحقوق محفوظة.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

function buildPasswordResetEmailText(link, email) {
  return `مرحباً،\n\nتلقينا طلبًا لإعادة تعيين كلمة المرور لحسابك المرتبط بالبريد الإلكتروني (${email}).\nلاختيار كلمة مرور جديدة، يرجى فتح الرابط التالي:\n\n${link}\n\nهذا الرابط مؤقت وتنتهي صلاحيته تلقائياً.\nإذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان.\n\n© 2026 Over Mods. جميع الحقوق محفوظة.`;
}

/* ========================================================================= */
/* ----------------------- MAIN UNIFIED WORKER EXPORT --------------------- */
/* ========================================================================= */

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    try {
      // 1. User Database Binding (users, support, notifications, follows, transactions, config, settings)
      const userDb = env["overmods_d1"] || env.overmods_d1;

      // 2. Content Database Binding strictly for (mods, purchases, servers, game_invites, postActions, reports, private_mod_downloads, community_posts)
      // Accessed via bracket notation to support the exact Cloudflare binding name "overmods-content" (with hyphen)
      const contentDb = env["overmods-content"] || env["overmods_content"] || env.overmods_content;

      // 3. Logs Database Binding strictly for (mod_view_logs, mod_download_logs, post_view_logs)
      const logsDb = env["overmods_logs"] || env.overmods_logs;

      if (!userDb && !contentDb && !logsDb) {
        throw new HttpError(500, "BINDING_MISSING", "لم يتم العثور على قواعد بيانات D1 في Worker (تأكد من وجود overmods_d1 أو overmods-content أو overmods_logs).");
      }

      if (userDb) await ensureUserSchema(userDb);
      if (contentDb) await ensureContentSchema(contentDb);
      if (logsDb) await ensureLogsSchema(logsDb);

      const url = new URL(request.url);
      const path = url.pathname;

      // Enforce strict collection separation: content endpoints require overmods-content
      if (path.startsWith("/content") || path.startsWith("/api/content")) {
        if (!contentDb && !path.includes("record-view") && !path.includes("record-download") && !path.includes("record-post-view")) {
          throw new HttpError(500, "CONTENT_DB_MISSING", "قاعدة بيانات overmods-content غير متصلة بالمتغير 'overmods-content'.");
        }
      }

      // Enforce strict collection separation: user endpoints require overmods_d1
      if (path.startsWith("/d1") || path.startsWith("/auth")) {
        if (!userDb) {
          throw new HttpError(500, "USER_DB_MISSING", "قاعدة بيانات overmods_d1 غير متصلة بالمتغير 'overmods_d1'.");
        }
      }

      // Enforce logs endpoints require overmods_logs
      if (path.startsWith("/logs") || path.startsWith("/api/logs") || path === "/record-view" || path === "/record-download" || path === "/record-post-view" || path === "/content/mods/record-view" || path === "/content/mods/record-download" || path === "/content/posts/record-view") {
        if (!logsDb) {
          throw new HttpError(500, "LOGS_DB_MISSING", "قاعدة بيانات overmods_logs غير متصلة بالمتغير 'overmods_logs' في إعدادات Cloudflare Worker.");
        }
      }

      /* ==================== 1. HEALTH CHECKS ==================== */
      if (path === "/" || path === "/d1/health" || path === "/content/health" || path === "/api/content/health" || path === "/logs/health" || path === "/api/logs/health") {
        return jsonResponse(200, {
          ok: true,
          service: "overmods-unified-d1-worker",
          userDbConnected: Boolean(userDb),
          contentDbConnected: Boolean(contentDb),
          logsDbConnected: Boolean(logsDb),
          bindings: {
            userDb: "overmods_d1",
            contentDb: "overmods-content",
            logsDb: "overmods_logs"
          },
          timestamp: new Date().toISOString()
        }, cors);
      }

      /* ==================== 2. AUTH EMAILS (Resend + Identity Toolkit) ==================== */

      // POST /auth/send-verification-email or /d1/auth/send-verification-email
      if ((path === "/auth/send-verification-email" || path === "/d1/auth/send-verification-email") && request.method === "POST") {
        const body = await readJsonBody(request);
        const { email, displayName, continueUrl } = body;
        if (!email || !email.includes("@")) {
          throw new HttpError(400, "INVALID_EMAIL", "البريد الإلكتروني غير صالح.");
        }

        checkEmailRateLimit(`verify_${email.toLowerCase().trim()}`, 60);

        const targetContinue = continueUrl || "https://www.overmods.site/verify";
        const oobLink = await getEmailActionLink("VERIFY_EMAIL", email.trim(), targetContinue, env);
        const html = buildVerificationEmailTemplate(oobLink, displayName, email.trim());
        const text = buildVerificationEmailText(oobLink, displayName);
        const sendResult = await sendEmailViaResend(email.trim(), "تأكيد عنوان بريدك الإلكتروني - Over Mods", html, text, env);

        return jsonResponse(200, { ok: true, message: "تم إرسال بريد التحقق بنجاح عبر Resend.", id: sendResult.id }, cors);
      }

      // POST /auth/send-password-reset or /d1/auth/send-password-reset
      if ((path === "/auth/send-password-reset" || path === "/d1/auth/send-password-reset") && request.method === "POST") {
        const body = await readJsonBody(request);
        const { email, continueUrl } = body;
        if (!email || !email.includes("@")) {
          throw new HttpError(400, "INVALID_EMAIL", "البريد الإلكتروني غير صالح.");
        }

        checkEmailRateLimit(`reset_${email.toLowerCase().trim()}`, 60);

        const targetContinue = continueUrl || "https://www.overmods.site/verify";
        try {
          const oobLink = await getEmailActionLink("PASSWORD_RESET", email.trim(), targetContinue, env);
          const html = buildPasswordResetEmailTemplate(oobLink, email.trim());
          const text = buildPasswordResetEmailText(oobLink, email.trim());
          const sendResult = await sendEmailViaResend(email.trim(), "إعادة تعيين كلمة المرور - Over Mods", html, text, env);

          return jsonResponse(200, { ok: true, message: "تم إرسال رابط إعادة تعيين كلمة المرور بنجاح.", id: sendResult.id }, cors);
        } catch (err) {
          // Security Requirement #8: Do not reveal whether email exists or not
          if (err instanceof HttpError && err.message && err.message.includes("EMAIL_NOT_FOUND")) {
            return jsonResponse(200, { ok: true, message: "إذا كان البريد الإلكتروني مسجلاً لدينا، فقد تم إرسال رابط إعادة تعيين كلمة المرور." }, cors);
          }
          throw err;
        }
      }

      /* ==================== 3. USERS COLLECTION ==================== */

      // GET /d1/users (Admin only, with pagination & search)
      if (path === "/d1/users" && request.method === "GET") {
        const authCtx = await requireAuth(request, env);
        const admin = await isUserAdmin(authCtx, env);
        if (!admin) {
          throw new HttpError(403, "FORBIDDEN", "غير مصرح لك بعرض قائمة المستخدمين.");
        }

        const limitCount = Math.min(Number(url.searchParams.get("limit")) || 50, 100);
        const offset = Number(url.searchParams.get("offset")) || 0;
        const search = url.searchParams.get("search");

        let q = `SELECT * FROM users`;
        const params = [];
        if (search) {
          q += ` WHERE username LIKE ? OR displayName LIKE ? OR email LIKE ?`;
          const term = `%${search}%`;
          params.push(term, term, term);
        }
        q += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
        params.push(limitCount, offset);

        const rows = await userDb.prepare(q).bind(...params).all();
        const users = (rows.results || []).map(r => ({
          ...parseJsonField(r.raw_data, {}),
          ...r,
          isAdmin: Boolean(r.isAdmin),
          isVerified: Boolean(r.isVerified),
          banned: Boolean(r.banned)
        }));

        return jsonResponse(200, { ok: true, users }, cors);
      }

      // GET /d1/users/:id
      const userGetMatch = path.match(/^\/(?:api\/)?d1\/users\/([^\/]+)$/);
      if (userGetMatch && request.method === "GET") {
        const userId = decodeURIComponent(userGetMatch[1]).trim();
        const authCtx = await extractAuth(request, env);
        const isSelf = authCtx && authCtx.uid === userId;
        const admin = authCtx && await isUserAdmin(authCtx, env);

        const row = await userDb.prepare(`SELECT * FROM users WHERE id = ? LIMIT 1`).bind(userId).first();
        if (!row) {
          throw new HttpError(404, "USER_NOT_FOUND", "المستخدم غير موجود.");
        }

        const raw = parseJsonField(row.raw_data, {});
        const user = {
          ...raw,
          id: row.id,
          email: (isSelf || admin) ? row.email : undefined,
          username: row.username,
          displayName: row.displayName,
          avatar: row.avatar,
          role: row.role,
          isAdmin: Boolean(row.isAdmin),
          isVerified: Boolean(row.isVerified),
          balance: (isSelf || admin) ? Number(row.balance || 0) : undefined,
          status: row.status,
          banned: Boolean(row.banned),
          banReason: (isSelf || admin) ? row.banReason : undefined,
          bio: row.bio,
          socialLinks: parseJsonField(row.socialLinks, raw.socialLinks || {}),
          stats: parseJsonField(row.stats, raw.stats || {}),
          adminPermissions: admin ? parseJsonField(row.adminPermissions, raw.adminPermissions || {}) : undefined,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        };

        return jsonResponse(200, { ok: true, user }, cors);
      }

      // POST /d1/users (Registration / User Creation)
      if (path === "/d1/users" && request.method === "POST") {
        const body = await readJsonBody(request);
        const authCtx = await extractAuth(request, env);

        const id = body.id || (authCtx ? authCtx.uid : null);
        if (!id) {
          throw new HttpError(400, "MISSING_ID", "معرف المستخدم مطلوب.");
        }

        const existing = await userDb.prepare(`SELECT id, username, email FROM users WHERE id = ? OR username = ? OR email = ? LIMIT 1`)
          .bind(id, body.username || "", body.email || "")
          .first();

        if (existing) {
          if (existing.id === id) {
            return jsonResponse(200, { ok: true, message: "المستخدم موجود مسبقًا.", user: existing }, cors);
          }
          if (existing.username === body.username) {
            throw new HttpError(409, "USERNAME_TAKEN", "اسم المستخدم مستخدم بالفعل.");
          }
          if (existing.email === body.email) {
            throw new HttpError(409, "EMAIL_TAKEN", "البريد الإلكتروني مستخدم بالفعل.");
          }
        }

        const now = new Date().toISOString();
        const role = (body.email && body.email.toLowerCase() === CONFIG.ADMIN_EMAIL.toLowerCase()) ? "Admin" : (body.role || "User");
        const isAdmin = role === "Admin" ? 1 : (body.isAdmin ? 1 : 0);

        await userDb.prepare(`
          INSERT INTO users (
            id, email, username, displayName, avatar, role, isAdmin, isVerified,
            balance, status, banned, banReason, bio, socialLinks, stats, adminPermissions,
            raw_data, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          body.email || (authCtx ? authCtx.email : null),
          body.username || id,
          body.displayName || body.username || id,
          body.avatar || "",
          role,
          isAdmin,
          body.isVerified ? 1 : 0,
          Number(body.balance || 0),
          body.status || "active",
          0,
          null,
          body.bio || "",
          JSON.stringify(body.socialLinks || {}),
          JSON.stringify(body.stats || {}),
          JSON.stringify(body.adminPermissions || {}),
          JSON.stringify(body),
          body.createdAt || now,
          now
        ).run();

        userCache.delete(id);
        return jsonResponse(201, { ok: true, message: "تم إنشاء المستخدم بنجاح في D1.", id }, cors);
      }

      // PUT /d1/users/:id (Update Profile)
      if (userGetMatch && request.method === "PUT") {
        const userId = decodeURIComponent(userGetMatch[1]).trim();
        const authCtx = await requireAuth(request, env);
        const admin = await isUserAdmin(authCtx, env);
        if (authCtx.uid !== userId && !admin) {
          throw new HttpError(403, "FORBIDDEN", "غير مصرح لك بتعديل بيانات هذا المستخدم.");
        }

        const body = await readJsonBody(request);
        const existing = await userDb.prepare(`SELECT * FROM users WHERE id = ? LIMIT 1`).bind(userId).first();
        if (!existing) {
          throw new HttpError(404, "USER_NOT_FOUND", "المستخدم غير موجود.");
        }

        if (body.username && body.username !== existing.username) {
          const taken = await userDb.prepare(`SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1`).bind(body.username, userId).first();
          if (taken) throw new HttpError(409, "USERNAME_TAKEN", "اسم المستخدم مستخدم بالفعل.");
        }

        const now = new Date().toISOString();
        const role = admin && body.role ? body.role : existing.role;
        const isAdmin = admin && body.isAdmin !== undefined ? (body.isAdmin ? 1 : 0) : existing.isAdmin;
        const isVerified = admin && body.isVerified !== undefined ? (body.isVerified ? 1 : 0) : existing.isVerified;
        const balance = admin && body.balance !== undefined ? Number(body.balance) : existing.balance;

        const updatedRaw = {
          ...parseJsonField(existing.raw_data, {}),
          ...body,
          id: userId
        };

        await userDb.prepare(`
          UPDATE users SET
            displayName = COALESCE(?, displayName),
            username = COALESCE(?, username),
            avatar = COALESCE(?, avatar),
            bio = COALESCE(?, bio),
            socialLinks = COALESCE(?, socialLinks),
            stats = COALESCE(?, stats),
            role = ?,
            isAdmin = ?,
            isVerified = ?,
            balance = ?,
            status = COALESCE(?, status),
            banned = COALESCE(?, banned),
            banReason = COALESCE(?, banReason),
            raw_data = ?,
            updatedAt = ?
          WHERE id = ?
        `).bind(
          body.displayName || null,
          body.username || null,
          body.avatar || null,
          body.bio || null,
          body.socialLinks ? JSON.stringify(body.socialLinks) : null,
          body.stats ? JSON.stringify(body.stats) : null,
          role,
          isAdmin,
          isVerified,
          balance,
          body.status || null,
          body.banned !== undefined ? (body.banned ? 1 : 0) : null,
          body.banReason || null,
          JSON.stringify(updatedRaw),
          now,
          userId
        ).run();

        userCache.delete(userId);
        return jsonResponse(200, { ok: true, message: "تم تحديث المستخدم بنجاح.", user: updatedRaw }, cors);
      }

      // DELETE /d1/users/:id
      if (userGetMatch && request.method === "DELETE") {
        const userId = decodeURIComponent(userGetMatch[1]).trim();
        const authCtx = await requireAuth(request, env);
        const admin = await isUserAdmin(authCtx, env);
        if (authCtx.uid !== userId && !admin) {
          throw new HttpError(403, "FORBIDDEN", "غير مصرح لك بحذف هذا المستخدم.");
        }

        await userDb.prepare(`DELETE FROM users WHERE id = ?`).bind(userId).run();
        userCache.delete(userId);
        return jsonResponse(200, { ok: true, message: "تم حذف المستخدم بنجاح من D1." }, cors);
      }

      // POST /d1/users/:id/balance
      const userBalanceMatch = path.match(/^\/(?:api\/)?d1\/users\/([^\/]+)\/balance$/);
      if (userBalanceMatch && request.method === "POST") {
        const userId = decodeURIComponent(userBalanceMatch[1]).trim();
        const authCtx = await requireAuth(request, env);
        const admin = await isUserAdmin(authCtx, env);
        if (!admin) {
          throw new HttpError(403, "FORBIDDEN", "الصلاحية مخصصة للمشرفين فقط.");
        }

        const body = await readJsonBody(request);
        const amount = Number(body.amount);
        if (isNaN(amount) || amount === 0) {
          throw new HttpError(400, "INVALID_AMOUNT", "المبلغ غير صالح.");
        }

        const user = await userDb.prepare(`SELECT balance FROM users WHERE id = ? LIMIT 1`).bind(userId).first();
        if (!user) throw new HttpError(404, "USER_NOT_FOUND", "المستخدم غير موجود.");

        const newBalance = Math.max(0, Number(user.balance || 0) + amount);
        await userDb.prepare(`UPDATE users SET balance = ?, updatedAt = ? WHERE id = ?`)
          .bind(newBalance, new Date().toISOString(), userId)
          .run();

        userCache.delete(userId);
        return jsonResponse(200, { ok: true, newBalance }, cors);
      }

      /* ==================== 4. SUPPORT COLLECTION ==================== */

      // GET /d1/support
      if (path === "/d1/support" && request.method === "GET") {
        const authCtx = await requireAuth(request, env);
        const admin = await isUserAdmin(authCtx, env);
        const userId = url.searchParams.get("userId") || (admin ? null : authCtx.uid);

        let q = `SELECT * FROM support`;
        const params = [];
        if (userId) {
          q += ` WHERE userId = ?`;
          params.push(userId);
        }
        q += ` ORDER BY createdAt DESC LIMIT 100`;

        const rows = await userDb.prepare(q).bind(...params).all();
        return jsonResponse(200, { ok: true, support: rows.results || [] }, cors);
      }

      // POST /d1/support (Create report or inquiry from Settings)
      if (path === "/d1/support" && request.method === "POST") {
        const body = await readJsonBody(request);
        const authCtx = await extractAuth(request, env);

        const id = body.id || `sup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const userId = authCtx ? authCtx.uid : (body.userId || "anonymous");
        const now = new Date().toISOString();

        await userDb.prepare(`
          INSERT INTO support (
            id, userId, email, username, subject, message, category, status, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)
        `).bind(
          id,
          userId,
          body.email || (authCtx ? authCtx.email : null),
          body.username || "مستخدم",
          body.subject || "بلاغ / استفسار",
          body.message || "",
          body.category || "general",
          now,
          now
        ).run();

        return jsonResponse(201, { ok: true, message: "تم إرسال البلاغ بنجاح إلى فريق الدعم.", id }, cors);
      }

      // PUT /d1/support/:id (Reply or close)
      const supportIdMatch = path.match(/^\/(?:api\/)?d1\/support\/([^\/]+)$/);
      if (supportIdMatch && request.method === "PUT") {
        const id = decodeURIComponent(supportIdMatch[1]).trim();
        const authCtx = await requireAuth(request, env);
        const admin = await isUserAdmin(authCtx, env);
        if (!admin) {
          throw new HttpError(403, "FORBIDDEN", "الرد على البلاغات مخصص للإدارة فقط.");
        }

        const body = await readJsonBody(request);
        const now = new Date().toISOString();

        await userDb.prepare(`
          UPDATE support SET
            status = COALESCE(?, status),
            adminReply = COALESCE(?, adminReply),
            repliedAt = ?,
            repliedBy = ?,
            updatedAt = ?
          WHERE id = ?
        `).bind(
          body.status || null,
          body.adminReply || null,
          now,
          authCtx.uid,
          now,
          id
        ).run();

        return jsonResponse(200, { ok: true, message: "تم تحديث البلاغ بنجاح." }, cors);
      }

      // DELETE /d1/support/:id
      if (supportIdMatch && request.method === "DELETE") {
        const id = decodeURIComponent(supportIdMatch[1]).trim();
        const authCtx = await requireAuth(request, env);
        const admin = await isUserAdmin(authCtx, env);
        if (!admin) throw new HttpError(403, "FORBIDDEN", "حذف البلاغات مخصص للإدارة فقط.");

        await userDb.prepare(`DELETE FROM support WHERE id = ?`).bind(id).run();
        return jsonResponse(200, { ok: true, message: "تم حذف البلاغ بنجاح." }, cors);
      }

      /* ==================== 5. NOTIFICATIONS COLLECTION ==================== */

      // GET /d1/notifications
      if (path === "/d1/notifications" && request.method === "GET") {
        const authCtx = await requireAuth(request, env);
        const limitCount = Math.min(Number(url.searchParams.get("limit")) || 30, 100);

        const rows = await userDb.prepare(`
          SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT ?
        `).bind(authCtx.uid, limitCount).all();

        const notifications = (rows.results || []).map(r => ({
          ...r,
          read: Boolean(r.read)
        }));

        return jsonResponse(200, { ok: true, notifications }, cors);
      }

      // POST /d1/notifications
      if (path === "/d1/notifications" && request.method === "POST") {
        const body = await readJsonBody(request);
        const id = body.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const now = body.createdAt || new Date().toISOString();

        await userDb.prepare(`
          INSERT INTO notifications (
            id, userId, actorId, actorName, actorAvatar, type, title, message, link, targetId, read, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
        `).bind(
          id,
          body.userId,
          body.actorId || null,
          body.actorName || null,
          body.actorAvatar || null,
          body.type || "system",
          body.title || "",
          body.message || "",
          body.link || null,
          body.targetId || null,
          now
        ).run();

        return jsonResponse(201, { ok: true, id }, cors);
      }

      // PUT /d1/notifications/:id/read
      const notifReadMatch = path.match(/^\/(?:api\/)?d1\/notifications\/([^\/]+)\/read$/);
      if (notifReadMatch && request.method === "PUT") {
        const id = decodeURIComponent(notifReadMatch[1]).trim();
        const authCtx = await requireAuth(request, env);

        await userDb.prepare(`UPDATE notifications SET read = 1 WHERE id = ? AND userId = ?`)
          .bind(id, authCtx.uid)
          .run();

        return jsonResponse(200, { ok: true }, cors);
      }

      // POST /d1/notifications/read-all
      if (path === "/d1/notifications/read-all" && request.method === "POST") {
        const authCtx = await requireAuth(request, env);
        await userDb.prepare(`UPDATE notifications SET read = 1 WHERE userId = ?`).bind(authCtx.uid).run();
        return jsonResponse(200, { ok: true }, cors);
      }

      // DELETE /d1/notifications/:id
      const notifDeleteMatch = path.match(/^\/(?:api\/)?d1\/notifications\/([^\/]+)$/);
      if (notifDeleteMatch && request.method === "DELETE") {
        const id = decodeURIComponent(notifDeleteMatch[1]).trim();
        const authCtx = await requireAuth(request, env);
        await userDb.prepare(`DELETE FROM notifications WHERE id = ? AND userId = ?`).bind(id, authCtx.uid).run();
        return jsonResponse(200, { ok: true }, cors);
      }

      // DELETE /d1/notifications (Clear all)
      if (path === "/d1/notifications" && request.method === "DELETE") {
        const authCtx = await requireAuth(request, env);
        await userDb.prepare(`DELETE FROM notifications WHERE userId = ?`).bind(authCtx.uid).run();
        return jsonResponse(200, { ok: true }, cors);
      }

      /* ==================== 6. FOLLOWS COLLECTION ==================== */

      // GET /d1/follows/check
      if (path === "/d1/follows/check" && request.method === "GET") {
        const authCtx = await requireAuth(request, env);
        const targetUserId = url.searchParams.get("targetUserId");
        if (!targetUserId) throw new HttpError(400, "MISSING_TARGET", "معرف المستخدم المستهدف مطلوب.");

        const row = await userDb.prepare(`SELECT id FROM follows WHERE followerId = ? AND followingId = ? LIMIT 1`)
          .bind(authCtx.uid, targetUserId)
          .first();

        return jsonResponse(200, { ok: true, isFollowing: Boolean(row) }, cors);
      }

      // POST /d1/follows
      if (path === "/d1/follows" && request.method === "POST") {
        const authCtx = await requireAuth(request, env);
        const body = await readJsonBody(request);
        const targetUserId = body.targetUserId;
        if (!targetUserId) throw new HttpError(400, "MISSING_TARGET", "معرف المستخدم المستهدف مطلوب.");
        if (targetUserId === authCtx.uid) throw new HttpError(400, "CANNOT_FOLLOW_SELF", "لا يمكنك متابعة نفسك.");

        const id = `fol_${authCtx.uid}_${targetUserId}`;
        const now = new Date().toISOString();

        await userDb.prepare(`
          INSERT INTO follows (id, followerId, followingId, createdAt)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(followerId, followingId) DO NOTHING;
        `).bind(id, authCtx.uid, targetUserId, now).run();

        return jsonResponse(200, { ok: true, isFollowing: true }, cors);
      }

      // DELETE /d1/follows
      if (path === "/d1/follows" && request.method === "DELETE") {
        const authCtx = await requireAuth(request, env);
        const body = await readJsonBody(request);
        const targetUserId = body.targetUserId || url.searchParams.get("targetUserId");
        if (!targetUserId) throw new HttpError(400, "MISSING_TARGET", "معرف المستخدم المستهدف مطلوب.");

        await userDb.prepare(`DELETE FROM follows WHERE followerId = ? AND followingId = ?`)
          .bind(authCtx.uid, targetUserId)
          .run();

        return jsonResponse(200, { ok: true, isFollowing: false }, cors);
      }

      // GET /d1/follows/followers
      if (path === "/d1/follows/followers" && request.method === "GET") {
        const targetUserId = url.searchParams.get("userId");
        if (!targetUserId) throw new HttpError(400, "MISSING_USER_ID", "معرف المستخدم مطلوب.");

        const rows = await userDb.prepare(`SELECT followerId, createdAt FROM follows WHERE followingId = ? ORDER BY createdAt DESC`)
          .bind(targetUserId)
          .all();

        return jsonResponse(200, { ok: true, followers: rows.results || [] }, cors);
      }

      // GET /d1/follows/following
      if (path === "/d1/follows/following" && request.method === "GET") {
        const targetUserId = url.searchParams.get("userId");
        if (!targetUserId) throw new HttpError(400, "MISSING_USER_ID", "معرف المستخدم مطلوب.");

        const rows = await userDb.prepare(`SELECT followingId, createdAt FROM follows WHERE followerId = ? ORDER BY createdAt DESC`)
          .bind(targetUserId)
          .all();

        return jsonResponse(200, { ok: true, following: rows.results || [] }, cors);
      }

      /* ==================== 7. TRANSACTIONS COLLECTION ==================== */

      // GET /d1/transactions
      if (path === "/d1/transactions" && request.method === "GET") {
        const authCtx = await requireAuth(request, env);
        const admin = await isUserAdmin(authCtx, env);
        const userId = url.searchParams.get("userId") || (admin ? null : authCtx.uid);

        let q = `SELECT * FROM transactions`;
        const params = [];
        if (userId) {
          q += ` WHERE userId = ?`;
          params.push(userId);
        }
        q += ` ORDER BY createdAt DESC LIMIT 50`;

        const rows = await userDb.prepare(q).bind(...params).all();
        return jsonResponse(200, { ok: true, transactions: rows.results || [] }, cors);
      }

      // POST /d1/transactions
      if (path === "/d1/transactions" && request.method === "POST") {
        const body = await readJsonBody(request);
        const authCtx = await requireAuth(request, env);
        const admin = await isUserAdmin(authCtx, env);

        const targetUserId = body.userId || authCtx.uid;
        if (targetUserId !== authCtx.uid && !admin) {
          throw new HttpError(403, "FORBIDDEN", "غير مصرح لك بإضافة معاملات لمستخدم آخر.");
        }

        const id = body.id || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const now = body.createdAt || new Date().toISOString();

        await userDb.prepare(`
          INSERT INTO transactions (id, userId, type, amount, description, status, referenceId, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          targetUserId,
          body.type || "purchase",
          Number(body.amount || 0),
          body.description || "",
          body.status || "completed",
          body.referenceId || null,
          now
        ).run();

        return jsonResponse(201, { ok: true, id }, cors);
      }

      /* ==================== 8. APP_CONFIG & APP_SETTINGS ==================== */

      const configMatch = path.match(/^\/(?:api\/)?d1\/app_config\/([^\/]+)$/);
      if (configMatch && request.method === "GET") {
        const key = decodeURIComponent(configMatch[1]).trim();
        const row = await userDb.prepare(`SELECT * FROM app_config WHERE id = ? OR configKey = ? LIMIT 1`).bind(key, key).first();
        let value = null;
        if (row) {
          try { value = JSON.parse(row.configValue); } catch (_) { value = row.configValue; }
        }
        return jsonResponse(200, { ok: true, key, value }, cors);
      }

      if (configMatch && request.method === "PUT") {
        const key = decodeURIComponent(configMatch[1]).trim();
        const body = await readJsonBody(request);
        const valStr = typeof body.value === "object" ? JSON.stringify(body.value) : JSON.stringify(body);
        const now = new Date().toISOString();

        await userDb.prepare(`
          INSERT INTO app_config (id, configKey, configValue, updatedAt)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET configValue = excluded.configValue, updatedAt = excluded.updatedAt;
        `).bind(key, key, valStr, now).run();

        return jsonResponse(200, { ok: true, key, value: body }, cors);
      }

      const settingsMatch = path.match(/^\/(?:api\/)?d1\/app_settings\/([^\/]+)$/);
      if (settingsMatch && request.method === "GET") {
        const key = decodeURIComponent(settingsMatch[1]).trim();
        const row = await userDb.prepare(`SELECT * FROM app_settings WHERE id = ? OR settingKey = ? LIMIT 1`).bind(key, key).first();
        let value = null;
        if (row) {
          try { value = JSON.parse(row.settingValue); } catch (_) { value = row.settingValue; }
        }
        return jsonResponse(200, { ok: true, key, value }, cors);
      }

      if (settingsMatch && request.method === "PUT") {
        const key = decodeURIComponent(settingsMatch[1]).trim();
        const body = await readJsonBody(request);
        const valStr = typeof body.value === "object" ? JSON.stringify(body.value) : JSON.stringify(body);
        const now = new Date().toISOString();

        await userDb.prepare(`
          INSERT INTO app_settings (id, settingKey, settingValue, updatedAt)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET settingValue = excluded.settingValue, updatedAt = excluded.updatedAt;
        `).bind(key, key, valStr, now).run();

        return jsonResponse(200, { ok: true, key, value: body }, cors);
      }

      /* ========================================================================= */
      /* ==================== PART 2: CONTENT SERVICES =========================== */
      /* ========================================================================= */

      /* ==================== 9. MODS COLLECTION ==================== */

      // GET /content/mods (List & Search)
      if ((path === "/content/mods" || path === "/api/content/mods") && request.method === "GET") {
        const publisherId = url.searchParams.get("publisherId");
        const category = url.searchParams.get("category");
        const type = url.searchParams.get("type");
        const search = url.searchParams.get("search");
        const visibility = url.searchParams.get("visibility") || "public";
        const limitCount = Math.min(Number(url.searchParams.get("limit")) || 30, 200);
        const offset = Number(url.searchParams.get("offset")) || 0;

        let query = `SELECT * FROM mods WHERE 1=1`;
        const params = [];

        if (publisherId) {
          query += ` AND publisherId = ?`;
          params.push(publisherId);
        }
        if (category && category !== "All" && category !== "الكل") {
          query += ` AND category = ?`;
          params.push(category);
        }
        if (type && type !== "All" && type !== "الكل") {
          query += ` AND type = ?`;
          params.push(type);
        }
        if (visibility && visibility !== "all") {
          query += ` AND (visibilityLevel = ? OR visibilityLevel IS NULL)`;
          params.push(visibility);
        }
        if (search) {
          query += ` AND (title LIKE ? OR description LIKE ? OR shareCode = ? OR modCode = ?)`;
          const term = `%${search}%`;
          params.push(term, term, search, search);
        }

        query += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
        params.push(limitCount, offset);

        const rows = await contentDb.prepare(query).bind(...params).all();
        const publisherIds = Array.from(new Set((rows.results || []).map(r => r.publisherId).filter(Boolean)));
        const usersMap = {};
        await Promise.all(
          publisherIds.map(async (uid) => {
            const u = await fetchUser(uid, env);
            if (u) usersMap[uid] = u;
          })
        );

        const mods = (rows.results || []).map(row => formatModRow(row, usersMap[row.publisherId]));
        return jsonResponse(200, { ok: true, count: mods.length, mods }, cors);
      }

      // GET /content/mods/check-duplicate
      if ((path === "/content/mods/check-duplicate" || path === "/api/content/mods/check-duplicate") && request.method === "GET") {
        const downloadUrl = url.searchParams.get("url");
        const currentId = url.searchParams.get("currentId");
        if (!downloadUrl) throw new HttpError(400, "MISSING_URL", "الرابط مطلوب.");

        let q = `SELECT id, title FROM mods WHERE downloadUrl = ?`;
        const params = [downloadUrl.trim()];
        if (currentId) {
          q += ` AND id != ?`;
          params.push(currentId);
        }
        q += ` LIMIT 1`;

        const row = await contentDb.prepare(q).bind(...params).first();
        return jsonResponse(200, { ok: true, exists: Boolean(row), mod: row || null }, cors);
      }

      // GET /content/mods/:id
      const modIdMatch = path.match(/^\/(?:api\/)?content\/mods\/([^\/]+)$/);
      if (modIdMatch && request.method === "GET") {
        const id = decodeURIComponent(modIdMatch[1]).trim();
        const row = await contentDb.prepare(`SELECT * FROM mods WHERE id = ? OR shareCode = ? OR modCode = ? LIMIT 1`)
          .bind(id, id, id)
          .first();

        if (!row) {
          throw new HttpError(404, "MOD_NOT_FOUND", "المود غير موجود.");
        }

        const user = await fetchUser(row.publisherId, env);
        const mod = formatModRow(row, user);
        return jsonResponse(200, { ok: true, mod }, cors);
      }

      // POST /content/mods (Create / Publish Mod)
      if ((path === "/content/mods" || path === "/api/content/mods") && request.method === "POST") {
        const authCtx = await requireAuth(request, env);
        const body = await readJsonBody(request);

        const id = body.id || `mod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const now = body.createdAt || new Date().toISOString();
        const publisherId = authCtx.uid;
        const user = await fetchUser(publisherId, env);

        const existing = await contentDb.prepare(`SELECT id FROM mods WHERE id = ? LIMIT 1`).bind(id).first();
        if (existing) {
          throw new HttpError(409, "MOD_EXISTS", "معرف المود موجود بالفعل.");
        }

        const rawData = {
          ...body,
          id,
          publisherId,
          publisherName: user?.displayName || user?.username || body.publisherName || "مستخدم",
          publisherAvatar: user?.avatar || body.publisherAvatar || "",
          isVerified: Boolean(user?.isVerified),
          createdAt: now,
          updatedAt: now
        };

        await contentDb.prepare(`
          INSERT INTO mods (
            id, shareCode, modCode, title, description, visibilityLevel,
            publisherId, type, category, minecraftVersion, mainImage,
            additionalImages, downloadUrl, fileSize, stats, fakeStats,
            comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
            platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
            monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
            customAdRate, raw_data, createdAt, updatedAt
          ) VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?, ?
          )
        `).bind(
          id,
          body.shareCode || id,
          body.modCode || null,
          body.title || "مود بدون عنوان",
          body.description || "",
          body.visibilityLevel || "public",
          publisherId,
          body.type || "Mod",
          body.category || "عام",
          body.minecraftVersion || "1.21.x",
          body.mainImage || "",
          JSON.stringify(body.additionalImages || []),
          body.downloadUrl || "",
          body.fileSize || "0MB",
          JSON.stringify(body.stats || { views: 0, uniqueViews: 0, downloads: 0, likes: 0, dislikes: 0, averageRating: 0, ratingCount: 0, totalRatingScore: 0 }),
          body.fakeStats ? JSON.stringify(body.fakeStats) : null,
          JSON.stringify(body.comments || []),
          JSON.stringify(body.likedBy || []),
          JSON.stringify(body.dislikedBy || []),
          JSON.stringify(body.ratedBy || {}),
          body.youtubeUrl || "",
          Number(body.price || 0),
          body.platform || "Bedrock",
          body.modLoader || null,
          body.disableAds ? 1 : 0,
          JSON.stringify(body.creatorAdCodes || []),
          body.monetizationEnabled ? 1 : 0,
          body.monetizationSuspended ? 1 : 0,
          body.monetizationSuspendedReason || null,
          body.monetizationActivatedAt || null,
          body.customAdRate || null,
          JSON.stringify(rawData),
          now,
          now
        ).run();

        return jsonResponse(201, { ok: true, message: "تم نشر المود بنجاح في D1.", id, mod: rawData }, cors);
      }

      // PUT /content/mods/:id (Update Mod)
      if (modIdMatch && request.method === "PUT") {
        const id = decodeURIComponent(modIdMatch[1]).trim();
        const authCtx = await extractAuth(request, env);
        const body = await readJsonBody(request);

        const existing = await contentDb.prepare(`SELECT * FROM mods WHERE id = ? LIMIT 1`).bind(id).first();
        if (!existing) {
          throw new HttpError(404, "MOD_NOT_FOUND", "المود غير موجود.");
        }

        const isOwner = authCtx && authCtx.uid === existing.publisherId;
        const admin = authCtx && await isUserAdmin(authCtx, env);
        const isInternalService = !authCtx && (body.stats !== undefined || body.fakeStats !== undefined);

        if (!isOwner && !admin && !isInternalService) {
          throw new HttpError(403, "FORBIDDEN", "غير مصرح لك بتعديل هذا المود.");
        }

        const now = new Date().toISOString();
        const existingRaw = parseJsonField(existing.raw_data, {});
        const updatedRaw = {
          ...existingRaw,
          ...body,
          id
        };

        await contentDb.prepare(`
          UPDATE mods SET
            title = COALESCE(?, title),
            description = COALESCE(?, description),
            visibilityLevel = COALESCE(?, visibilityLevel),
            category = COALESCE(?, category),
            type = COALESCE(?, type),
            minecraftVersion = COALESCE(?, minecraftVersion),
            mainImage = COALESCE(?, mainImage),
            additionalImages = COALESCE(?, additionalImages),
            downloadUrl = COALESCE(?, downloadUrl),
            fileSize = COALESCE(?, fileSize),
            stats = COALESCE(?, stats),
            fakeStats = COALESCE(?, fakeStats),
            comments = COALESCE(?, comments),
            likedBy = COALESCE(?, likedBy),
            dislikedBy = COALESCE(?, dislikedBy),
            youtubeUrl = COALESCE(?, youtubeUrl),
            price = COALESCE(?, price),
            platform = COALESCE(?, platform),
            disableAds = COALESCE(?, disableAds),
            raw_data = ?,
            updatedAt = ?
          WHERE id = ?
        `).bind(
          body.title || null,
          body.description || null,
          body.visibilityLevel || null,
          body.category || null,
          body.type || null,
          body.minecraftVersion || null,
          body.mainImage || null,
          body.additionalImages ? JSON.stringify(body.additionalImages) : null,
          body.downloadUrl || null,
          body.fileSize || null,
          body.stats ? JSON.stringify(body.stats) : null,
          body.fakeStats ? JSON.stringify(body.fakeStats) : null,
          body.comments ? JSON.stringify(body.comments) : null,
          body.likedBy ? JSON.stringify(body.likedBy) : null,
          body.dislikedBy ? JSON.stringify(body.dislikedBy) : null,
          body.youtubeUrl || null,
          body.price !== undefined ? Number(body.price) : null,
          body.platform || null,
          body.disableAds !== undefined ? (body.disableAds ? 1 : 0) : null,
          JSON.stringify(updatedRaw),
          now,
          id
        ).run();

        const user = await fetchUser(existing.publisherId, env);
        return jsonResponse(200, { ok: true, message: "تم تحديث المود بنجاح.", mod: formatModRow({ ...existing, ...body, raw_data: JSON.stringify(updatedRaw) }, user) }, cors);
      }

      // DELETE /content/mods/:id
      if (modIdMatch && request.method === "DELETE") {
        const id = decodeURIComponent(modIdMatch[1]).trim();
        const authCtx = await requireAuth(request, env);
        const existing = await contentDb.prepare(`SELECT publisherId FROM mods WHERE id = ? LIMIT 1`).bind(id).first();
        if (!existing) throw new HttpError(404, "MOD_NOT_FOUND", "المود غير موجود.");

        const isOwner = authCtx.uid === existing.publisherId;
        const admin = await isUserAdmin(authCtx, env);
        if (!isOwner && !admin) {
          throw new HttpError(403, "FORBIDDEN", "غير مصرح لك بحذف هذا المود.");
        }

        await contentDb.prepare(`DELETE FROM mods WHERE id = ?`).bind(id).run();
        await contentDb.prepare(`DELETE FROM postActions WHERE postId = ?`).bind(id).run();
        await contentDb.prepare(`DELETE FROM private_mod_downloads WHERE modId = ?`).bind(id).run();

        return jsonResponse(200, { ok: true, message: "تم حذف المود بنجاح من D1." }, cors);
      }

      // POST /content/mods/:id/comments
      const modCommentMatch = path.match(/^\/(?:api\/)?content\/mods\/([^\/]+)\/comments$/);
      if (modCommentMatch && request.method === "POST") {
        const id = decodeURIComponent(modCommentMatch[1]).trim();
        const authCtx = await requireAuth(request, env);
        const body = await readJsonBody(request);

        const mod = await contentDb.prepare(`SELECT comments, stats, raw_data FROM mods WHERE id = ? LIMIT 1`).bind(id).first();
        if (!mod) throw new HttpError(404, "MOD_NOT_FOUND", "المود غير موجود.");

        const comments = parseJsonField(mod.comments, []);
        const stats = parseJsonField(mod.stats, { views: 0, downloads: 0, likes: 0, dislikes: 0, commentsCount: 0 });

        const user = await fetchUser(authCtx.uid, env);
        const newComment = {
          id: body.id || `c_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          userId: authCtx.uid,
          userName: user?.displayName || user?.username || body.userName || "مستخدم",
          userAvatar: user?.avatar || body.userAvatar || "",
          text: body.text || "",
          createdAt: body.createdAt || new Date().toISOString()
        };

        comments.push(newComment);
        stats.commentsCount = (stats.commentsCount || 0) + 1;

        await contentDb.prepare(`UPDATE mods SET comments = ?, stats = ?, updatedAt = ? WHERE id = ?`)
          .bind(JSON.stringify(comments), JSON.stringify(stats), new Date().toISOString(), id)
          .run();

        return jsonResponse(201, { ok: true, comment: newComment }, cors);
      }

      // POST /content/mods/:id/rate
      const modRateMatch = path.match(/^\/(?:api\/)?content\/mods\/([^\/]+)\/rate$/);
      if (modRateMatch && request.method === "POST") {
        const id = decodeURIComponent(modRateMatch[1]).trim();
        const authCtx = await requireAuth(request, env);
        const body = await readJsonBody(request);
        const rating = Number(body.rating);

        if (isNaN(rating) || rating < 1 || rating > 5) {
          throw new HttpError(400, "INVALID_RATING", "التقييم يجب أن يكون بين 1 و 5.");
        }

        const mod = await contentDb.prepare(`SELECT ratedBy, stats FROM mods WHERE id = ? LIMIT 1`).bind(id).first();
        if (!mod) throw new HttpError(404, "MOD_NOT_FOUND", "المود غير موجود.");

        const ratedBy = parseJsonField(mod.ratedBy, {});
        const stats = parseJsonField(mod.stats, { averageRating: 0, ratingCount: 0, totalRatingScore: 0 });

        const oldRating = ratedBy[authCtx.uid] || 0;
        ratedBy[authCtx.uid] = rating;

        let totalScore = stats.totalRatingScore || 0;
        let count = stats.ratingCount || 0;

        if (oldRating > 0) {
          totalScore = totalScore - oldRating + rating;
        } else {
          totalScore += rating;
          count += 1;
        }

        stats.totalRatingScore = totalScore;
        stats.ratingCount = count;
        stats.averageRating = count > 0 ? Number((totalScore / count).toFixed(1)) : 0;

        await contentDb.prepare(`UPDATE mods SET ratedBy = ?, stats = ?, updatedAt = ? WHERE id = ?`)
          .bind(JSON.stringify(ratedBy), JSON.stringify(stats), new Date().toISOString(), id)
          .run();

        return jsonResponse(200, { ok: true, averageRating: stats.averageRating, ratingCount: stats.ratingCount }, cors);
      }

      /* ==================== 10. PURCHASES COLLECTION ==================== */

      // GET /content/purchases
      if ((path === "/content/purchases" || path === "/api/content/purchases") && request.method === "GET") {
        const authCtx = await requireAuth(request, env);
        const admin = await isUserAdmin(authCtx, env);
        const userId = url.searchParams.get("userId") || (admin ? null : authCtx.uid);

        let q = `SELECT * FROM purchases`;
        const params = [];
        if (userId) {
          q += ` WHERE userId = ?`;
          params.push(userId);
        }
        q += ` ORDER BY createdAt DESC LIMIT 100`;

        const rows = await contentDb.prepare(q).bind(...params).all();
        return jsonResponse(200, { ok: true, purchases: rows.results || [] }, cors);
      }

      // GET /content/purchases/check
      if ((path === "/content/purchases/check" || path === "/api/content/purchases/check") && request.method === "GET") {
        const userId = url.searchParams.get("userId");
        const modId = url.searchParams.get("modId");
        if (!userId || !modId) throw new HttpError(400, "MISSING_PARAMS", "userId و modId مطلوبان.");

        const row = await contentDb.prepare(`SELECT id FROM purchases WHERE userId = ? AND modId = ? LIMIT 1`)
          .bind(userId, modId)
          .first();

        return jsonResponse(200, { ok: true, hasPurchased: Boolean(row) }, cors);
      }

      // POST /content/purchases
      if ((path === "/content/purchases" || path === "/api/content/purchases") && request.method === "POST") {
        const authCtx = await requireAuth(request, env);
        const body = await readJsonBody(request);

        const id = body.id || `pur_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const userId = authCtx.uid;
        const now = body.createdAt || new Date().toISOString();

        await contentDb.prepare(`
          INSERT INTO purchases (id, userId, modId, publisherId, amount, type, status, metadata, raw_data, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          userId,
          body.modId,
          body.publisherId || "",
          Number(body.amount || 0),
          body.type || "purchase",
          body.status || "completed",
          JSON.stringify(body.metadata || {}),
          JSON.stringify(body),
          now
        ).run();

        return jsonResponse(201, { ok: true, id }, cors);
      }

      /* ==================== 11. SERVERS COLLECTION ==================== */

      // GET /content/servers
      if ((path === "/content/servers" || path === "/api/content/servers") && request.method === "GET") {
        const publisherId = url.searchParams.get("publisherId");
        const limitCount = Math.min(Number(url.searchParams.get("limit")) || 50, 100);

        let q = `SELECT * FROM servers`;
        const params = [];
        if (publisherId) {
          q += ` WHERE publisherId = ?`;
          params.push(publisherId);
        }
        q += ` ORDER BY createdAt DESC LIMIT ?`;
        params.push(limitCount);

        const rows = await contentDb.prepare(q).bind(...params).all();
        const publisherIds = Array.from(new Set((rows.results || []).map(r => r.publisherId).filter(Boolean)));
        const usersMap = {};
        await Promise.all(
          publisherIds.map(async (uid) => {
            const u = await fetchUser(uid, env);
            if (u) usersMap[uid] = u;
          })
        );

        const servers = (rows.results || []).map(row => formatServerRow(row, usersMap[row.publisherId]));
        return jsonResponse(200, { ok: true, servers }, cors);
      }

      // GET /content/servers/:id
      const serverIdMatch = path.match(/^\/(?:api\/)?content\/servers\/([^\/]+)$/);
      if (serverIdMatch && request.method === "GET") {
        const id = decodeURIComponent(serverIdMatch[1]).trim();
        const row = await contentDb.prepare(`SELECT * FROM servers WHERE id = ? LIMIT 1`).bind(id).first();
        if (!row) throw new HttpError(404, "SERVER_NOT_FOUND", "السيرفر غير موجود.");

        const user = await fetchUser(row.publisherId, env);
        return jsonResponse(200, { ok: true, server: formatServerRow(row, user) }, cors);
      }

      // POST /content/servers
      if ((path === "/content/servers" || path === "/api/content/servers") && request.method === "POST") {
        const authCtx = await requireAuth(request, env);
        const body = await readJsonBody(request);

        const id = body.id || `srv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const now = body.createdAt || new Date().toISOString();
        const publisherId = authCtx.uid;
        const user = await fetchUser(publisherId, env);

        const rawData = {
          ...body,
          id,
          publisherId,
          publisherName: user?.displayName || user?.username || body.publisherName || "مستخدم",
          publisherAvatar: user?.avatar || body.publisherAvatar || "",
          createdAt: now,
          updatedAt: now
        };

        await contentDb.prepare(`
          INSERT INTO servers (
            id, title, description, ip, port, version, type, serverType,
            edition, platform, category, publisherId, status, isOnline,
            javaStatus, bedrockStatus, onlinePlayers, maxPlayers, motd, ping,
            lastChecked, raw_data, createdAt, updatedAt
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?
          )
        `).bind(
          id,
          body.title || "سيرفر ماينكرافت",
          body.description || "",
          body.ip || "",
          body.port || "19132",
          body.version || "1.21.x",
          body.type || "Server",
          body.serverType || "Survival",
          body.edition || "Bedrock",
          body.platform || "Bedrock",
          body.category || "سيرفر",
          publisherId,
          body.status || "offline",
          body.isOnline ? 1 : 0,
          body.javaStatus || "offline",
          body.bedrockStatus || "offline",
          Number(body.onlinePlayers || 0),
          Number(body.maxPlayers || 0),
          body.motd || "",
          body.ping !== undefined ? Number(body.ping) : null,
          body.lastChecked || null,
          JSON.stringify(rawData),
          now,
          now
        ).run();

        return jsonResponse(201, { ok: true, id, server: rawData }, cors);
      }

      // PUT /content/servers/:id
      if (serverIdMatch && request.method === "PUT") {
        const id = decodeURIComponent(serverIdMatch[1]).trim();
        const body = await readJsonBody(request);
        const authCtx = await extractAuth(request, env);

        const existing = await contentDb.prepare(`SELECT * FROM servers WHERE id = ? LIMIT 1`).bind(id).first();
        if (!existing) throw new HttpError(404, "SERVER_NOT_FOUND", "السيرفر غير موجود.");

        const isOwner = authCtx && authCtx.uid === existing.publisherId;
        const admin = authCtx && await isUserAdmin(authCtx, env);
        const isStatusChecker = !authCtx && (body.status !== undefined || body.isOnline !== undefined);

        if (!isOwner && !admin && !isStatusChecker) {
          throw new HttpError(403, "FORBIDDEN", "غير مصرح لك بتعديل هذا السيرفر.");
        }

        const now = new Date().toISOString();
        const existingRaw = parseJsonField(existing.raw_data, {});
        const updatedRaw = { ...existingRaw, ...body, id };

        await contentDb.prepare(`
          UPDATE servers SET
            title = COALESCE(?, title),
            description = COALESCE(?, description),
            ip = COALESCE(?, ip),
            port = COALESCE(?, port),
            version = COALESCE(?, version),
            status = COALESCE(?, status),
            isOnline = COALESCE(?, isOnline),
            javaStatus = COALESCE(?, javaStatus),
            bedrockStatus = COALESCE(?, bedrockStatus),
            onlinePlayers = COALESCE(?, onlinePlayers),
            maxPlayers = COALESCE(?, maxPlayers),
            motd = COALESCE(?, motd),
            ping = COALESCE(?, ping),
            lastChecked = COALESCE(?, lastChecked),
            raw_data = ?,
            updatedAt = ?
          WHERE id = ?
        `).bind(
          body.title || null,
          body.description || null,
          body.ip || null,
          body.port || null,
          body.version || null,
          body.status || null,
          body.isOnline !== undefined ? (body.isOnline ? 1 : 0) : null,
          body.javaStatus || null,
          body.bedrockStatus || null,
          body.onlinePlayers !== undefined ? Number(body.onlinePlayers) : null,
          body.maxPlayers !== undefined ? Number(body.maxPlayers) : null,
          body.motd || null,
          body.ping !== undefined ? Number(body.ping) : null,
          body.lastChecked || null,
          JSON.stringify(updatedRaw),
          now,
          id
        ).run();

        return jsonResponse(200, { ok: true, server: updatedRaw }, cors);
      }

      // DELETE /content/servers/:id
      if (serverIdMatch && request.method === "DELETE") {
        const id = decodeURIComponent(serverIdMatch[1]).trim();
        const authCtx = await requireAuth(request, env);
        const existing = await contentDb.prepare(`SELECT publisherId FROM servers WHERE id = ? LIMIT 1`).bind(id).first();
        if (!existing) throw new HttpError(404, "SERVER_NOT_FOUND", "السيرفر غير موجود.");

        const isOwner = authCtx.uid === existing.publisherId;
        const admin = await isUserAdmin(authCtx, env);
        if (!isOwner && !admin) throw new HttpError(403, "FORBIDDEN", "غير مصرح لك بحذف هذا السيرفر.");

        await contentDb.prepare(`DELETE FROM servers WHERE id = ?`).bind(id).run();
        return jsonResponse(200, { ok: true, message: "تم حذف السيرفر بنجاح." }, cors);
      }

      /* ==================== 12. GAME_INVITES COLLECTION ==================== */

      // GET /content/game_invites
      if ((path === "/content/game_invites" || path === "/api/content/game_invites") && request.method === "GET") {
        const now = new Date().toISOString();
        const rows = await contentDb.prepare(`
          SELECT * FROM game_invites WHERE expiresAt > ? ORDER BY createdAt DESC LIMIT 50
        `).bind(now).all();

        const hostIds = Array.from(new Set((rows.results || []).map(r => r.hostId).filter(Boolean)));
        const usersMap = {};
        await Promise.all(
          hostIds.map(async (uid) => {
            const u = await fetchUser(uid, env);
            if (u) usersMap[uid] = u;
          })
        );

        const invites = (rows.results || []).map(row => {
          const raw = parseJsonField(row.raw_data, {});
          const host = usersMap[row.hostId];
          return {
            ...raw,
            id: row.id,
            hostId: row.hostId,
            hostName: host ? (host.displayName || host.username) : (raw.hostName || "مستخدم"),
            hostAvatar: host ? host.avatar : (raw.hostAvatar || ""),
            mcName: row.mcName || raw.mcName || "",
            version: row.version || raw.version || "",
            expiresAt: row.expiresAt,
            createdAt: row.createdAt
          };
        });

        return jsonResponse(200, { ok: true, invites }, cors);
      }

      // POST /content/game_invites
      if ((path === "/content/game_invites" || path === "/api/content/game_invites") && request.method === "POST") {
        const authCtx = await requireAuth(request, env);
        const body = await readJsonBody(request);

        const id = body.id || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const hostId = authCtx.uid;
        const now = body.createdAt || new Date().toISOString();
        const expiresAt = body.expiresAt || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
        const user = await fetchUser(hostId, env);

        const rawData = {
          ...body,
          id,
          hostId,
          hostName: user?.displayName || user?.username || body.hostName || "مستخدم",
          hostAvatar: user?.avatar || body.hostAvatar || "",
          expiresAt,
          createdAt: now
        };

        await contentDb.prepare(`
          INSERT INTO game_invites (id, hostId, mcName, version, expiresAt, raw_data, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          hostId,
          body.mcName || "",
          body.version || "1.21.x",
          expiresAt,
          JSON.stringify(rawData),
          now
        ).run();

        return jsonResponse(201, { ok: true, id, invite: rawData }, cors);
      }

      // DELETE /content/game_invites/:id
      const inviteIdMatch = path.match(/^\/(?:api\/)?content\/game_invites\/([^\/]+)$/);
      if (inviteIdMatch && request.method === "DELETE") {
        const id = decodeURIComponent(inviteIdMatch[1]).trim();
        const authCtx = await requireAuth(request, env);

        const existing = await contentDb.prepare(`SELECT hostId FROM game_invites WHERE id = ? LIMIT 1`).bind(id).first();
        if (!existing) throw new HttpError(404, "INVITE_NOT_FOUND", "الدعوة غير موجودة.");

        const isOwner = authCtx.uid === existing.hostId;
        const admin = await isUserAdmin(authCtx, env);
        if (!isOwner && !admin) throw new HttpError(403, "FORBIDDEN", "غير مصرح لك بإلغاء هذه الدعوة.");

        await contentDb.prepare(`DELETE FROM game_invites WHERE id = ?`).bind(id).run();
        return jsonResponse(200, { ok: true, message: "تم حذف الدعوة بنجاح." }, cors);
      }

      /* ==================== 13. POSTACTIONS COLLECTION (Likes/Dislikes) ==================== */

      // GET /content/postActions
      if ((path === "/content/postActions" || path === "/api/content/postActions") && request.method === "GET") {
        const postId = url.searchParams.get("postId");
        const userId = url.searchParams.get("userId");
        if (!postId || !userId) throw new HttpError(400, "MISSING_PARAMS", "postId و userId مطلوبان.");

        const row = await contentDb.prepare(`SELECT * FROM postActions WHERE postId = ? AND userId = ? LIMIT 1`)
          .bind(postId, userId)
          .first();

        return jsonResponse(200, {
          ok: true,
          action: row ? { liked: Boolean(row.liked), disliked: Boolean(row.disliked) } : { liked: false, disliked: false }
        }, cors);
      }

      // POST /content/postActions/react
      if ((path === "/content/postActions/react" || path === "/api/content/postActions/react") && request.method === "POST") {
        const authCtx = await requireAuth(request, env);
        const body = await readJsonBody(request);
        const { postId, action } = body;
        if (!postId || !action) throw new HttpError(400, "MISSING_PARAMS", "postId و action مطلوبان.");

        const mod = await contentDb.prepare(`SELECT likedBy, dislikedBy, stats FROM mods WHERE id = ? LIMIT 1`).bind(postId).first();
        if (!mod) throw new HttpError(404, "MOD_NOT_FOUND", "المود غير موجود.");

        let likedBy = parseJsonField(mod.likedBy, []);
        let dislikedBy = parseJsonField(mod.dislikedBy, []);
        const stats = parseJsonField(mod.stats, { likes: 0, dislikes: 0 });
        const uid = authCtx.uid;

        let liked = false;
        let disliked = false;

        if (action === "like") {
          dislikedBy = dislikedBy.filter(u => u !== uid);
          if (likedBy.includes(uid)) {
            likedBy = likedBy.filter(u => u !== uid);
            liked = false;
          } else {
            likedBy.push(uid);
            liked = true;
          }
        } else if (action === "dislike") {
          likedBy = likedBy.filter(u => u !== uid);
          if (dislikedBy.includes(uid)) {
            dislikedBy = dislikedBy.filter(u => u !== uid);
            disliked = false;
          } else {
            dislikedBy.push(uid);
            disliked = true;
          }
        }

        stats.likes = likedBy.length;
        stats.dislikes = dislikedBy.length;

        const actionId = `pa_${postId}_${uid}`;
        const now = new Date().toISOString();

        await contentDb.prepare(`
          INSERT INTO postActions (id, postId, userId, liked, disliked, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET liked = excluded.liked, disliked = excluded.disliked, updatedAt = excluded.updatedAt;
        `).bind(actionId, postId, uid, liked ? 1 : 0, disliked ? 1 : 0, now, now).run();

        await contentDb.prepare(`
          UPDATE mods SET likedBy = ?, dislikedBy = ?, stats = ?, updatedAt = ? WHERE id = ?
        `).bind(JSON.stringify(likedBy), JSON.stringify(dislikedBy), JSON.stringify(stats), now, postId).run();

        return jsonResponse(200, {
          ok: true,
          hasLiked: liked,
          hasDisliked: disliked,
          likes: stats.likes,
          dislikes: stats.dislikes
        }, cors);
      }

      /* ==================== 14. REPORTS COLLECTION ==================== */

      // GET /content/reports
      if ((path === "/content/reports" || path === "/api/content/reports") && request.method === "GET") {
        const authCtx = await requireAuth(request, env);
        const admin = await isUserAdmin(authCtx, env);
        const publisherId = url.searchParams.get("publisherId");

        if (!admin && (!publisherId || publisherId !== authCtx.uid)) {
          throw new HttpError(403, "FORBIDDEN", "غير مصرح لك بعرض البلاغات.");
        }

        let q = `SELECT * FROM reports`;
        const params = [];
        if (publisherId) {
          q += ` WHERE publisherId = ?`;
          params.push(publisherId);
        }
        q += ` ORDER BY createdAt DESC LIMIT 100`;

        const rows = await contentDb.prepare(q).bind(...params).all();
        const reports = (rows.results || []).map(r => ({ ...parseJsonField(r.raw_data, {}), ...r }));
        return jsonResponse(200, { ok: true, reports }, cors);
      }

      // POST /content/reports
      if ((path === "/content/reports" || path === "/api/content/reports") && request.method === "POST") {
        const authCtx = await extractAuth(request, env);
        const body = await readJsonBody(request);

        const id = body.id || `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const now = body.createdAt || new Date().toISOString();
        const reporterId = authCtx ? authCtx.uid : (body.reporterId || "anonymous");
        const user = authCtx ? await fetchUser(reporterId, env) : null;

        const rawData = {
          ...body,
          id,
          reporterId,
          reporterName: user?.displayName || user?.username || body.reporterName || "مستخدم",
          status: "pending",
          createdAt: now
        };

        await contentDb.prepare(`
          INSERT INTO reports (
            id, modId, modTitle, serverId, postId, publisherId,
            reporterId, reporterName, reason, status, raw_data, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
        `).bind(
          id,
          body.modId || null,
          body.modTitle || body.postTitle || null,
          body.serverId || null,
          body.postId || null,
          body.publisherId || null,
          reporterId,
          rawData.reporterName,
          body.reason || "سبب غير محدد",
          JSON.stringify(rawData),
          now,
          now
        ).run();

        return jsonResponse(201, { ok: true, id, message: "تم إرسال البلاغ بنجاح." }, cors);
      }

      // PUT /content/reports/:id (Resolve Report)
      const reportIdMatch = path.match(/^\/(?:api\/)?content\/reports\/([^\/]+)$/);
      if (reportIdMatch && request.method === "PUT") {
        const id = decodeURIComponent(reportIdMatch[1]).trim();
        const authCtx = await requireAuth(request, env);
        const admin = await isUserAdmin(authCtx, env);
        if (!admin) throw new HttpError(403, "FORBIDDEN", "معالجة البلاغات مخصصة للمشرفين فقط.");

        const body = await readJsonBody(request);
        const now = new Date().toISOString();

        await contentDb.prepare(`UPDATE reports SET status = ?, updatedAt = ? WHERE id = ?`)
          .bind(body.status || "resolved", now, id)
          .run();

        return jsonResponse(200, { ok: true, message: "تم تحديث حالة البلاغ." }, cors);
      }

      // DELETE /content/reports/:id
      if (reportIdMatch && request.method === "DELETE") {
        const id = decodeURIComponent(reportIdMatch[1]).trim();
        const authCtx = await requireAuth(request, env);
        const admin = await isUserAdmin(authCtx, env);
        if (!admin) throw new HttpError(403, "FORBIDDEN", "حذف البلاغات مخصص للمشرفين فقط.");

        await contentDb.prepare(`DELETE FROM reports WHERE id = ?`).bind(id).run();
        return jsonResponse(200, { ok: true, message: "تم حذف البلاغ بنجاح." }, cors);
      }

      /* ==================== 15. COMMUNITY_POSTS COLLECTION ==================== */

      // GET /content/community_posts
      if ((path === "/content/community_posts" || path === "/api/content/community_posts") && request.method === "GET") {
        const now = Date.now();
        const fourDaysMs = 4 * 24 * 60 * 60 * 1000;

        const rows = await contentDb.prepare(`SELECT * FROM community_posts ORDER BY createdAt DESC LIMIT 100`).all();
        const activePosts = [];
        const expiredIds = [];

        for (const row of (rows.results || [])) {
          const raw = parseJsonField(row.raw_data, {});
          const createdTime = row.createdAt ? new Date(row.createdAt).getTime() : 0;
          const expiresTime = row.expiresAt ? new Date(row.expiresAt).getTime() : 0;

          let isExpired = false;
          if (expiresTime > 0 && expiresTime <= now) {
            isExpired = true;
          } else if (createdTime > 0 && (now - createdTime > fourDaysMs)) {
            isExpired = true;
          }

          if (isExpired) {
            expiredIds.push(row.id);
          } else {
            const author = await fetchUser(row.authorId, env);
            activePosts.push({
              ...raw,
              id: row.id,
              authorId: row.authorId,
              authorName: author ? (author.displayName || author.username) : (raw.authorName || "مستخدم"),
              authorAvatar: author ? author.avatar : (raw.authorAvatar || ""),
              isVerified: author ? Boolean(author.isVerified) : Boolean(raw.isVerified),
              title: row.title || raw.title || "",
              description: row.description || raw.description || "",
              images: parseJsonField(row.images, raw.images || []),
              likes: parseJsonField(row.likes, raw.likes || []),
              fakeLikes: row.fakeLikes !== null && row.fakeLikes !== undefined ? Number(row.fakeLikes) : raw.fakeLikes,
              comments: parseJsonField(row.comments, raw.comments || []),
              expiresAt: row.expiresAt || raw.expiresAt,
              createdAt: row.createdAt || raw.createdAt
            });
          }
        }

        if (expiredIds.length > 0) {
          ctx.waitUntil((async () => {
            for (const expId of expiredIds) {
              await contentDb.prepare(`DELETE FROM community_posts WHERE id = ?`).bind(expId).run().catch(() => {});
            }
          })());
        }

        return jsonResponse(200, { ok: true, posts: activePosts }, cors);
      }

      // POST /content/community_posts (Create Post)
      if ((path === "/content/community_posts" || path === "/api/content/community_posts") && request.method === "POST") {
        const authCtx = await requireAuth(request, env);
        const body = await readJsonBody(request);

        const id = body.id || `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const now = body.createdAt || new Date().toISOString();
        const fourDaysLater = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString();
        const expiresAt = body.expiresAt || fourDaysLater;
        const authorId = authCtx.uid;
        const user = await fetchUser(authorId, env);

        const rawData = {
          ...body,
          id,
          authorId,
          authorName: user?.displayName || user?.username || body.authorName || "مستخدم",
          authorAvatar: user?.avatar || body.authorAvatar || "",
          isVerified: Boolean(user?.isVerified),
          title: body.title || "",
          description: body.description || "",
          images: body.images || [],
          likes: body.likes || [],
          comments: body.comments || [],
          expiresAt,
          createdAt: now,
          updatedAt: now
        };

        await contentDb.prepare(`
          INSERT INTO community_posts (
            id, authorId, authorName, authorAvatar, title, description,
            images, likes, fakeLikes, comments, expiresAt, raw_data, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          authorId,
          rawData.authorName,
          rawData.authorAvatar,
          rawData.title,
          rawData.description,
          JSON.stringify(rawData.images),
          JSON.stringify(rawData.likes),
          body.fakeLikes !== undefined ? Number(body.fakeLikes) : null,
          JSON.stringify(rawData.comments),
          expiresAt,
          JSON.stringify(rawData),
          now,
          now
        ).run();

        return jsonResponse(201, { ok: true, id, post: rawData }, cors);
      }

      // GET /content/community_posts/:id
      const communityPostIdMatch = path.match(/^\/(?:api\/)?content\/community_posts\/([^\/]+)$/);
      if (communityPostIdMatch && request.method === "GET") {
        const id = decodeURIComponent(communityPostIdMatch[1]).trim();
        const row = await contentDb.prepare(`SELECT * FROM community_posts WHERE id = ? LIMIT 1`).bind(id).first();
        if (!row) throw new HttpError(404, "POST_NOT_FOUND", "المنشور غير موجود.");

        const raw = parseJsonField(row.raw_data, {});
        const author = await fetchUser(row.authorId, env);
        const post = {
          ...raw,
          id: row.id,
          authorId: row.authorId,
          authorName: author ? (author.displayName || author.username) : (raw.authorName || "مستخدم"),
          authorAvatar: author ? author.avatar : (raw.authorAvatar || ""),
          isVerified: author ? Boolean(author.isVerified) : Boolean(raw.isVerified),
          title: row.title || raw.title || "",
          description: row.description || raw.description || "",
          images: parseJsonField(row.images, raw.images || []),
          likes: parseJsonField(row.likes, raw.likes || []),
          fakeLikes: row.fakeLikes !== null && row.fakeLikes !== undefined ? Number(row.fakeLikes) : raw.fakeLikes,
          comments: parseJsonField(row.comments, raw.comments || []),
          expiresAt: row.expiresAt || raw.expiresAt,
          createdAt: row.createdAt || raw.createdAt
        };

        return jsonResponse(200, { ok: true, post }, cors);
      }

      // PUT /content/community_posts/:id (Update / FakeLikes / Content)
      if (communityPostIdMatch && request.method === "PUT") {
        const id = decodeURIComponent(communityPostIdMatch[1]).trim();
        const body = await readJsonBody(request);
        const authCtx = await extractAuth(request, env);

        const existing = await contentDb.prepare(`SELECT * FROM community_posts WHERE id = ? LIMIT 1`).bind(id).first();
        if (!existing) throw new HttpError(404, "POST_NOT_FOUND", "المنشور غير موجود.");

        const isOwner = authCtx && authCtx.uid === existing.authorId;
        const admin = authCtx && await isUserAdmin(authCtx, env);
        if (!isOwner && !admin && body.fakeLikes === undefined) {
          throw new HttpError(403, "FORBIDDEN", "غير مصرح لك بتعديل هذا المنشور.");
        }

        const now = new Date().toISOString();
        const existingRaw = parseJsonField(existing.raw_data, {});
        const updatedRaw = { ...existingRaw, ...body, id };

        await contentDb.prepare(`
          UPDATE community_posts SET
            title = COALESCE(?, title),
            description = COALESCE(?, description),
            images = COALESCE(?, images),
            likes = COALESCE(?, likes),
            fakeLikes = ?,
            comments = COALESCE(?, comments),
            raw_data = ?,
            updatedAt = ?
          WHERE id = ?
        `).bind(
          body.title || null,
          body.description || null,
          body.images ? JSON.stringify(body.images) : null,
          body.likes ? JSON.stringify(body.likes) : null,
          body.fakeLikes !== undefined ? (body.fakeLikes === null ? null : Number(body.fakeLikes)) : existing.fakeLikes,
          body.comments ? JSON.stringify(body.comments) : null,
          JSON.stringify(updatedRaw),
          now,
          id
        ).run();

        return jsonResponse(200, { ok: true, post: updatedRaw }, cors);
      }

      // DELETE /content/community_posts/:id
      if (communityPostIdMatch && request.method === "DELETE") {
        const id = decodeURIComponent(communityPostIdMatch[1]).trim();
        const authCtx = await requireAuth(request, env);

        const existing = await contentDb.prepare(`SELECT authorId FROM community_posts WHERE id = ? LIMIT 1`).bind(id).first();
        if (!existing) throw new HttpError(404, "POST_NOT_FOUND", "المنشور غير موجود.");

        const isOwner = authCtx.uid === existing.authorId;
        const admin = await isUserAdmin(authCtx, env);
        if (!isOwner && !admin) throw new HttpError(403, "FORBIDDEN", "غير مصرح لك بحذف هذا المنشور.");

        await contentDb.prepare(`DELETE FROM community_posts WHERE id = ?`).bind(id).run();
        return jsonResponse(200, { ok: true, message: "تم حذف المنشور بنجاح." }, cors);
      }

      // POST /content/community_posts/:id/like (Toggle Like)
      const postLikeMatch = path.match(/^\/(?:api\/)?content\/community_posts\/([^\/]+)\/like$/);
      if (postLikeMatch && request.method === "POST") {
        const id = decodeURIComponent(postLikeMatch[1]).trim();
        const authCtx = await requireAuth(request, env);

        const post = await contentDb.prepare(`SELECT likes, raw_data FROM community_posts WHERE id = ? LIMIT 1`).bind(id).first();
        if (!post) throw new HttpError(404, "POST_NOT_FOUND", "المنشور غير موجود.");

        let likes = parseJsonField(post.likes, []);
        const uid = authCtx.uid;
        if (likes.includes(uid)) {
          likes = likes.filter(u => u !== uid);
        } else {
          likes.push(uid);
        }

        const now = new Date().toISOString();
        const existingRaw = parseJsonField(post.raw_data, {});
        existingRaw.likes = likes;

        await contentDb.prepare(`UPDATE community_posts SET likes = ?, raw_data = ?, updatedAt = ? WHERE id = ?`)
          .bind(JSON.stringify(likes), JSON.stringify(existingRaw), now, id)
          .run();

        return jsonResponse(200, { ok: true, likes }, cors);
      }

      // POST /content/community_posts/:id/comment (Add Comment)
      const postCommentMatch = path.match(/^\/(?:api\/)?content\/community_posts\/([^\/]+)\/comment$/);
      if (postCommentMatch && request.method === "POST") {
        const id = decodeURIComponent(postCommentMatch[1]).trim();
        const authCtx = await requireAuth(request, env);
        const body = await readJsonBody(request);

        const post = await contentDb.prepare(`SELECT comments, raw_data FROM community_posts WHERE id = ? LIMIT 1`).bind(id).first();
        if (!post) throw new HttpError(404, "POST_NOT_FOUND", "المنشور غير موجود.");

        const comments = parseJsonField(post.comments, []);
        const user = await fetchUser(authCtx.uid, env);

        const newComment = {
          id: body.id || `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId: authCtx.uid,
          userName: user?.displayName || user?.username || body.userName || "مستخدم",
          userAvatar: user?.avatar || body.userAvatar || "",
          text: body.text || "",
          likes: body.likes || [],
          createdAt: body.createdAt || new Date().toISOString()
        };

        comments.push(newComment);
        const now = new Date().toISOString();
        const existingRaw = parseJsonField(post.raw_data, {});
        existingRaw.comments = comments;

        await contentDb.prepare(`UPDATE community_posts SET comments = ?, raw_data = ?, updatedAt = ? WHERE id = ?`)
          .bind(JSON.stringify(comments), JSON.stringify(existingRaw), now, id)
          .run();

        return jsonResponse(201, { ok: true, comment: newComment }, cors);
      }

      // DELETE /content/community_posts/:id/comment/:commentId
      const postDelCommentMatch = path.match(/^\/(?:api\/)?content\/community_posts\/([^\/]+)\/comment\/([^\/]+)$/);
      if (postDelCommentMatch && request.method === "DELETE") {
        const postId = decodeURIComponent(postDelCommentMatch[1]).trim();
        const commentId = decodeURIComponent(postDelCommentMatch[2]).trim();
        const authCtx = await requireAuth(request, env);

        const post = await contentDb.prepare(`SELECT comments, raw_data FROM community_posts WHERE id = ? LIMIT 1`).bind(postId).first();
        if (!post) throw new HttpError(404, "POST_NOT_FOUND", "المنشور غير موجود.");

        let comments = parseJsonField(post.comments, []);
        const comment = comments.find(c => c.id === commentId);
        const isAuthor = comment && comment.userId === authCtx.uid;
        const admin = await isUserAdmin(authCtx, env);

        if (!isAuthor && !admin) throw new HttpError(403, "FORBIDDEN", "غير مصرح لك بحذف هذا التعليق.");

        comments = comments.filter(c => c.id !== commentId);
        const now = new Date().toISOString();
        const existingRaw = parseJsonField(post.raw_data, {});
        existingRaw.comments = comments;

        await contentDb.prepare(`UPDATE community_posts SET comments = ?, raw_data = ?, updatedAt = ? WHERE id = ?`)
          .bind(JSON.stringify(comments), JSON.stringify(existingRaw), now, postId)
          .run();

        return jsonResponse(200, { ok: true, message: "تم حذف التعليق بنجاح." }, cors);
      }

      // POST /content/community_posts/:id/comment/:commentId/like
      const postLikeCommentMatch = path.match(/^\/(?:api\/)?content\/community_posts\/([^\/]+)\/comment\/([^\/]+)\/like$/);
      if (postLikeCommentMatch && request.method === "POST") {
        const postId = decodeURIComponent(postLikeCommentMatch[1]).trim();
        const commentId = decodeURIComponent(postLikeCommentMatch[2]).trim();
        const authCtx = await requireAuth(request, env);

        const post = await contentDb.prepare(`SELECT comments, raw_data FROM community_posts WHERE id = ? LIMIT 1`).bind(postId).first();
        if (!post) throw new HttpError(404, "POST_NOT_FOUND", "المنشور غير موجود.");

        const comments = parseJsonField(post.comments, []);
        const commentIndex = comments.findIndex(c => c.id === commentId);
        if (commentIndex === -1) throw new HttpError(404, "COMMENT_NOT_FOUND", "التعليق غير موجود.");

        const comment = comments[commentIndex];
        let likes = Array.isArray(comment.likes) ? comment.likes : [];
        const uid = authCtx.uid;

        if (likes.includes(uid)) {
          likes = likes.filter(u => u !== uid);
        } else {
          likes.push(uid);
        }

        comments[commentIndex] = { ...comment, likes };
        const now = new Date().toISOString();
        const existingRaw = parseJsonField(post.raw_data, {});
        existingRaw.comments = comments;

        await contentDb.prepare(`UPDATE community_posts SET comments = ?, raw_data = ?, updatedAt = ? WHERE id = ?`)
          .bind(JSON.stringify(comments), JSON.stringify(existingRaw), now, postId)
          .run();

        return jsonResponse(200, { ok: true, likes }, cors);
      }

      /* ==================== 16. PRIVATE_MOD_DOWNLOADS COLLECTION ==================== */

      // GET /content/private_mod_downloads/:modId
      const privateModMatch = path.match(/^\/(?:api\/)?content\/private_mod_downloads\/([^\/]+)$/);
      if (privateModMatch && request.method === "GET") {
        const modId = decodeURIComponent(privateModMatch[1]).trim();
        const authCtx = await requireAuth(request, env);

        const mod = await contentDb.prepare(`SELECT publisherId, price FROM mods WHERE id = ? LIMIT 1`).bind(modId).first();
        if (!mod) throw new HttpError(404, "MOD_NOT_FOUND", "المود غير موجود.");

        const isOwner = authCtx.uid === mod.publisherId;
        const admin = await isUserAdmin(authCtx, env);

        let hasAccess = isOwner || admin;
        if (!hasAccess && Number(mod.price || 0) > 0) {
          const purchase = await contentDb.prepare(`SELECT id FROM purchases WHERE userId = ? AND modId = ? LIMIT 1`)
            .bind(authCtx.uid, modId)
            .first();
          hasAccess = Boolean(purchase);
        }

        if (!hasAccess) {
          throw new HttpError(403, "PAYMENT_REQUIRED", "يجب شراء هذا المود للوصول إلى رابط التحميل الخاص.");
        }

        const row = await contentDb.prepare(`SELECT downloadUrl FROM private_mod_downloads WHERE modId = ? LIMIT 1`).bind(modId).first();
        return jsonResponse(200, { ok: true, downloadUrl: row ? row.downloadUrl : null }, cors);
      }

      // POST /content/private_mod_downloads
      if ((path === "/content/private_mod_downloads" || path === "/api/content/private_mod_downloads") && request.method === "POST") {
        const authCtx = await requireAuth(request, env);
        const body = await readJsonBody(request);
        const { modId, downloadUrl } = body;
        if (!modId || !downloadUrl) throw new HttpError(400, "MISSING_PARAMS", "modId و downloadUrl مطلوبان.");

        const mod = await contentDb.prepare(`SELECT publisherId FROM mods WHERE id = ? LIMIT 1`).bind(modId).first();
        const isOwner = mod && authCtx.uid === mod.publisherId;
        const admin = await isUserAdmin(authCtx, env);
        if (!isOwner && !admin) {
          throw new HttpError(403, "FORBIDDEN", "غير مصرح لك بتعيين رابط التحميل الخاص لهذا المود.");
        }

        const id = body.id || modId;
        const now = new Date().toISOString();

        await contentDb.prepare(`
          INSERT INTO private_mod_downloads (id, modId, downloadUrl, publisherId, raw_data, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET downloadUrl = excluded.downloadUrl, updatedAt = excluded.updatedAt;
        `).bind(id, modId, downloadUrl, authCtx.uid, JSON.stringify(body), now, now).run();

        return jsonResponse(200, { ok: true, message: "تم حفظ رابط التحميل الخاص بنجاح." }, cors);
      }

      /* ==================== 16. BATCH MIGRATION ENDPOINT ==================== */

      if ((path === "/content/batch-migrate" || path === "/api/content/batch-migrate") && request.method === "POST") {
        const authCtx = await requireAuth(request, env);
        const admin = await isUserAdmin(authCtx, env);
        if (!admin) {
          throw new HttpError(403, "FORBIDDEN", "استيراد البيانات مخصص للمشرف فقط.");
        }

        const body = await readJsonBody(request);
        const { collection: collName, items } = body;
        if (!collName || !Array.isArray(items) || items.length === 0) {
          throw new HttpError(400, "INVALID_BATCH", "يجب توفير اسم المجموعة وقائمة العناصر المراد ترحيلها.");
        }

        let inserted = 0;
        const now = new Date().toISOString();

        if (collName === "mods") {
          for (const item of items) {
            try {
              await contentDb.prepare(`
                INSERT INTO mods (
                  id, shareCode, modCode, title, description, visibilityLevel,
                  publisherId, type, category, minecraftVersion, mainImage,
                  additionalImages, downloadUrl, fileSize, stats, fakeStats,
                  comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
                  platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
                  monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
                  customAdRate, raw_data, createdAt, updatedAt
                ) VALUES (
                  ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?,
                  ?, ?, ?,
                  ?, ?, ?, ?
                )
                ON CONFLICT(id) DO UPDATE SET
                  title = excluded.title,
                  description = excluded.description,
                  stats = excluded.stats,
                  comments = excluded.comments,
                  likedBy = excluded.likedBy,
                  dislikedBy = excluded.dislikedBy,
                  updatedAt = excluded.updatedAt;
              `).bind(
                item.id,
                item.shareCode || item.id,
                item.modCode || null,
                item.title || "",
                item.description || "",
                item.visibilityLevel || "public",
                item.publisherId || "",
                item.type || "Mod",
                item.category || "عام",
                item.minecraftVersion || "1.21.x",
                item.mainImage || "",
                JSON.stringify(item.additionalImages || []),
                item.downloadUrl || "",
                item.fileSize || "",
                JSON.stringify(item.stats || {}),
                item.fakeStats ? JSON.stringify(item.fakeStats) : null,
                JSON.stringify(item.comments || []),
                JSON.stringify(item.likedBy || []),
                JSON.stringify(item.dislikedBy || []),
                JSON.stringify(item.ratedBy || {}),
                item.youtubeUrl || "",
                Number(item.price || 0),
                item.platform || "Bedrock",
                item.modLoader || null,
                item.disableAds ? 1 : 0,
                JSON.stringify(item.creatorAdCodes || []),
                item.monetizationEnabled ? 1 : 0,
                item.monetizationSuspended ? 1 : 0,
                item.monetizationSuspendedReason || null,
                item.monetizationActivatedAt || null,
                item.customAdRate || null,
                JSON.stringify(item),
                item.createdAt || now,
                now
              ).run();
              inserted++;
            } catch (err) {
              console.warn(`Migration insert failed for mod ${item.id}:`, err?.message);
            }
          }
        } else if (collName === "servers") {
          for (const item of items) {
            try {
              await contentDb.prepare(`
                INSERT INTO servers (
                  id, title, description, ip, port, version, type, serverType,
                  edition, platform, category, publisherId, status, isOnline,
                  javaStatus, bedrockStatus, onlinePlayers, maxPlayers, motd, ping,
                  lastChecked, raw_data, createdAt, updatedAt
                ) VALUES (
                  ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?
                )
                ON CONFLICT(id) DO UPDATE SET
                  title = excluded.title,
                  ip = excluded.ip,
                  port = excluded.port,
                  status = excluded.status,
                  isOnline = excluded.isOnline,
                  updatedAt = excluded.updatedAt;
              `).bind(
                item.id,
                item.title || "",
                item.description || "",
                item.ip || "",
                item.port || "19132",
                item.version || "1.21.x",
                item.type || "Server",
                item.serverType || "",
                item.edition || "Bedrock",
                item.platform || "Bedrock",
                item.category || "سيرفر",
                item.publisherId || "",
                item.status || "offline",
                item.isOnline ? 1 : 0,
                item.javaStatus || "offline",
                item.bedrockStatus || "offline",
                Number(item.onlinePlayers || 0),
                Number(item.maxPlayers || 0),
                item.motd || "",
                item.ping !== undefined ? Number(item.ping) : null,
                item.lastChecked || null,
                JSON.stringify(item),
                item.createdAt || now,
                now
              ).run();
              inserted++;
            } catch (err) {
              console.warn(`Migration insert failed for server ${item.id}:`, err?.message);
            }
          }
        }

        return jsonResponse(200, { ok: true, collection: collName, inserted, total: items.length }, cors);
      }

      /* ==================== 17. LOGS & METRICS (Database: overmods_logs) ==================== */

      // POST /logs/record-view (Record Mod View)
      if (
        (path === "/logs/record-view" ||
         path === "/record-view" ||
         path === "/api/record-view" ||
         path === "/content/mods/record-view") &&
        request.method === "POST"
      ) {
        const body = await readJsonBody(request).catch(() => ({}));
        const modId = (body.modId || url.searchParams.get("modId") || "").trim();
        if (!modId) {
          throw new HttpError(400, "INVALID_MOD_ID", "معرّف المود مطلوب.");
        }

        // Verify Firebase Auth token if present
        const authCtx = await extractAuth(request, env);
        const userId = authCtx ? authCtx.uid : null;

        // Extract client IP strictly from trusted server headers (never client body)
        const clientIp = getClientIp(request);

        // Sanitize deviceId
        let deviceId = "unknown_device";
        if (typeof body.deviceId === "string" && /^[A-Za-z0-9_-]{8,128}$/.test(body.deviceId)) {
          deviceId = body.deviceId;
        }

        // 24-hour Deduplication window
        const windowLimit = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        let existingLog = null;
        if (userId) {
          existingLog = await logsDb
            .prepare(`SELECT id FROM mod_view_logs WHERE modId = ? AND userId = ? AND createdAt >= ? LIMIT 1`)
            .bind(modId, userId, windowLimit)
            .first();
        } else {
          existingLog = await logsDb
            .prepare(`SELECT id FROM mod_view_logs WHERE modId = ? AND ip = ? AND userId IS NULL AND createdAt >= ? LIMIT 1`)
            .bind(modId, clientIp, windowLimit)
            .first();
        }

        if (existingLog) {
          return jsonResponse(200, {
            ok: true,
            recorded: false,
            duplicate: true,
            message: "تم تسجيل مشاهدة هذا المود مسبقاً خلال الـ 24 ساعة الماضية."
          }, cors);
        }

        const country = await resolveCountry(request, clientIp, env);
        const logId = "mvl_" + crypto.randomUUID();
        const nowIso = new Date().toISOString();

        await logsDb
          .prepare(
            `INSERT INTO mod_view_logs (id, modId, userId, deviceId, ip, country, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(logId, modId, userId, deviceId, clientIp, country, nowIso)
          .run();

        // Increment views in overmods-content if contentDb is available
        if (contentDb) {
          try {
            const modRow = await contentDb.prepare(`SELECT stats FROM mods WHERE id = ? LIMIT 1`).bind(modId).first();
            if (modRow) {
              const stats = parseJsonField(modRow.stats, {
                views: 0,
                uniqueViews: 0,
                downloads: 0,
                likes: 0,
                dislikes: 0,
                averageRating: 0,
                ratingCount: 0,
                totalRatingScore: 0
              });
              stats.views = (Number(stats.views) || 0) + 1;
              stats.uniqueViews = (Number(stats.uniqueViews) || 0) + 1;
              await contentDb
                .prepare(`UPDATE mods SET stats = ?, updatedAt = ? WHERE id = ?`)
                .bind(JSON.stringify(stats), nowIso, modId)
                .run();
            }
          } catch (e) {
            console.warn("Failed to increment mod views in contentDb:", e?.message);
          }
        }

        return jsonResponse(200, {
          ok: true,
          recorded: true,
          duplicate: false,
          logId,
          country
        }, cors);
      }

      // POST /logs/record-download (Record Mod Download)
      if (
        (path === "/logs/record-download" ||
         path === "/record-download" ||
         path === "/api/record-download" ||
         path === "/content/mods/record-download") &&
        request.method === "POST"
      ) {
        const body = await readJsonBody(request).catch(() => ({}));
        const modId = (body.modId || url.searchParams.get("modId") || "").trim();
        if (!modId) {
          throw new HttpError(400, "INVALID_MOD_ID", "معرّف المود مطلوب.");
        }

        // Verify Firebase Auth token if present
        const authCtx = await extractAuth(request, env);
        const userId = authCtx ? authCtx.uid : null;

        // Extract client IP strictly from trusted server headers (never client body)
        const clientIp = getClientIp(request);

        // Sanitize deviceId
        let deviceId = "unknown_device";
        if (typeof body.deviceId === "string" && /^[A-Za-z0-9_-]{8,128}$/.test(body.deviceId)) {
          deviceId = body.deviceId;
        }

        // 24-hour Deduplication window
        const windowLimit = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        let existingLog = null;
        if (userId) {
          existingLog = await logsDb
            .prepare(`SELECT id FROM mod_download_logs WHERE modId = ? AND userId = ? AND createdAt >= ? LIMIT 1`)
            .bind(modId, userId, windowLimit)
            .first();
        } else {
          existingLog = await logsDb
            .prepare(`SELECT id FROM mod_download_logs WHERE modId = ? AND ip = ? AND userId IS NULL AND createdAt >= ? LIMIT 1`)
            .bind(modId, clientIp, windowLimit)
            .first();
        }

        if (existingLog) {
          return jsonResponse(200, {
            ok: true,
            recorded: false,
            duplicate: true,
            message: "تم تسجيل تنزيل هذا المود مسبقاً خلال الـ 24 ساعة الماضية."
          }, cors);
        }

        const country = await resolveCountry(request, clientIp, env);
        const logId = "mdl_" + crypto.randomUUID();
        const nowIso = new Date().toISOString();

        await logsDb
          .prepare(
            `INSERT INTO mod_download_logs (id, modId, userId, deviceId, ip, country, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(logId, modId, userId, deviceId, clientIp, country, nowIso)
          .run();

        // Increment downloads in overmods-content if contentDb is available
        if (contentDb) {
          try {
            const modRow = await contentDb.prepare(`SELECT stats FROM mods WHERE id = ? LIMIT 1`).bind(modId).first();
            if (modRow) {
              const stats = parseJsonField(modRow.stats, {
                views: 0,
                uniqueViews: 0,
                downloads: 0,
                likes: 0,
                dislikes: 0,
                averageRating: 0,
                ratingCount: 0,
                totalRatingScore: 0
              });
              stats.downloads = (Number(stats.downloads) || 0) + 1;
              await contentDb
                .prepare(`UPDATE mods SET stats = ?, updatedAt = ? WHERE id = ?`)
                .bind(JSON.stringify(stats), nowIso, modId)
                .run();
            }
          } catch (e) {
            console.warn("Failed to increment mod downloads in contentDb:", e?.message);
          }
        }

        return jsonResponse(200, {
          ok: true,
          recorded: true,
          duplicate: false,
          logId,
          country
        }, cors);
      }

      // POST /logs/record-post-view (Record Community Post View)
      if (
        (path === "/logs/record-post-view" ||
         path === "/record-post-view" ||
         path === "/api/record-post-view" ||
         path === "/content/posts/record-view") &&
        request.method === "POST"
      ) {
        const body = await readJsonBody(request).catch(() => ({}));
        const postId = (body.postId || url.searchParams.get("postId") || "").trim();
        if (!postId) {
          throw new HttpError(400, "INVALID_POST_ID", "معرّف المنشور مطلوب.");
        }

        // Verify Firebase Auth token if present
        const authCtx = await extractAuth(request, env);
        const viewerId = authCtx ? authCtx.uid : null;

        // Extract client IP strictly from trusted server headers (never client body)
        const clientIp = getClientIp(request);

        // Sanitize deviceId
        let deviceId = "unknown_device";
        if (typeof body.deviceId === "string" && /^[A-Za-z0-9_-]{8,128}$/.test(body.deviceId)) {
          deviceId = body.deviceId;
        }

        // 24-hour Deduplication window
        const windowLimit = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        let existingLog = null;
        if (viewerId) {
          existingLog = await logsDb
            .prepare(`SELECT id FROM post_view_logs WHERE postId = ? AND viewerId = ? AND createdAt >= ? LIMIT 1`)
            .bind(postId, viewerId, windowLimit)
            .first();
        } else {
          existingLog = await logsDb
            .prepare(`SELECT id FROM post_view_logs WHERE postId = ? AND ip = ? AND viewerId IS NULL AND createdAt >= ? LIMIT 1`)
            .bind(postId, clientIp, windowLimit)
            .first();
        }

        if (existingLog) {
          return jsonResponse(200, {
            ok: true,
            recorded: false,
            duplicate: true,
            message: "تم تسجيل مشاهدة هذا المنشور مسبقاً خلال الـ 24 ساعة الماضية."
          }, cors);
        }

        const country = await resolveCountry(request, clientIp, env);
        const logId = "pvl_" + crypto.randomUUID();
        const nowIso = new Date().toISOString();

        await logsDb
          .prepare(
            `INSERT INTO post_view_logs (id, postId, viewerId, deviceId, ip, country, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(logId, postId, viewerId, deviceId, clientIp, country, nowIso)
          .run();

        // Increment post views in community_posts raw_data if contentDb is available
        if (contentDb) {
          try {
            const postRow = await contentDb.prepare(`SELECT raw_data FROM community_posts WHERE id = ? LIMIT 1`).bind(postId).first();
            if (postRow) {
              const raw = parseJsonField(postRow.raw_data, {});
              raw.views = (Number(raw.views) || 0) + 1;
              await contentDb
                .prepare(`UPDATE community_posts SET raw_data = ?, updatedAt = ? WHERE id = ?`)
                .bind(JSON.stringify(raw), nowIso, postId)
                .run();
            }
          } catch (e) {
            console.warn("Failed to increment post views in contentDb:", e?.message);
          }
        }

        return jsonResponse(200, {
          ok: true,
          recorded: true,
          duplicate: false,
          logId,
          country
        }, cors);
      }

      // GET /logs/stats (Mod or Post statistics from overmods_logs)
      if ((path === "/logs/stats" || path === "/api/logs/stats") && request.method === "GET") {
        const modId = url.searchParams.get("modId");
        const postId = url.searchParams.get("postId");

        if (modId) {
          const viewStats = await logsDb
            .prepare(
              `SELECT COUNT(*) as totalViews, COUNT(DISTINCT CASE WHEN userId IS NOT NULL THEN userId ELSE ip END) as uniqueViews FROM mod_view_logs WHERE modId = ?`
            )
            .bind(modId)
            .first();

          const dlStats = await logsDb
            .prepare(
              `SELECT COUNT(*) as totalDownloads, COUNT(DISTINCT CASE WHEN userId IS NOT NULL THEN userId ELSE ip END) as uniqueDownloads FROM mod_download_logs WHERE modId = ?`
            )
            .bind(modId)
            .first();

          return jsonResponse(200, {
            ok: true,
            modId,
            views: Number(viewStats?.totalViews || 0),
            uniqueViews: Number(viewStats?.uniqueViews || 0),
            downloads: Number(dlStats?.totalDownloads || 0),
            uniqueDownloads: Number(dlStats?.uniqueDownloads || 0)
          }, cors);
        }

        if (postId) {
          const postStats = await logsDb
            .prepare(
              `SELECT COUNT(*) as totalViews, COUNT(DISTINCT CASE WHEN viewerId IS NOT NULL THEN viewerId ELSE ip END) as uniqueViews FROM post_view_logs WHERE postId = ?`
            )
            .bind(postId)
            .first();

          return jsonResponse(200, {
            ok: true,
            postId,
            views: Number(postStats?.totalViews || 0),
            uniqueViews: Number(postStats?.uniqueViews || 0)
          }, cors);
        }

        // Summary metrics across overmods_logs
        const totalModViews = await logsDb.prepare(`SELECT COUNT(*) as count FROM mod_view_logs`).first();
        const totalModDownloads = await logsDb.prepare(`SELECT COUNT(*) as count FROM mod_download_logs`).first();
        const totalPostViews = await logsDb.prepare(`SELECT COUNT(*) as count FROM post_view_logs`).first();

        return jsonResponse(200, {
          ok: true,
          database: "overmods_logs",
          totalModViews: Number(totalModViews?.count || 0),
          totalModDownloads: Number(totalModDownloads?.count || 0),
          totalPostViews: Number(totalPostViews?.count || 0)
        }, cors);
      }

      /* ==================== 18. 404 NOT FOUND ==================== */
      return jsonResponse(404, { ok: false, error: { code: "NOT_FOUND", message: `المسار ${path} غير موجود في الخادم الموحد.` } }, cors);

    } catch (err) {
      return errorResponse(err, cors);
    }
  }
};
