const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function print(text, color = 'reset') {
  console.log(colors[color] + text + colors.reset);
}

function printBox(title) {
  const width = 60;
  console.log('\n' + '═'.repeat(width));
  console.log(colors.bright + colors.cyan + title.padStart((width + title.length) / 2).padEnd(width) + colors.reset);
  console.log('═'.repeat(width) + '\n');
}

async function setup() {
  printBox('🔔 NOTIFICATIONS SYSTEM SETUP');

  print('Welcome! This script will help you set up the notifications system.\n', 'bright');

  // Check if .env.local exists
  print('Step 1: Checking environment configuration...', 'cyan');
  const envPath = path.join(__dirname, '..', '.env.local');

  if (!fs.existsSync(envPath)) {
    print('✗ .env.local not found!', 'red');
    print('Please create .env.local with your Supabase credentials first.\n', 'yellow');
    return;
  }

  print('✓ .env.local found\n', 'green');

  // Check if table exists
  print('Step 2: Checking if notifications table exists...', 'cyan');
  const { createClient } = require('@supabase/supabase-js');

  // Load env
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

  const supabase = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL,
    envVars.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await supabase
    .from('corporate_notifications')
    .select('*')
    .limit(1);

  if (!error) {
    print('✓ Notifications table already exists!\n', 'green');
    print('🎉 Setup is complete! The notification system is ready to use.\n', 'bright');
    print('Next steps:', 'cyan');
    print('  1. Restart dev server: bun run dev', 'yellow');
    print('  2. Assign a matter to test notifications', 'yellow');
    print('  3. Check the notification bell in the header\n', 'yellow');
    return;
  }

  print('✗ Table does not exist yet\n', 'yellow');

  // Show migration instructions
  printBox('📋 MIGRATION REQUIRED');

  print('To create the notifications table, follow these steps:\n', 'bright');

  print('┌─────────────────────────────────────────────────────────┐', 'blue');
  print('│ STEP 1: Open Supabase SQL Editor                       │', 'blue');
  print('└─────────────────────────────────────────────────────────┘', 'blue');
  print('\n  🔗 Click this link:', 'cyan');
  print('  https://supabase.com/dashboard/project/yvnkyjnwvylrweyzvibs/sql/new\n', 'yellow');

  print('┌─────────────────────────────────────────────────────────┐', 'blue');
  print('│ STEP 2: Copy the Migration SQL                         │', 'blue');
  print('└─────────────────────────────────────────────────────────┘', 'blue');
  print('\n  📄 Open file: .same/notifications_migration.sql', 'cyan');
  print('  📋 Select ALL (Ctrl+A or Cmd+A)', 'cyan');
  print('  📋 Copy (Ctrl+C or Cmd+C)\n', 'cyan');

  print('┌─────────────────────────────────────────────────────────┐', 'blue');
  print('│ STEP 3: Paste and Run                                  │', 'blue');
  print('└─────────────────────────────────────────────────────────┘', 'blue');
  print('\n  1️⃣  Paste into SQL Editor (Ctrl+V or Cmd+V)', 'cyan');
  print('  2️⃣  Click "Run" button (or press Ctrl+Enter)', 'cyan');
  print('  3️⃣  Wait for "Success" message\n', 'cyan');

  print('┌─────────────────────────────────────────────────────────┐', 'blue');
  print('│ STEP 4: Verify                                         │', 'blue');
  print('└─────────────────────────────────────────────────────────┘', 'blue');
  print('\n  Run this command to verify:', 'cyan');
  print('  $ node scripts/check-notifications.js\n', 'yellow');

  print('━'.repeat(60) + '\n', 'blue');

  print('💡 TIP: The entire process takes about 2 minutes!\n', 'green');

  print('Need help? Check: .same/RUN_MIGRATION_NOW.md\n', 'cyan');
}

setup().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
