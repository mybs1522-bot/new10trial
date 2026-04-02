import fs from 'fs';
let sql = fs.readFileSync('reset_and_init_db.sql', 'utf8');

// safely ignore repeated tables
sql = sql.replace(/CREATE TABLE public\.([a-zA-Z0-9_]+)/g, 'CREATE TABLE IF NOT EXISTS public.$1');

// properly wrap duplicate policies in safe block, or just drop them
sql = sql.replace(/CREATE POLICY "([^"]+)" ON public\.([a-zA-Z0-9_]+)/g, 'DROP POLICY IF EXISTS "$1" ON public.$2;\nCREATE POLICY "$1" ON public.$2');
sql = sql.replace(/CREATE POLICY ([A-Za-z0-9_]+) ON public\.([a-zA-Z0-9_]+)/g, 'DROP POLICY IF EXISTS $1 ON public.$2;\nCREATE POLICY $1 ON public.$2');

// prevent duplicate triggers
sql = sql.replace(/CREATE TRIGGER\s+([a-zA-Z0-9_]+)[^;]+ON\s+public\.([a-zA-Z0-9_]+)/gi, (match, p1, p2) => {
    return `DROP TRIGGER IF EXISTS ${p1} ON public.${p2};\n${match}`;
});

fs.writeFileSync('reset_and_init_db.sql', sql);
