import postgres, { type Sql } from "postgres";

declare global {
  var nblSql: Sql | undefined;
}

let sqlClient: Sql | undefined;

function createClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL environment variable");
  }

  return postgres(databaseUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 15,
    prepare: false,
  });
}

export function getSqlClient(): Sql {
  if (sqlClient) {
    return sqlClient;
  }

  if (process.env.NODE_ENV === "production") {
    sqlClient = createClient();
    return sqlClient;
  }

  if (!globalThis.nblSql) {
    globalThis.nblSql = createClient();
  }

  sqlClient = globalThis.nblSql;
  return sqlClient;
}
