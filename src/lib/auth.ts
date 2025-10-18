import { BaseStates } from "./states";
import { clearPBAuthCookie, setPBAuthCookie } from "./pbServerUtils";

import { pb_OAuthProvider } from "./types/pocketbase";
import { SimpleLoginStates, SignupStates } from "./states";
import { newUser } from "./db/user";
import { logger } from "./logger";
import { PBBrowser } from "./pb";

export async function loginEmailPass(
  email: string,
  password: string
): Promise<SimpleLoginStates> {
  if (!email) return SimpleLoginStates.ERR_EMAIL_NOT_PROVIDED;
  if (!password) return SimpleLoginStates.ERR_PASSWORD_NOT_PROVIDED;

  email = email.trim();

  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(value).toLowerCase());
  };

  if (!validateEmail(email)) {
    return SimpleLoginStates.ERR_INVALID_EMAIL;
  }

  if (password.length < 8) {
    return SimpleLoginStates.ERR_PASSWORD_TOO_SHORT;
  }

  const usersCol = PBBrowser.getClient().pbClient.collection("users");

  try {
    const user = await usersCol.getFirstListItem(`email="${email}"`);

    if (user.usesOAuth) {
      return SimpleLoginStates.ERR_USER_USES_OAUTH;
    }
  } catch {
    return SimpleLoginStates.ERR_EMAIL_NOT_FOUND;
  }

  try {
    const authData = await usersCol.authWithPassword(email, password);

    storeServerCookie();
    if (authData.token) return SimpleLoginStates.SUCCESS;
    else return SimpleLoginStates.ERR_UNKNOWN;
  } catch (error) {
    console.log("Login failed:", error);
    return SimpleLoginStates.ERR_INCORRECT_PASSWORD;
  }
}

export async function loginOAuth(provider: pb_OAuthProvider) {
  const authData = await PBBrowser.getClient()
    .pbClient.collection("users")
    .authWithOAuth2({
      provider,
      createData: {
        usesOAuth: true,
        role: "member"
      }
    });

  storeServerCookie();
  if (authData.token) return BaseStates.SUCCESS;
  else return BaseStates.ERROR;
}

export async function signupEmailPass(
  email: string,
  password1: string,
  password2: string,
  name: string
): Promise<SignupStates> {
  if (!email) return SignupStates.ERR_EMAIL_NOT_PROVIDED;
  if (!password1) return SignupStates.ERR_PASSWORD_NOT_PROVIDED;
  if (!password2) return SignupStates.ERR_PASSWORD_NOT_PROVIDED;
  if (!name) return SignupStates.ERR_NAME_NOT_PROVIDED;

  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(value).toLowerCase());
  };

  const validateName = (value: string) => {
    const re = /^[A-Za-z0-9]+$/;
    return re.test(String(value).toLowerCase());
  };

  if (!validateEmail(email)) {
    return SignupStates.ERR_INVALID_EMAIL;
  }

  if (name.length < 3) {
    return SignupStates.ERR_NAME_TOO_SHORT;
  }

  if (!validateName(name)) {
    return SignupStates.ERR_INVALID_NAME;
  }

  if (password1 !== password2) {
    return SignupStates.ERR_PASSWORDS_DONT_MATCH;
  }

  if (password1.length < 8) {
    return SignupStates.ERR_PASSWORD_TOO_SHORT;
  }

  const result = await newUser(email, password1, name, PBBrowser.getClient());

  if (result[0]) {
    if (result[0] === "01x03") {
      return SignupStates.ERR_ALREADY_EXISTS;
    }
    logger.error({ email, code: result[0] }, "Unknown signup error");
    return SignupStates.ERR_UNKNOWN;
  }

  // Auto-login after successful signup
  const loginResult = await loginEmailPass(email, password1);
  if (loginResult === SimpleLoginStates.SUCCESS) {
    return SignupStates.SUCCESS;
  }

  return SignupStates.ERR_UNKNOWN;
}

async function storeServerCookie() {
  setPBAuthCookie(PBBrowser.getClient().authStore.exportToCookie());
}

export function logout() {
  PBBrowser.getClient().authStore.clear();
  clearPBAuthCookie();
  window?.location.reload();
}
