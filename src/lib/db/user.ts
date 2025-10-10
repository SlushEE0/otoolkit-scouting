import { Dispatch, SetStateAction } from "react";
import { ClientResponseError } from "pocketbase";
import { pb } from "@/lib/pbaseClient";
import type { User, UserData } from "@/lib/types/pocketbase";
import { PB_Codes } from "@/lib/states";
import { setPocketbaseCookie } from "../pbaseServer";
import { logger } from "../logger";

export async function newUser(email: string, password: string, name: string) {
  try {
    const preExisting = await pb
      .collection("users")
      .getFirstListItem(`email="${email}"`);

    if (preExisting.id) return ["ALREADY_EXISTS", null];
  } catch (error: any) {}

  const res1 = await createUser(email, password, name);
  if (res1[0] instanceof ClientResponseError) {
    return [PB_Codes[res1[0].status as keyof typeof PB_Codes], null];
  }

  return [null, res1[1]];
}

export async function createUser(
  email: string,
  password: string,
  name: string
) {
  try {
    const user = await pb.collection("users").create({
      email,
      password,
      passwordConfirm: password,
      emailVisibility: true,
      name,
      role: "member"
    });

    logger.info({ userId: user.id }, "User created");
    return [null, user.id];
  } catch (error: any) {
    logger.error({ email, err: error?.message }, "User creation failed");

    return [error, null];
  }
}

export function registerAuthCallback(
  setUser: Dispatch<SetStateAction<User | null>>
) {
  return pb.authStore.onChange(async (token, record) => {
    setUser(record as User);
    setPocketbaseCookie(pb.authStore.exportToCookie());
  }, true);
}
export async function listUserData(page: number, perPage: number) {
  return await pb.collection("UserData").getList<UserData>(page, perPage, {
    expand: "user"
  });
}

export async function listAllUsers() {
  const users = await pb.collection("users").getFullList<User>({
    sort: "name"
  });
  return users;
}

export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const data = await pb
      .collection("UserData")
      .getFirstListItem<UserData>(`user='${userId}'`, {
        expand: "user"
      });
    return data;
  } catch (error: any) {
    return null;
  }
}
