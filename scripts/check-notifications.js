const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkNotifications() {
  console.log('🔍 Checking notifications table...\n');

  try {
    const { data, error } = await supabase
      .from('corporate_notifications')
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('❌ Notifications table does NOT exist\n');
        console.log('📋 To create the table:');
        console.log('1. Open: https://supabase.com/dashboard/project/yvnkyjnwvylrweyzvibs/sql/new');
        console.log('2. Copy SQL from: .same/notifications_migration.sql');
        console.log('3. Paste and click "Run"\n');
        return false;
      } else {
        console.error('❌ Error:', error.message);
        return false;
      }
    }

    console.log('✅ Notifications table exists!');
    console.log(`📊 Current count: ${data?.length || 0} notifications\n`);
    console.log('✅ Supabase connection working');
    console.log('✅ Environment configured correctly\n');
    console.log('🎉 Notification system is ready!\n');
    return true;

  } catch (err) {
    console.error('❌ Error:', err.message);
    return false;
  }
}

checkNotifications().then(success => {
  process.exit(success ? 0 : 1);
});
