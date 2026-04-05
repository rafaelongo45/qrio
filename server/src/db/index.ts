import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import * as schema from './schema.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not set')

const client = postgres(connectionString)
export const db = drizzle(client, { schema })

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function runMigrations() {
  const migrationsFolder = join(__dirname, '../../drizzle')
  await migrate(db, { migrationsFolder })
}
