import { Dispatch, SetStateAction } from "react";
import type { ListResult } from "pocketbase";

import type { User, UserData } from "@/lib/types/pocketbase";
import { clearPBAuthCookie } from "../pbServerUtils";
import { PBClientBase } from "../pb";
import { ErrorCodes } from "../states";

export function registerAuthCallback(
  setUser: Dispatch<SetStateAction<User | null>>,
  client: PBClientBase
) {
  const authStore = client.authStore;

  return authStore.onChange(async (token, record) => {
    setUser(record as User | null);
    clearPBAuthCookie();
  }, true);
}

export async function listUserData(
  page: number,
  perPage: number,
  client: PBClientBase
): Promise<[ErrorCodes, null] | [null, ListResult<UserData>]> {
  return client.getList<UserData>("UserData", page, perPage, {
    expand: "user"
  });
}

export async function listAllUsers(
  client: PBClientBase
): Promise<[ErrorCodes, null] | [null, User[]]> {
  return client.getFullList<User>("users", { sort: "name" });
}

export async function getUserData(
  userId: string,
  client: PBClientBase
): Promise<[ErrorCodes, null] | [null, UserData]> {
  const [error, data] = await client.getFirstListItem<UserData>(
    "UserData",
    `user='${userId.replace(/'/g, "\\'")}'`,
    { expand: "user" }
  );
  if (error) {
    return [error, null];
  }

  return [null, data];
}
