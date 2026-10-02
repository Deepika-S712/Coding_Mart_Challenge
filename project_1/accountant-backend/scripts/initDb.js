require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const runInit = async () => {
  const connectionString = process.env.DATABASE_URL;
  const config = connectionString
    ? { connectionString }
    : {
        host: process.env.PGHOST || 'localhost',
        port: parseInt(process.env.PGPORT || '5432', 10),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'cms_db'
      };

  console.log('[DB INIT] Connecting to PostgreSQL at', config.host || config.connectionString);
  const pool = new Pool(config);

  try {
    const client = await pool.connect();
    console.log('[DB INIT] Successfully connected to PostgreSQL.');

    const schemaPath = path.join(__dirname, '../src/config/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('[DB INIT] Executing schema.sql...');
    await client.query(sql);
    console.log('[DB INIT] Schema created successfully!');

    client.release();
  } catch (err) {
    console.error('[DB INIT ERROR]:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runInit();
