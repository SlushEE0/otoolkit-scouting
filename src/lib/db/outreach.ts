import { pb } from "../pbaseClient";
import { OutreachEvent, OutreachSession } from "@/lib/types/pocketbase";
import { logger } from "../logger";

export async function fetchEvents() {
  return await pb.collection("OutreachEvents").getFullList<OutreachEvent>({
    sort: "-created"
  });
}

export async function createEvent(data: { name: string; date: string }) {
  const res = await pb.collection("OutreachEvents").create(data);
  logger.info({ eventId: res.id, name: data.name }, "Outreach event created");
  return res;
}

export async function updateEvent(
  id: string,
  data: Partial<Pick<OutreachEvent, "name" | "date">>
) {
  const res = await pb.collection("OutreachEvents").update(id, data);
  logger.info({ eventId: id, ...data }, "Outreach event updated");
  return res;
}

export async function deleteEvent(id: string) {
  await pb.collection("OutreachEvents").delete(id);
  logger.warn({ eventId: id }, "Outreach event deleted");
}

export async function fetchSessionsForEvent(eventId: string) {
  return await pb.collection("OutreachSessions").getFullList<OutreachSession>({
    filter: `event = "${eventId}"`,
    expand: "user",
    sort: "-created"
  });
}

export async function deleteSession(id: string) {
  await pb.collection("OutreachSessions").delete(id);
  logger.warn({ sessionId: id }, "Outreach session deleted");
}

export async function createSessionsBulk(
  sessions: { userId: string; eventId: string; minutes: number }[]
) {
  const created = await Promise.all(
    sessions.map((s) =>
      pb.collection("OutreachSessions").create(
        {
          user: s.userId,
          event: s.eventId,
          minutes: s.minutes
        },
        { requestKey: null }
      )
    )
  );
  logger.info(
    { count: created.length, eventId: sessions[0]?.eventId },
    "Bulk outreach sessions created"
  );
  return created;
}

export async function fetchUserSessionEventDates(userId: string) {
  const results = await pb
    .collection("OutreachSessions")
    .getFullList<OutreachSession>({
      filter: `user="${userId}"`,
      expand: "event"
    });
  return results.map((r) => r.expand?.event?.date).filter(Boolean) as string[];
}