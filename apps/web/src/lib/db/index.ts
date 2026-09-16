import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

declare global {
  var __dbClient: ReturnType<typeof postgres> | undefined;
}

type Database = ReturnType<typeof drizzle<typeof schema>>;

let instance: Database | undefined;

// Lazy on purpose: importing this module must never throw or open a
// connection by itself. Bundlers can pull this module into a shared chunk
// used by routes that never touch the database (e.g. /admin/login), and an
// eager throw/connect here would take those routes down too. The error
// below only fires once something actually queries the database.
function getDb(): Database {
  if (instance) return instance;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client =
    global.__dbClient ??
    postgres(connectionString, {
      prepare: false,
      // Recycle connections instead of holding onto potentially-broken ones
      // indefinitely — observed in practice: an idle/interrupted connection
      // on a flaky network can otherwise sit in the pool and hang every
      // subsequent query that draws it, with no error surfaced until it
      // eventually times out.
      max: 10,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
      connect_timeout: 10,
    });
  if (process.env.NODE_ENV === "development") {
    global.__dbClient = client;
  }

  instance = drizzle(client, { schema });
  return instance;
}

export const db: Database = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
