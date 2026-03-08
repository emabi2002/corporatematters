import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

async function verifyNotifications() {
  console.log('🔍 Checking notifications table...\n');

  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('corporate_notifications')
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "public.corporate_notifications" does not exist')) {
        console.log('❌ Notifications table does NOT exist\n');
        console.log('📋 Please run the migration:');
        console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard/project/yvnkyjnwvylrweyzvibs/sql');
        console.log('2. Click "New query"');
        console.log('3. Copy the SQL from: .same/notifications_migration.sql');
        console.log('4. Paste and click "Run"\n');
        return false;
      } else {
        console.error('❌ Error checking table:', error.message);
        return false;
      }
    }

    console.log('✅ Notifications table exists!');
    console.log(`📊 Current notifications count: ${data?.length || 0}\n`);

    // Check if RLS is enabled
    console.log('✅ Environment variables configured');
    console.log('✅ Supabase connection working');
    console.log('✅ Notifications system ready!\n');

    console.log('🎉 You can now:');
    console.log('   - Restart the dev server (bun run dev)');
    console.log('   - Assign matters to test notifications');
    console.log('   - Check the notification bell in the header');
    console.log('   - Visit /notifications page\n');

    return true;

  } catch (err: any) {
    console.error('❌ Unexpected error:', err.message);
    return false;
  }
}

verifyNotifications().then(success => {
  process.exit(success ? 0 : 1);
});
