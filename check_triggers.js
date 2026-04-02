import fs from 'fs';
const sql = fs.readFileSync('reset_and_init_db.sql', 'utf8');
const matches = sql.match(/DROP TRIGGER.*/g);
matches.forEach(m => console.log(m));
