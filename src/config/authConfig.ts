/**
 * Authentication & District Domain Configuration
 *
 * Restricted to Gonzales Unified School District staff accounts (@gonzales.k12.ca.us).
 *
 * IMPORTANT: Keep `ALLOWED_DOMAIN` synchronized with `allowedDomain()` in
 * `firestore.rules` and redeploy rules whenever changing this value.
 */
export const ALLOWED_DOMAIN: string = 'gonzales.k12.ca.us';

export const BOOTSTRAP_ADMIN_EMAIL = 'pdietrich@gonzales.k12.ca.us';

export const SCHOOL_YEAR = '2026-2027' as const;

export function isEmailAllowedForDomain(email: string | null | undefined): boolean {
  if (!ALLOWED_DOMAIN) {
    return Boolean(email);
  }
  if (!email) {
    return false;
  }
  const normalizedDomain = ALLOWED_DOMAIN.replace(/^@/, '').trim().toLowerCase();
  const parts = email.trim().toLowerCase().split('@');
  return parts.length === 2 && parts[0].length > 0 && parts[1] === normalizedDomain;
}
