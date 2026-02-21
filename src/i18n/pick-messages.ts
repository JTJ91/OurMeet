type MessageNode = Record<string, unknown>;

function isObject(value: unknown): value is MessageNode {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneNode<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => cloneNode(item)) as T;
  if (isObject(value)) {
    const next: MessageNode = {};
    for (const [k, v] of Object.entries(value)) {
      next[k] = cloneNode(v);
    }
    return next as T;
  }
  return value;
}

export function pickMessages(
  messages: MessageNode,
  namespaces: readonly string[]
): MessageNode {
  const out: MessageNode = {};

  for (const ns of namespaces) {
    const segments = ns.split(".").filter(Boolean);
    if (!segments.length) continue;

    let src: unknown = messages;
    for (const key of segments) {
      if (!isObject(src) || !(key in src)) {
        src = undefined;
        break;
      }
      src = src[key];
    }
    if (src === undefined) continue;

    let dst: MessageNode = out;
    for (let i = 0; i < segments.length - 1; i++) {
      const key = segments[i];
      const existing = dst[key];
      if (!isObject(existing)) {
        dst[key] = {};
      }
      dst = dst[key] as MessageNode;
    }
    dst[segments[segments.length - 1]] = cloneNode(src);
  }

  return out;
}

