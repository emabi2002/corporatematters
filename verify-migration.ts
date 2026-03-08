import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yvnkyjnwvylrweyzvibs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bmt5am53dnlscndleXp2aWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3Mjg4NTMsImV4cCI6MjA3NzMwNDg1M30.dqZtNCoHekiN_qfxdZMMh_fKB9kJKzlDktykvAU2QEk'
);

async function verifyMigration() {
  console.log('🔍 Verifying Migration Success...\n');

  const requiredTables = [
    'corporate_matters',
    'corporate_matter_documents',
    'corporate_matter_tasks',
    'corporate_matter_assignments',
    'corporate_matter_reviews',
    'corporate_matter_activity_logs',
    'corporate_matter_status_history',
    'corporate_matter_notifications',
    'corporate_matter_closures',
    'corporate_matter_document_versions',
    'corporate_reference_divisions',
    'corporate_reference_matter_types',
    'corporate_reference_request_forms',
    'corporate_reference_request_types',
    'corporate_reference_document_types',
    'corporate_reference_priorities',
    'corporate_reference_confidentiality_levels'
  ];

  let successCount = 0;
  let failCount = 0;

  for (const table of requiredTables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    
    if (!error) {
      console.log(`✅ ${table}`);
      successCount++;
    } else {
      console.log(`❌ ${table}: ${error.message}`);
      failCount++;
    }
  }

  console.log(`\n📊 Summary: ${successCount}/${requiredTables.length} tables verified`);

  // Check reference data
  console.log('\n📋 Checking Reference Data...');
  
  const { data: priorities } = await supabase.from('corporate_reference_priorities').select('*');
  console.log(`  Priorities: ${priorities?.length || 0} records`);

  const { data: confidentiality } = await supabase.from('corporate_reference_confidentiality_levels').select('*');
  console.log(`  Confidentiality Levels: ${confidentiality?.length || 0} records`);

  const { data: docTypes } = await supabase.from('corporate_reference_document_types').select('*');
  console.log(`  Document Types: ${docTypes?.length || 0} records`);

  const { data: requestForms } = await supabase.from('corporate_reference_request_forms').select('*');
  console.log(`  Request Forms: ${requestForms?.length || 0} records`);

  const { data: matterTypes } = await supabase.from('corporate_reference_matter_types').select('*');
  console.log(`  Matter Types: ${matterTypes?.length || 0} records`);

  const { data: requestTypes } = await supabase.from('corporate_reference_request_types').select('*');
  console.log(`  Request Types: ${requestTypes?.length || 0} records`);

  console.log('\n✨ Migration Verification Complete!');
  
  if (successCount === requiredTables.length) {
    console.log('🎉 ALL TABLES MIGRATED SUCCESSFULLY!\n');
    return true;
  } else {
    console.log(`⚠️  ${failCount} tables failed to migrate.\n`);
    return false;
  }
}

verifyMigration();
