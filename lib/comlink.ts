import { parentPort, Worker } from "worker_threads";
import path from "path";

import * as Comlink from "comlink";
import nodeEndpoint, { NodeEndpoint } from "comlink/dist/umd/node-adapter";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callable = (...args: any[]) => any;

export function wrap<T extends Callable>(workerPath: string): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  const fn = Comlink.wrap<T>(nodeEndpoint(new Worker(path.join(__dirname, workerPath))));

  async function call(...args: Parameters<T>): Promise<ReturnType<T>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await fn(...args);
    } finally {
      fn[Comlink.releaseProxy]();
    }
  }

  return call;
}

export function expose(fn: unknown): void {
  Comlink.expose(fn, nodeEndpoint(parentPort as NodeEndpoint));
}
