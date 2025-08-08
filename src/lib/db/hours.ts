import type { RecordModel } from "pocketbase";
import { pb } from "../pbaseClient";
import { BaseStates } from "../states";

let ManualHoursEventID = "";

export async function manualModifyOutreachHours(
  userId: string,
  deltaMinutes: number
) {
  if (!ManualHoursEventID) {
    let manualHoursEvent: RecordModel | null = null;

    try {
      manualHoursEvent = await pb
        .collection("OutreachEvents")
        .getFirstListItem(`name="ManualHours"`);
    } catch {
      try {
        manualHoursEvent = await pb.collection("OutreachEvents").create({
          name: "ManualHours"
        });
      } catch {
        return BaseStates.ERROR;
      }
    } finally {
      if (!manualHoursEvent) return BaseStates.ERROR;

      ManualHoursEventID = manualHoursEvent.id;
    }
  }

  try {
    const currentManualAddition = await pb
      .collection("OutreachSessions")
      .getFirstListItem(`event="${ManualHoursEventID}"&&user="${userId}"`);

    await pb.collection("OutreachSessions").update(currentManualAddition.id, {
      minutes: currentManualAddition.minutes + deltaMinutes
    });
  } catch {
    try {
      await pb.collection("OutreachSessions").create({
        event: ManualHoursEventID,
        user: userId,
        minutes: deltaMinutes
      });
    } catch {
      return BaseStates.ERROR;
    }
  }
  return BaseStates.SUCCESS;
}
