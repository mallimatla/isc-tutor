const DEFAULT_ADMIN_EMAILS = "mallimatla@gmail.com";

function getAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS || DEFAULT_ADMIN_EMAILS;
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().has(email.toLowerCase());
}
