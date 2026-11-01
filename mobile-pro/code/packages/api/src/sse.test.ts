import { openEventStream, SSEParser, type SSEMessage } from './sse';

describe('SSEParser', () => {
  const parse = (...chunks: string[]) => {
    const out: SSEMessage[] = [];
    const parser = new SSEParser((m) => out.push(m));
    chunks.forEach((c) => parser.feed(c));
    return { out, parser };
  };

  it('parses named events with ids', () => {
    const { out, parser } = parse('event: status\nid: 7\ndata: {"a":1}\n\n');
    expect(out).toEqual([{ event: 'status', data: '{"a":1}', id: '7' }]);
    expect(parser.lastEventId).toBe('7');
  });

  it('handles chunks split anywhere, CRLF, multi-line data and comments', () => {
    const { out } = parse('ev', 'ent: snap', 'shot\r\ndata: line1\r\ndata: line2\r\n', '\r\n: ping\n\ndata: plain\n\n');
    expect(out).toEqual([
      { event: 'snapshot', data: 'line1\nline2', id: null },
      { event: 'message', data: 'plain', id: null },
    ]);
  });

  it('ignores events without data and reads retry', () => {
    const { out, parser } = parse('event: nothing\n\nretry: 3000\n\n');
    expect(out).toEqual([]);
    expect(parser.retry).toBe(3000);
  });

  it('keeps a value without a leading space verbatim', () => {
    expect(parse('data:x\n\n').out[0]!.data).toBe('x');
  });
});

/** A fake XMLHttpRequest that streams text in steps. */
class FakeXHR {
  static instances: FakeXHR[] = [];
  readyState = 0;
  status = 0;
  responseText = '';
  headers: Record<string, string> = {};
  url = '';
  aborted = false;
  onprogress: (() => void) | null = null;
  onreadystatechange: (() => void) | null = null;
  constructor() {
    FakeXHR.instances.push(this);
  }
  open(_m: string, url: string) {
    this.url = url;
  }
  setRequestHeader(k: string, v: string) {
    this.headers[k] = v;
  }
  send() {}
  abort() {
    this.aborted = true;
  }
  respond(status: number) {
    this.status = status;
    this.readyState = 2;
    this.onreadystatechange?.();
  }
  push(text: string) {
    this.responseText += text;
    this.readyState = 3;
    this.onprogress?.();
  }
  end() {
    this.readyState = 4;
    this.onreadystatechange?.();
  }
}

describe('openEventStream over XHR (React Native)', () => {
  const realXHR = globalThis.XMLHttpRequest;
  beforeEach(() => {
    FakeXHR.instances = [];
    (globalThis as { XMLHttpRequest: unknown }).XMLHttpRequest = FakeXHR;
    jest.useFakeTimers();
  });
  afterEach(() => {
    (globalThis as { XMLHttpRequest: unknown }).XMLHttpRequest = realXHR;
    jest.useRealTimers();
  });

  it('streams messages incrementally and reconnects with Last-Event-ID', () => {
    const messages: SSEMessage[] = [];
    const onOpen = jest.fn();
    const stream = openEventStream('http://x/events', { transport: 'xhr', onMessage: (m) => messages.push(m), onOpen, retryMs: 500 });
    const first = FakeXHR.instances[0]!;
    expect(first.headers.Accept).toBe('text/event-stream');
    first.respond(200);
    expect(onOpen).toHaveBeenCalled();
    first.push('id: 1\nevent: status\ndata: {"n":1}\n');
    expect(messages).toHaveLength(0);
    first.push('\nid: 2\ndata: {"n":2}\n\n');
    expect(messages.map((m) => m.data)).toEqual(['{"n":1}', '{"n":2}']);

    first.end();
    jest.advanceTimersByTime(500);
    const second = FakeXHR.instances[1]!;
    expect(second.headers['Last-Event-ID']).toBe('2');
    stream.close();
    expect(second.aborted).toBe(true);
    expect(stream.closed).toBe(true);
  });

  it('stops retrying on 401', () => {
    const onError = jest.fn();
    const stream = openEventStream('http://x/events', { transport: 'xhr', onMessage: jest.fn(), onError });
    const xhr = FakeXHR.instances[0]!;
    xhr.respond(401);
    xhr.end();
    jest.advanceTimersByTime(60_000);
    expect(FakeXHR.instances).toHaveLength(1);
    expect(onError).toHaveBeenCalled();
    expect(stream.closed).toBe(true);
  });

  it('does not deliver after close', () => {
    const onMessage = jest.fn();
    const stream = openEventStream('http://x/events', { transport: 'xhr', onMessage });
    const xhr = FakeXHR.instances[0]!;
    stream.close();
    xhr.push('data: late\n\n');
    expect(onMessage).not.toHaveBeenCalled();
  });
});

describe('openEventStream over EventSource (web)', () => {
  it('listens for named events and closes', () => {
    const listeners: Record<string, (e: { data?: string; lastEventId?: string }) => void> = {};
    const close = jest.fn();
    class FakeES {
      onopen: (() => void) | null = null;
      onerror: (() => void) | null = null;
      readyState = 0;
      constructor(readonly url: string) {}
      addEventListener(type: string, fn: (e: { data?: string; lastEventId?: string }) => void) {
        listeners[type] = fn;
      }
      close = close;
    }
    (globalThis as { EventSource?: unknown }).EventSource = FakeES;
    try {
      const onMessage = jest.fn();
      const stream = openEventStream('http://x/events', { events: ['status'], onMessage });
      expect(Object.keys(listeners).sort()).toEqual(['message', 'status']);
      listeners.status!({ data: '{"a":1}', lastEventId: '3' });
      expect(onMessage).toHaveBeenCalledWith({ event: 'status', data: '{"a":1}', id: '3' });
      stream.close();
      expect(close).toHaveBeenCalled();
    } finally {
      delete (globalThis as { EventSource?: unknown }).EventSource;
    }
  });
});
