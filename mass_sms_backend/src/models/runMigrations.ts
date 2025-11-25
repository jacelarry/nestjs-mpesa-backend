const { pool } = require('../config/database.js');
const fs = require('fs');
const path = require('path');
const dotenvMigrations = require('dotenv');

dotenvMigrations.config();

async function run() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  try {
    await pool.query(sql);
    console.log('Migrations applied successfully');
  } catch (e) {
    console.error('Migration failed', e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}
run();
