import { redirect } from "next/navigation";

import { execPocketbase } from "@/lib/pbaseServer";
import type { User, UserData } from "@/lib/types/pocketbase";

import OutreachPage from "./OutreachPage";
import { hasPermission } from "@/lib/permissions";
import { getOutreachMinutesCutoff } from "@/lib/db/settings";

export default async function ServerDataFetcher() {
  const [user, userData] = await execPocketbase(async (pb) => {
    const authRecord = pb.authStore.record as User;

    let data: UserData | undefined = undefined;
    try {
      data = await pb
        .collection("UserData")
        .getFirstListItem<UserData>(`user='${authRecord.id}'`, {
          expand: "user"
        });
    } catch (e) {}

    return [authRecord, data];
  });

  const outreachMinutesCutoff = await getOutreachMinutesCutoff();

  const canManage = hasPermission(user.role, "outreach:manage");

  if (!user?.id) {
    redirect("/auth/login");
  }

  return (
    <OutreachPage {...{ canManage, user, userData, outreachMinutesCutoff }} />
  );
}
