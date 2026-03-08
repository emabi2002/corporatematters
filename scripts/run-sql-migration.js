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

async function runMigration() {
  console.log('🚀 Running notifications table migration...\n');

  try {
    // Read the migration SQL
    const sqlPath = path.join(__dirname, '..', '.same', 'notifications_migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Try to execute using the Supabase query endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();

      // If the endpoint doesn't exist, provide manual instructions
      console.log('⚠️  Automatic migration not available\n');
      console.log('📋 Please run the migration manually:\n');
      console.log('1. Open: https://supabase.com/dashboard/project/yvnkyjnwvylrweyzvibs/sql/new');
      console.log('2. Copy all SQL from: .same/notifications_migration.sql');
      console.log('3. Paste into the editor');
      console.log('4. Click "Run" button\n');
      console.log('Then run: node scripts/check-notifications.js\n');
      return;
    }

    console.log('✅ Migration executed successfully!\n');

    // Verify the table
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('corporate_notifications')
      .select('*')
      .limit(1);

    if (error) {
      console.log('⚠️  Table verification failed');
      console.log('Please check Supabase Dashboard\n');
    } else {
      console.log('✅ Table created and verified!\n');
      console.log('🎉 Notifications system is ready!');
      console.log('   - Restart dev server: bun run dev');
      console.log('   - Assign a matter to test notifications\n');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\n📋 Please run migration manually in Supabase Dashboard\n');
  }
}

runMigration();
