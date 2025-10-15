import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let pool: any = null;
let db: any = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // In development without DB, export a safe proxy so imports don't crash
  db = new Proxy({}, {
    get() {
      throw new Error("DATABASE_URL not set. Database is not configured in this environment.");
    },
  });
}

export { pool, db };