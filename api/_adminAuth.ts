import crypto from "node:crypto";

export const ADMIN_COOKIE_NAME = "eugenia_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type CookieOptions = {
  maxAge?: number;
};

export type VercelRequestLike = {
  headers?: {
    cookie?: string;
  };
};

export type VercelResponseLike = {
  setHeader: (name: string, value: string | string[]) => void;
};

function getAdminSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? "";
}

function sign(value: string) {
  return crypto.createHmac("sha256", getAdminSecret()).update(value).digest("base64url");
}

function safeEqual(first: string, second: string) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);

  return firstBuffer.length === secondBuffer.length && crypto.timingSafeEqual(firstBuffer, secondBuffer);
}

export function createAdminToken(username: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${username}.${expiresAt}`;

  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token?: string) {
  if (!token || !getAdminSecret()) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [username, expiresAt, signature] = parts;
  const payload = `${username}.${expiresAt}`;
  const expectedSignature = sign(payload);

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  if (Number(expiresAt) < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return { username };
}

export function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce<Record<string, string>>((cookies, cookie) => {
    const [name, ...valueParts] = cookie.trim().split("=");

    if (name) {
      cookies[name] = decodeURIComponent(valueParts.join("="));
    }

    return cookies;
  }, {});
}

export function getAdminSession(request: VercelRequestLike) {
  const cookies = parseCookies(request.headers?.cookie);
  return verifyAdminToken(cookies[ADMIN_COOKIE_NAME]);
}

export function serializeAdminCookie(value: string, options: CookieOptions = {}) {
  const attributes = [
    `${ADMIN_COOKIE_NAME}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${options.maxAge ?? SESSION_TTL_SECONDS}`,
  ];

  if (process.env.NODE_ENV === "production") {
    attributes.push("Secure");
  }

  return attributes.join("; ");
}

export function setAdminCookie(response: VercelResponseLike, token: string) {
  response.setHeader("Set-Cookie", serializeAdminCookie(token));
}

export function clearAdminCookie(response: VercelResponseLike) {
  response.setHeader("Set-Cookie", serializeAdminCookie("", { maxAge: 0 }));
}
