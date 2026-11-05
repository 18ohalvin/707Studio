declare module 'ws' {
  import { EventEmitter } from 'events';
  import type { Server as HttpServer } from 'http';

  export class WebSocket extends EventEmitter {
    static readonly CONNECTING: number;
    static readonly OPEN: number;
    static readonly CLOSING: number;
    static readonly CLOSED: number;
    readonly readyState: number;
    send(data: string | Buffer | ArrayBuffer | any[], cb?: (err?: Error) => void): void;
    close(code?: number, data?: string): void;
    on(event: 'message', listener: (data: Buffer | string, isBinary: boolean) => void): this;
    on(event: 'close', listener: (code: number, reason: Buffer) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'open', listener: () => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
  }

  export interface ServerOptions {
    server?: HttpServer;
    port?: number;
    path?: string;
  }

  export class WebSocketServer extends EventEmitter {
    constructor(options?: ServerOptions);
    clients: Set<WebSocket>;
    close(cb?: (err?: Error) => void): void;
    on(event: 'connection', listener: (socket: WebSocket, request: any) => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
  }
}

