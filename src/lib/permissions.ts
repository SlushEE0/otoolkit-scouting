type UserRole = "guest" | "member" | "admin";
type Permission = (typeof ROLES)[UserRole][number];

const guest = ["outreach:view"] as const;
const member = [...guest, "scouting:submit", "scouting:view"] as const;
const admin = [...member, "outreach:manage", "settings:edit"] as const;

const ROLES = {
  guest,
  member,
  admin
} as const;

export function hasPermission(userRole: UserRole, flag: Permission) {
  if (!userRole || !flag) return false;

  if ((ROLES[userRole] as readonly Permission[]).includes(flag)) return true;
  return false;
}
