import PocketBase, {
  AsyncAuthStore,
  ClientResponseError,
  ListResult,
  LocalAuthStore,
  RecordListOptions,
  RecordModel
} from "pocketbase";
import Client from "pocketbase";
import { logger } from "./logger";

import { User } from "./types/pocketbase";
import {
  getPBAuthCookie
} from "./pbServerUtils";
import { ErrorCodes } from "./states";

if (!process.env.NEXT_PUBLIC_PB_URL) {
  console.warn(
    "NEXT_PUBLIC_PB_URL is not defined. PocketBase features will be unavailable."
  );
}

export function getPBUrl(forceType?: "client" | "server") {
  const url = (() => {
    if (forceType === "server") {
      return process.env.PRIVATE_PB_URL;
    }
    if (forceType === "client") {
      return process.env.NEXT_PUBLIC_PB_URL;
    }

    if (process.env.PRIVATE_PB_URL) return process.env.PRIVATE_PB_URL;
    if (process.env.NEXT_PUBLIC_PB_URL) return process.env.NEXT_PUBLIC_PB_URL;

    return "";
  })();

  if (!url) {
    return null;
  }

  return url;
}

export function recordToImageUrl(record?: User) {
  if (!record || !record.id) return null;

  const url = getPBUrl();
  if (!url) return null;

  const fileUrl = new URL(
    `${url}/api/files/${record.collectionId}/${record.id}/${
      record.avatar
    }`
  );

  return fileUrl;
}

export class PBClientBase {
  protected pb: Client;

  protected constructor(pbInstance: Client) {
    this.pb = pbInstance;
  }

  get pbClient() {
    return this.pb;
  }

  get authStore() {
    return this.pb.authStore;
  }

  protected async executePB<T>(
    cb: () => Promise<T>
  ): Promise<[ErrorCodes, null] | [null, T]> {
    let ret: any = null;

    try {
      ret = await cb();
    } catch (error) {
      let code: ErrorCodes = "01x01";
      logger.error({ err: error }, "PocketBase operation failed");
      if (!(error instanceof ClientResponseError)) {
        return [code, null];
      }

      if (error.isAbort) {
        code = "01x02";
      } else {
        code = `01x${error.status}` as any;
      }

      return [code, null];
    }

    return [null, ret];
  }

  getOne<T extends RecordModel>(
    collection: string,
    id: string,
    options?: RecordListOptions
  ) {
    return this.executePB<T>(async () =>
      this.pb.collection(collection).getOne<T>(id, options)
    );
  }

  getFirstListItem<T extends RecordModel>(
    collection: string,
    query: string,
    options?: RecordListOptions
  ) {
    return this.executePB<T>(async () =>
      this.pb.collection(collection).getFirstListItem<T>(query, options)
    );
  }

  createOne<T extends RecordModel>(
    collection: string,
    data: Record<string, any> | FormData,
    options?: Record<string, any>
  ): Promise<[ErrorCodes, null] | [null, T]> {
    return this.executePB(async () =>
      this.pb.collection(collection).create<T>(data, options)
    );
  }

  getList<T extends RecordModel>(
    collection: string,
    page: number,
    perPage: number,
    options?: RecordListOptions
  ): Promise<[ErrorCodes, null] | [null, ListResult<T>]> {
    return this.executePB(() =>
      this.pb.collection(collection).getList<T>(page, perPage, options)
    );
  }

  getFullList<T extends RecordModel>(
    collection: string,
    options?: RecordListOptions,
    batch?: number
  ): Promise<[ErrorCodes, null] | [null, T[]]> {
    return this.executePB(() =>
      this.pb.collection(collection).getFullList<T>(batch, options)
    );
  }

  updateOne<T extends RecordModel>(
    collection: string,
    id: string,
    data: Record<string, any> | FormData,
    options?: Record<string, any>
  ): Promise<[ErrorCodes, null] | [null, T]> {
    return this.executePB(() =>
      this.pb.collection(collection).update<T>(id, data, options)
    );
  }

  deleteOne(
    collection: string,
    id: string,
    options?: Record<string, any>
  ): Promise<[ErrorCodes, null] | [null, true]> {
    return this.executePB(async () => {
      await this.pb.collection(collection).delete(id, options);
      return true as const;
    });
  }
}

export class PBBrowser extends PBClientBase {
  static instance: PBBrowser | null = null;

  private constructor() {
    const url = getPBUrl("client");
    super(new PocketBase(url || "http://localhost:8090"));
  }

  static getClient() {
    if (!PBBrowser.instance) {
      PBBrowser.instance = new PBBrowser();
    }
    return PBBrowser.instance;
  }
}

export class PBServer extends PBClientBase {
  private constructor(cookie: string = "") {
    const authStore = new LocalAuthStore();

    authStore.loadFromCookie(cookie);

    const url = getPBUrl("server");
    super(new PocketBase(url || "http://localhost:8090", authStore));
  }

  static async getClient() {
    const cookie = await getPBAuthCookie();
    return new PBServer(cookie);
  }

  static getPBClient() {
    const instance = new PBServer();
    return instance.pbClient;
  }
}
