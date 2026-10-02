const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function initDb() {
  try {
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Applying database schema from schema.sql...');
    await db.query(sql);
    console.log('✓ Database schema created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating database schema:', error);
    process.exit(1);
  }
}

initDb();
