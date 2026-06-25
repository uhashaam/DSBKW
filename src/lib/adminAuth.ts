const STORAGE_KEY = "dsbkw_admin_auth_v1";

// NOTE: This project is built with `output: 'export'` (static export).
// This login gate is a *client-side* protection layer for the admin UI,
// not a secure server-side authentication mechanism.

const ADMIN_EMAIL = "cyseox@gmail.com";
const ADMIN_USERNAME = "cyseox";
const SALT = "dsbkw_admin_v1";
// sha256("Kengnu@11123|dsbkw_admin_v1")
const ADMIN_PASSWORD_SHA256 = "bdd5b6e6d2aec51898db59f6057834c6e30995fb1e6e27fb8595372966cf06a7";

function normalizeIdentifier(v: string) {
  return (v || "").trim().toLowerCase();
}

function toHex(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(input: string) {
  // Browser WebCrypto
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return toHex(hash);
}

export async function verifyAdminCredentials(identifier: string, password: string) {
  const id = normalizeIdentifier(identifier);
  const allowed =
    id === ADMIN_EMAIL.toLowerCase() || id === ADMIN_USERNAME.toLowerCase();

  if (!allowed) return false;
  if (!password) return false;

  const computed = await sha256Hex(`${password}|${SALT}`);
  return computed === ADMIN_PASSWORD_SHA256;
}

export function setAdminAuthed(days = 7) {
  if (typeof window === "undefined") return;
  const exp = Date.now() + days * 24 * 60 * 60 * 1000;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ exp }));
}

export function clearAdminAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function isAdminAuthed() {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as { exp?: unknown };
    return typeof parsed.exp === "number" && Date.now() < parsed.exp;
  } catch {
    return false;
  }
}

