import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  const client = new Client({
    host: '2406:da14:271:9911:dffc:1483:36aa:a0f3', // Direct IPv6 address from nslookup
    port: 5432,
    user: 'postgres',
    password: 'Robbin#00xx00x',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("Connecting to Supabase Postgres...");
    await client.connect();
    console.log("Connected successfully.");

    const migrationsDir = './supabase/migrations';
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Sort by timestamp prefix

    console.log(`Found ${files.length} migration files.`);

    for (const file of files) {
      console.log(`Running migration: ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Execute each file as a single transaction if possible, or just execute
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`Successfully completed ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Error in ${file}:`, err.message);
        // We continue because some migrations might fail if extensions already exist, etc.
      }
    }

    console.log("All migrations processed.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

runMigrations();
