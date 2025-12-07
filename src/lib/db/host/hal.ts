import { loadLocalSettings, validateLocalSettings } from "../settings";

import { HostHALStates, HostWSStates } from "@/lib/states";

let ws: WebSocket | null = null;

export function hal_getState() {
  if (!ws) {
    return HostWSStates.DISCONNECTED;
  }
  if (ws.readyState === WebSocket.CONNECTING) {
    return HostWSStates.CONNECTING;
  }
  if (ws.readyState === WebSocket.OPEN) {
    return HostWSStates.CONNECTED;
  }

  return HostWSStates.DISCONNECTED;
}

export function hal_connect() {
  if (ws) return HostHALStates.SUCCESS;

  const settings = validateLocalSettings(loadLocalSettings());
  const hostUrl = settings.data?.hostUrl;

  if (!hostUrl) {
    return HostHALStates.UNCONFIGURED;
  }

  ws = new WebSocket(hostUrl);

  return HostHALStates.SUCCESS;
}

export function hal_disconnect() {
  if (ws) {
    ws.close();
    ws = null;
  }
}

export function hal_getWebSocket() {
  return ws;
}

export function hal_registerHandlers(
  onmessage: (ev: MessageEvent<any>) => void,
  onopen?: () => void,
  onclose?: () => void,
  onerror?: (ev: Event) => void
) {
  if (!ws) {
    return HostHALStates.ERROR;
  }

  ws.onopen = () => {
    console.log("P2P HAL connected");
    ws = hal_getWebSocket();
  };

  ws.onclose = () => {
    console.log("P2P HAL disconnected");
  };

  ws.onerror = (error) => {
    console.error("P2P HAL error:", error);
  };

  ws.onmessage = onmessage;

  return HostHALStates.SUCCESS;
}
