export enum BaseStates {
  SUCCESS,
  ERROR,
  LOADING
}

export enum HostHALStates {
  UNCONFIGURED,
  ERROR,
  SUCCESS
}

export enum HostWSStates {
  DISCONNECTED,
  CONNECTING,
  CONNECTED
}

export const ErrorToString = {
  "00x01": "ENV_NOT_SET",
  "01x01": "UNKNOWN",
  "01x02": "ABORTED",
  "01x03": "ALREADY_EXISTS",
  "01x400": "INVALID",
  "01x403": "UNAUTHORIZED",
  "01x404": "NOT_FOUND"
} as const;
export type ErrorCodes = keyof typeof ErrorToString;
