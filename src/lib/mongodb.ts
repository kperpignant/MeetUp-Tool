import mongoose from "mongoose";
import dns from "node:dns";

// Some local environments (corporate AV, VPNs, ad-blocking DNS proxies, etc.)
// configure the OS DNS resolver in a way that breaks Node's built-in lookups
// (`dns.promises.resolve*` and `dns.lookup`/`getaddrinfo`). When that happens,
// `mongodb+srv://` URIs fail with `querySrv ECONNREFUSED` even though the
// network and Atlas cluster are fine.
//
// To stay portable we always perform Atlas SRV/TXT resolution and shard
// hostname lookups through an explicit public DNS resolver, then hand the
// driver a non-SRV URI. This avoids depending on the OS resolver at all.
const PUBLIC_DNS_SERVERS = ["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"];
const publicResolver = new dns.promises.Resolver();
publicResolver.setServers(PUBLIC_DNS_SERVERS);

async function resolveAtlasSrvUri(srvUri: string): Promise<string> {
  const url = new URL(srvUri);
  const host = url.hostname;
  const srvName = `_mongodb._tcp.${host}`;

  const [srvRecords, txtRecordArr] = await Promise.all([
    publicResolver.resolveSrv(srvName),
    publicResolver.resolveTxt(host).catch(() => [] as string[][]),
  ]);

  if (!srvRecords || srvRecords.length === 0) {
    throw new Error(`No SRV records found for ${srvName}`);
  }

  const shards = srvRecords.map((r) => `${r.name}:${r.port}`).join(",");
  const txtOptions = txtRecordArr.map((chunks) => chunks.join("")).join("&");

  const userInfo = url.username
    ? `${url.username}${url.password ? ":" + url.password : ""}@`
    : "";
  const db = url.pathname || "/";

  const existingQuery = url.search.startsWith("?") ? url.search.slice(1) : "";
  const mergedParams = new URLSearchParams();
  if (txtOptions) {
    for (const [k, v] of new URLSearchParams(txtOptions).entries()) {
      mergedParams.set(k, v);
    }
  }
  if (existingQuery) {
    for (const [k, v] of new URLSearchParams(existingQuery).entries()) {
      mergedParams.set(k, v);
    }
  }
  // SRV URIs imply TLS per the MongoDB connection-string spec.
  if (!mergedParams.has("ssl") && !mergedParams.has("tls")) {
    mergedParams.set("tls", "true");
  }

  return `mongodb://${userInfo}${shards}${db}?${mergedParams.toString()}`;
}

type LookupCallback = (
  err: NodeJS.ErrnoException | null,
  addressOrAll?: string | { address: string; family: number }[],
  family?: number,
) => void;
type LookupOptions = { family?: 0 | 4 | 6; all?: boolean; hints?: number };

// Forwarded to the underlying MongoClient as its `lookup`. The driver uses
// this for shard hostname → IP resolution; routing it through `publicResolver`
// keeps us off the broken OS resolver.
function publicLookup(
  hostname: string,
  optionsOrCb: LookupOptions | LookupCallback,
  maybeCb?: LookupCallback,
): void {
  const opts: LookupOptions =
    typeof optionsOrCb === "function" ? {} : optionsOrCb;
  const cb: LookupCallback =
    typeof optionsOrCb === "function" ? optionsOrCb : (maybeCb as LookupCallback);

  const family = opts.family === 6 ? 6 : opts.family === 4 ? 4 : 0;

  const run = async (): Promise<{ addrs: string[]; family: 4 | 6 }> => {
    if (family === 6) {
      const v6 = await publicResolver.resolve6(hostname);
      return { addrs: v6, family: 6 };
    }
    try {
      const v4 = await publicResolver.resolve4(hostname);
      return { addrs: v4, family: 4 };
    } catch (e) {
      if (family === 4) throw e;
      const v6 = await publicResolver.resolve6(hostname);
      return { addrs: v6, family: 6 };
    }
  };

  run().then(
    ({ addrs, family: f }) => {
      if (opts.all) {
        cb(
          null,
          addrs.map((a) => ({ address: a, family: f })),
        );
      } else {
        cb(null, addrs[0], f);
      }
    },
    (err: NodeJS.ErrnoException) => cb(err),
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var -- module cache for serverless
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local",
    );
  }
  if (cached.conn) {
    return cached.conn;
  }

  const effectiveUri = uri.startsWith("mongodb+srv://")
    ? await resolveAtlasSrvUri(uri)
    : uri;

  if (!cached.promise) {
    const driverOptions = {
      serverSelectionTimeoutMS: 8_000,
      connectTimeoutMS: 8_000,
      lookup: publicLookup,
    } as Parameters<typeof mongoose.connect>[1];
    cached.promise = mongoose.connect(effectiveUri, driverOptions);
  }
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}
