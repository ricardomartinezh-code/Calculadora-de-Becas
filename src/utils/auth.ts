export type AuthSession = {
  email: string;
  slug: string;
};

const STORAGE_KEY = "recalc_auth_session";

export function getEmailDomain(email: string): string {
  const parts = email.trim().toLowerCase().split("@");
  return parts.length === 2 ? parts[1] : "";
}

export function isAllowedDomain(domain: string, allowedDomains: readonly string[]) {
  const normalized = domain.trim().toLowerCase();
  if (!normalized) return false;
  return allowedDomains.some((entry) => {
    const allowed = entry.toLowerCase();
    if (allowed.startsWith("*.")) {
      const base = allowed.slice(2);
      return normalized !== base && normalized.endsWith(`.${base}`);
    }
    return normalized === allowed;
  });
}

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.email || !parsed?.slug) return null;
    return parsed;
  } catch (err) {
    return null;
  }
}

export function setStoredSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
