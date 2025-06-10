declare module '*.css';
declare module '*.png';

declare type PagesFunction<Env = unknown, Params extends string = string, Data extends Record<string, unknown> = Record<string, unknown>> = (
  context: EventContext<Env, Params, Data>
) => Response | Promise<Response>;

declare interface EventContext<Env = unknown, Params extends string = string, Data extends Record<string, unknown> = Record<string, unknown>> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<unknown>) => void;
  passThroughOnException: () => void;
  next: (input?: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  data: Data;
  params: Record<Params, string | string[]>;
  env: Env & {
    ASSETS: { fetch: (request: Request) => Promise<Response> };
  };
} 