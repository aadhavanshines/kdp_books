/**
 * Server-Sent Events that work in React Native and on the web.
 *
 * Browsers have EventSource. React Native does not, but its XMLHttpRequest
 * delivers the response text incrementally while it streams (when an
 * onprogress handler is set), so on native we read the stream through XHR
 * and parse it with SSEParser.
 */

export interface SSEMessage {
  /** The `event:` field, or "message". */
  event: string;
  data: string;
  /** The `id:` field, if any. */
  id: string | null;
}

/** Incremental parser for the text/event-stream format. */
export class SSEParser {
  private buffer = '';
  private data: string[] = [];
  private event = '';
  private id: string | null = null;
  /** The last event id seen (sent back as Last-Event-ID on reconnect). */
  lastEventId: string | null = null;
  /** Server-requested reconnection delay (`retry:`), in ms. */
  retry: number | null = null;

  constructor(private onMessage: (message: SSEMessage) => void) {}

  feed(chunk: string): void {
    this.buffer += chunk;
    // Lines end with \n, \r\n or \r.
    const lines = this.buffer.split(/\r\n|\r|\n/);
    this.buffer = lines.pop() ?? '';
    for (const line of lines) this.line(line);
  }

  reset(): void {
    this.buffer = '';
    this.data = [];
    this.event = '';
    this.id = null;
  }

  private line(line: string) {
    if (line === '') {
      this.dispatch();
      return;
    }
    if (line.startsWith(':')) return; // comment / keep-alive
    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? '' : line.slice(colon + 1);
    if (value.startsWith(' ')) value = value.slice(1);
    switch (field) {
      case 'data':
        this.data.push(value);
        break;
      case 'event':
        this.event = value;
        break;
      case 'id':
        if (!value.includes('\0')) this.id = value;
        break;
      case 'retry':
        if (/^\d+$/.test(value)) this.retry = Number(value);
        break;
      default:
        break;
    }
  }

  private dispatch() {
    if (this.id != null) this.lastEventId = this.id;
    if (this.data.length > 0) {
      this.onMessage({ event: this.event || 'message', data: this.data.join('\n'), id: this.id });
    }
    this.data = [];
    this.event = '';
    this.id = null;
  }
}

export interface EventStreamOptions {
  /** Named events to listen for (EventSource needs them up front). "message" is always included. */
  events?: string[];
  onMessage: (message: SSEMessage) => void;
  onOpen?: () => void;
  onError?: (error: Error) => void;
  /** Extra request headers. Forces the XHR transport. */
  headers?: Record<string, string>;
  /** Delay before reconnecting, in ms (the server's `retry:` wins). */
  retryMs?: number;
  /** Give up after this many reconnects in a row. */
  maxRetries?: number;
  /** 'auto' uses EventSource when available and no headers are set. */
  transport?: 'auto' | 'eventsource' | 'xhr';
}

export interface EventStream {
  close(): void;
  readonly closed: boolean;
}

interface EventSourceLike {
  addEventListener(type: string, listener: (event: { data?: string; lastEventId?: string }) => void): void;
  close(): void;
  onopen: (() => void) | null;
  onerror: (() => void) | null;
  readyState: number;
}

type EventSourceCtor = new (url: string) => EventSourceLike;

function getEventSource(): EventSourceCtor | null {
  const ctor = (globalThis as { EventSource?: unknown }).EventSource;
  return typeof ctor === 'function' ? (ctor as EventSourceCtor) : null;
}

/** Opens an SSE connection with automatic reconnects. */
export function openEventStream(url: string, options: EventStreamOptions): EventStream {
  const transport = options.transport ?? 'auto';
  const EventSourceImpl = getEventSource();
  const useEventSource = transport === 'eventsource' || (transport === 'auto' && EventSourceImpl && !options.headers);
  if (useEventSource && EventSourceImpl) return viaEventSource(EventSourceImpl, url, options);
  return viaXhr(url, options);
}

function viaEventSource(Impl: EventSourceCtor, url: string, options: EventStreamOptions): EventStream {
  let closed = false;
  const source = new Impl(url);
  const names = new Set(['message', ...(options.events ?? [])]);
  for (const name of names) {
    source.addEventListener(name, (e) => {
      if (closed) return;
      options.onMessage({ event: name, data: e.data ?? '', id: e.lastEventId || null });
    });
  }
  source.onopen = () => options.onOpen?.();
  // EventSource reconnects by itself; just report the hiccup.
  source.onerror = () => {
    if (!closed) options.onError?.(new Error('Event stream interrupted'));
  };
  return {
    close() {
      closed = true;
      source.close();
    },
    get closed() {
      return closed;
    },
  };
}

function viaXhr(url: string, options: EventStreamOptions): EventStream {
  let closed = false;
  let xhr: XMLHttpRequest | null = null;
  let retries = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const maxRetries = options.maxRetries ?? Infinity;
  const parser = new SSEParser((message) => {
    if (!closed) options.onMessage(message);
  });

  const scheduleReconnect = () => {
    if (closed) return;
    if (retries >= maxRetries) {
      closed = true;
      return;
    }
    retries += 1;
    const delay = parser.retry ?? options.retryMs ?? Math.min(30_000, 1000 * 2 ** Math.min(retries - 1, 5));
    timer = setTimeout(connect, delay);
  };

  function connect() {
    if (closed) return;
    parser.reset();
    let seen = 0;
    const request = new XMLHttpRequest();
    xhr = request;
    request.open('GET', url, true);
    request.setRequestHeader('Accept', 'text/event-stream');
    request.setRequestHeader('Cache-Control', 'no-cache');
    if (parser.lastEventId) request.setRequestHeader('Last-Event-ID', parser.lastEventId);
    for (const [k, v] of Object.entries(options.headers ?? {})) request.setRequestHeader(k, v);

    const read = () => {
      const text = request.responseText ?? '';
      if (text.length > seen) {
        parser.feed(text.slice(seen));
        seen = text.length;
      }
    };
    // React Native only streams responseText when a progress handler is set.
    request.onprogress = read;
    request.onreadystatechange = () => {
      if (request.readyState === 2 /* HEADERS_RECEIVED */) {
        if (request.status >= 200 && request.status < 300) {
          retries = 0;
          options.onOpen?.();
        }
      } else if (request.readyState === 3 /* LOADING */) {
        read();
      } else if (request.readyState === 4 /* DONE */) {
        read();
        if (closed || xhr !== request) return;
        if (request.status === 0 || request.status >= 400) {
          options.onError?.(new Error(request.status ? `Event stream failed (${request.status})` : 'Event stream disconnected'));
          // Auth and missing resources will not fix themselves.
          if (request.status === 401 || request.status === 403 || request.status === 404) {
            closed = true;
            return;
          }
        }
        scheduleReconnect();
      }
    };
    request.send();
  }

  connect();
  return {
    close() {
      closed = true;
      if (timer) clearTimeout(timer);
      xhr?.abort();
      xhr = null;
    },
    get closed() {
      return closed;
    },
  };
}
