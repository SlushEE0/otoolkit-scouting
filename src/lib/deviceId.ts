/**
 * Device ID Generator
 *
 * Generates a unique device identifier on first use and persists it
 * in localStorage. This ID is used to tag every scouting submission
 * so that data from different devices can be distinguished later.
 */

import { v4 as uuidv4 } from "uuid";

const DEVICE_ID_KEY = "otoolkit:deviceId";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";

  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}
