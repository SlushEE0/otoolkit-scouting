import { HostHALStates } from "@/lib/states";
import { hal_connect, hal_registerHandlers } from "./hal";

export class LocalhostScoutingDB {
  private ws: WebSocket | null = null;

  constructor() {
    const state = hal_connect();

    switch (state) {
      case HostHALStates.SUCCESS:
        break;
      case HostHALStates.UNCONFIGURED:
        console.warn("HAL WebSocket is unconfigured.");
        return;
    }

    hal_registerHandlers(
      this.onMessage.bind(this),
      this.onOpen.bind(this),
      this.onClose.bind(this),
      this.onError.bind(this)
    );
  }

  private onMessage(ev: MessageEvent<any>) {
    console.log("Received message:", ev.data);
  }

  private onOpen() {
    console.log("Connected to HAL WebSocket.");
  }

  private onClose() {
    console.log("Disconnected from HAL WebSocket.");
  }

  private onError(ev: Event) {
    console.error("HAL WebSocket error:", ev);
  }
}
