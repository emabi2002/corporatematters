import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yvnkyjnwvylrweyzvibs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bmt5am53dnlscndleXp2aWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3Mjg4NTMsImV4cCI6MjA3NzMwNDg1M30.dqZtNCoHekiN_qfxdZMMh_fKB9kJKzlDktykvAU2QEk'
);

async function getTableStructure() {
  console.log('📋 Getting detailed table structure...\n');

  // Insert a test row to see structure
  const testData = {
    type_of_matter: 'Test',
    request_form: 'Test', 
    requester_name: 'Test',
    date_requested: '2025-01-01',
    date_received: '2025-01-01',
    request_type: 'Test'
  };

  const { data, error } = await supabase
    .from('corporate_matters')
    .insert(testData)
    .select()
    .single();

  if (data) {
    console.log('✅ corporate_matters columns:');
    Object.keys(data).sort().forEach(col => {
      console.log(`  - ${col}: ${typeof data[col]} = ${data[col]}`);
    });

    // Delete test row
    await supabase.from('corporate_matters').delete().eq('id', data.id);
    console.log('\n(Test row deleted)');
  } else {
    console.log('Error:', error);
  }

  // Check profiles structure
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .single();

  if (profile) {
    console.log('\n👥 profiles columns:');
    Object.keys(profile).sort().forEach(col => {
      console.log(`  - ${col}`);
    });
  }

  // Check documents structure
  const { data: doc } = await supabase
    .from('corporate_matter_documents')
    .select('*')
    .limit(1)
    .single();

  if (doc) {
    console.log('\n📄 corporate_matter_documents columns:');
    Object.keys(doc).sort().forEach(col => {
      console.log(`  - ${col}`);
    });
  } else {
    console.log('\n📄 corporate_matter_documents: empty (no structure visible)');
  }

  // Check tasks structure  
  const { data: task } = await supabase
    .from('corporate_matter_tasks')
    .select('*')
    .limit(1)
    .single();

  if (task) {
    console.log('\n✓ corporate_matter_tasks columns:');
    Object.keys(task).sort().forEach(col => {
      console.log(`  - ${col}`);
    });
  } else {
    console.log('\n✓ corporate_matter_tasks: empty (no structure visible)');
  }
}

getTableStructure();
