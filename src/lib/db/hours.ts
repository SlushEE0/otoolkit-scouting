import type { OutreachEvent, OutreachSession } from "@/lib/types/pocketbase";
import { type PBClientBase } from "../pb";

import { BaseStates } from "../states";

let ManualHoursEventID = "";

export async function manualModifyOutreachHours(
  userId: string,
  deltaMinutes: number,
  client: PBClientBase
) {
  if (!ManualHoursEventID) {
    const [lookupError, manualHoursEvent] =
      await client.getFirstListItem<OutreachEvent>(
        "OutreachEvents",
        `name="ManualHours"`
      );

    if (lookupError && lookupError !== "01x404") {
      return BaseStates.ERROR;
    }

    if (!manualHoursEvent) {
      const [createError, createdEvent] =
        await client.createOne<OutreachEvent>("OutreachEvents", {
          name: "ManualHours"
        });

      if (createError || !createdEvent) {
        return BaseStates.ERROR;
      }

      ManualHoursEventID = createdEvent.id;
    } else {
      ManualHoursEventID = manualHoursEvent.id;
    }
  }

  const [sessionError, currentManualAddition] =
    await client.getFirstListItem<OutreachSession>(
      "OutreachSessions",
      `event="${ManualHoursEventID}"&&user="${userId}"`
    );

  if (!sessionError && currentManualAddition) {
    const [updateError] = await client.updateOne<OutreachSession>(
      "OutreachSessions",
      currentManualAddition.id,
      {
        minutes: currentManualAddition.minutes + deltaMinutes
      }
    );

    if (updateError) return BaseStates.ERROR;
  } else if (sessionError === "01x404") {
    const [createError] = await client.createOne<OutreachSession>(
      "OutreachSessions",
      {
        event: ManualHoursEventID,
        user: userId,
        minutes: deltaMinutes
      }
    );

    if (createError) return BaseStates.ERROR;
  } else if (sessionError) {
    return BaseStates.ERROR;
  }

  return BaseStates.SUCCESS;
}
