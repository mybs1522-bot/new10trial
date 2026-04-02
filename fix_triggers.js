import fs from 'fs';
let sql = fs.readFileSync('reset_and_init_db.sql', 'utf8');

// Find all occurrences of:
// DROP TRIGGER IF EXISTS <name> ON <wrong_table>;
// CREATE TRIGGER <name> [anything] ON <table>
sql = sql.replace(/DROP TRIGGER IF EXISTS\s+([a-zA-Z0-9_]+)\s+ON\s+[^;]+;\s*CREATE TRIGGER\s+\1([\s\S]*?)ON\s+([a-zA-Z0-9_\.]+)/gi, 'DROP TRIGGER IF EXISTS $1 ON $3;\nCREATE TRIGGER $1$2ON $3');

fs.writeFileSync('reset_and_init_db.sql', sql);
