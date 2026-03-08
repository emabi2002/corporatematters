const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

console.log('📋 NOTIFICATIONS TABLE MIGRATION\n');
console.log('━'.repeat(60) + '\n');

console.log('To create the notifications table, please follow these steps:\n');
console.log('1️⃣  Open Supabase SQL Editor:');
console.log('   https://supabase.com/dashboard/project/yvnkyjnwvylrweyzvibs/sql/new\n');

console.log('2️⃣  Copy the SQL migration:');
console.log('   File: .same/notifications_migration.sql\n');

console.log('3️⃣  Paste the entire SQL content into the editor\n');

console.log('4️⃣  Click the "Run" button (or press Ctrl/Cmd + Enter)\n');

console.log('━'.repeat(60) + '\n');

// Read and display first few lines of the SQL for reference
const sqlPath = path.join(__dirname, '..', '.same', 'notifications_migration.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf8');
const lines = sqlContent.split('\n').slice(13, 26); // Show table creation part

console.log('📄 Preview of the migration SQL:\n');
console.log('```sql');
lines.forEach(line => console.log(line));
console.log('...');
console.log('```\n');

console.log('━'.repeat(60) + '\n');
console.log('After running the migration, restart your dev server:');
console.log('   bun run dev\n');
console.log('Then test by assigning a matter to see notifications! 🔔\n');
