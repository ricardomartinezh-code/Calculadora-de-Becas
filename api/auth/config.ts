export const UNIVERSITY_DOMAINS = {
  unidep: ["unidep.mx", "unidep.edu.mx", "*.unidep.edu.mx"],
} as const;

type AllowedDomains = readonly string[];

export function isAllowedDomain(domain: string, allowedDomains: AllowedDomains) {
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
