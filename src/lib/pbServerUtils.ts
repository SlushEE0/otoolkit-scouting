"use server";

import "server-only";

import { cookies } from "next/headers";

const COOKIE_NAME = "pb_auth_token";
const COOKIE_EXPIRATION_DAYS =
  parseInt(process.env.COOKIE_EXPIRATION_DAYS || "") || 30;

const cookieExpirationMS = 1000 * 60 * 60 * 24 * COOKIE_EXPIRATION_DAYS;

export async function setPBAuthCookie(value: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, value, {
    expires: new Date(Date.now() + cookieExpirationMS),
    secure: false,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    domain: process.env.COOKIE_DOMAIN || undefined
  });
}

export async function getPBAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || "";
}

export async function clearPBAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
