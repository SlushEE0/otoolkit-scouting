"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { ScoutingEntry } from "@/lib/types";

export function useEntries(configId?: string) {
  const entries = useLiveQuery(
    () => configId
      ? db.entries.where("configId").equals(configId).reverse().sortBy("submittedAt")
      : db.entries.orderBy("submittedAt").reverse().toArray(),
    [configId]
  ) ?? [];

  const unsentCount = useLiveQuery(
    () => db.entries.filter((e) => !e.exported).count(),
    []
  ) ?? 0;

  async function saveEntry(entry: ScoutingEntry) {
    await db.entries.add(entry);
  }

  async function markExported(id: string) {
    await db.entries.update(id, { exported: true });
  }

  async function deleteEntry(id: string) {
    await db.entries.delete(id);
  }

  return { entries, saveEntry, markExported, deleteEntry, unsentCount };
}
