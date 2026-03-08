import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yvnkyjnwvylrweyzvibs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bmt5am53dnlscndleXp2aWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3Mjg4NTMsImV4cCI6MjA3NzMwNDg1M30.dqZtNCoHekiN_qfxdZMMh_fKB9kJKzlDktykvAU2QEk'
);

async function checkSchema() {
  console.log('🔍 Checking Current Database Schema...\n');

  // Check existing tables
  const tables = [
    'profiles',
    'corporate_matters',
    'corporate_matter_documents',
    'corporate_matter_tasks',
    'corporate_matter_assignments',
    'corporate_matter_reviews',
    'corporate_matter_activity_logs',
    'corporate_matter_status_history',
    'corporate_matter_notifications',
    'corporate_matter_closures',
    'corporate_reference_divisions',
    'corporate_reference_matter_types',
    'corporate_reference_priorities'
  ];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ ${table}: NOT EXISTS`);
    } else {
      console.log(`✅ ${table}: EXISTS (${data?.length || 0} records)`);
      if (data && data.length > 0) {
        console.log(`   Columns: ${Object.keys(data[0]).slice(0, 5).join(', ')}...`);
      }
    }
  }

  // Check corporate_matters columns
  console.log('\n📋 Checking corporate_matters columns...');
  const { data: matters } = await supabase
    .from('corporate_matters')
    .select('*')
    .limit(1);

  if (matters && matters.length > 0) {
    console.log('Existing columns:');
    Object.keys(matters[0]).forEach(col => console.log(`  - ${col}`));
  } else {
    // Try to get schema info
    const { data: emptyCheck } = await supabase
      .from('corporate_matters')
      .select('*')
      .limit(0);
    console.log('Table is empty');
  }

  // Check profiles
  console.log('\n👥 Checking profiles...');
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*');

  if (profiles) {
    console.log(`Total profiles: ${profiles.length}`);
    profiles.forEach(p => {
      console.log(`  - ${p.email} | Role: ${p.role || 'not set'} | Name: ${p.full_name || 'not set'}`);
    });
  }

  console.log('\n✨ Schema check complete!');
}

checkSchema();
