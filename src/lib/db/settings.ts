import { logger } from "../logger";

import { type PBClientBase } from "../pb";

export async function getOutreachMinutesCutoff(client: PBClientBase) {
  const [error, record] = await client.getFirstListItem(
    "Settings",
    "key='OutreachMinsCutoff'"
  );

  if (error) {
    logger.error({ key: "OutreachMinsCutoff", code: error }, "Failed to fetch outreach minutes cutoff");
    return 900;
  }

  const outreachMinutesCutoff = parseInt(record.value) || 900;
  return outreachMinutesCutoff;
}
