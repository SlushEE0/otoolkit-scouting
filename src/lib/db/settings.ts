"use server";

import { cache } from "react";
import { execPocketbase } from "../pbaseServer";
import { logger } from "../logger";

export const getOutreachMinutesCutoff = cache(async () => {
  const outreachMinutesCutoff = await execPocketbase(async (pb) => {
    let outreachMinutesCutoff = 900;
    try {
      const record = await pb
        .collection("Settings")
        .getFirstListItem("key='OutreachMinsCutoff'");

      outreachMinutesCutoff = parseInt(record.value) || 900;
    } catch (e: any) {
      logger.error(
        { err: e?.message },
        "[DB: Settings] Failed to fetch OutreachMinsCutoff, defaulting to 900"
      );
    }

    return outreachMinutesCutoff;
  });

  return outreachMinutesCutoff;
});
