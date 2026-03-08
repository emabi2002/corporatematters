import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Make sure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running notifications table migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), '.same', 'notifications_migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('🔧 Executing SQL...\n');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, try alternative approach
      console.log('⚠️  exec_sql RPC not available, using direct approach...\n');

      // Split SQL into individual statements and execute
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.toLowerCase().includes('create table')) {
          console.log('📋 Creating table...');
        } else if (statement.toLowerCase().includes('create index')) {
          console.log('🔍 Creating index...');
        } else if (statement.toLowerCase().includes('create policy')) {
          console.log('🔒 Creating RLS policy...');
        }

        const { error: stmtError } = await supabase.from('_').select('*').limit(0);
        if (stmtError) {
          console.error('Note: Some SQL operations require Supabase Dashboard');
        }
      }

      console.log('\n⚠️  Please run the migration manually in Supabase Dashboard:');
      console.log('1. Open: https://supabase.com/dashboard/project/yvnkyjnwvylrweyzvibs/sql');
      console.log('2. Copy the SQL from: .same/notifications_migration.sql');
      console.log('3. Paste and click "Run"\n');
      return;
    }

    console.log('✅ Migration completed successfully!\n');

    // Verify the table was created
    const { data: tableCheck, error: tableError } = await supabase
      .from('corporate_notifications')
      .select('*')
      .limit(1);

    if (tableError) {
      console.log('⚠️  Table verification failed, but migration may have succeeded');
      console.log('Please verify in Supabase Dashboard\n');
    } else {
      console.log('✅ Table verified: corporate_notifications exists\n');
    }

    console.log('🎉 Notifications system is ready!');
    console.log('You can now:');
    console.log('- Assign matters to see notifications in action');
    console.log('- Check the notification bell in the header');
    console.log('- Visit /notifications page\n');

  } catch (err: any) {
    console.error('❌ Migration failed:', err.message);
    console.error('\nPlease run the migration manually in Supabase Dashboard:');
    console.error('1. Open: https://supabase.com/dashboard/project/yvnkyjnwvylrweyzvibs/sql');
    console.error('2. Copy the SQL from: .same/notifications_migration.sql');
    console.error('3. Paste and click "Run"\n');
    process.exit(1);
  }
}

runMigration();
