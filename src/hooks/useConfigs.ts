"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { ScoutingConfig } from "@/lib/types";

export function useConfigs() {
  const configs = useLiveQuery(() => db.configs.orderBy("savedAt").reverse().toArray(), []) ?? [];
  const activeConfig = configs.find((c) => c.isActive) ?? null;

  async function saveConfig(config: ScoutingConfig) {
    await db.transaction("rw", db.configs, async () => {
      await db.configs.toCollection().modify({ isActive: false });
      await db.configs.add({ ...config, isActive: true });
    });
  }

  async function setActiveConfig(id: string) {
    await db.transaction("rw", db.configs, async () => {
      await db.configs.toCollection().modify({ isActive: false });
      await db.configs.update(id, { isActive: true });
    });
  }

  async function deleteConfig(id: string) {
    await db.configs.delete(id);
  }

  return { configs, activeConfig, saveConfig, setActiveConfig, deleteConfig };
}
