import { User } from "./types/pocketbase";

type Permission = (typeof ROLES)[User["role"]][number];

const guest = ["outreach:view"] as const;
const member = [...guest, "scouting:submit", "scouting:view"] as const;
const admin = [...member, "outreach:manage", "settings:edit"] as const;

const ROLES = {
  guest,
  member,
  admin
} as const;

export function hasPermission(userRole: User["role"], flag: Permission) {
  if (!userRole || !flag) return false;

  if ((ROLES[userRole] as readonly Permission[]).includes(flag)) return true;
  return false;
}
