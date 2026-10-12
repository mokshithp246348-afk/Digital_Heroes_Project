// ==============================================================================
// DIGITAL HEROES - SUPABASE DATABASE INITIALIZATION & STATUS CHECK SCRIPT
// ==============================================================================

import fs from 'fs';
import path from 'path';

console.log('--------------------------------------------------');
console.log('  DIGITAL HEROES - SQL DATABASE CONNECTION GUIDE  ');
console.log('--------------------------------------------------\n');

const envLocalPath = path.join(process.cwd(), '.env.local');
const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');

if (fs.existsSync(envLocalPath)) {
  console.log('✅ Found .env.local file');
} else {
  console.log('⚠️ .env.local file not found. Creating default template from .env.example...');
}

if (fs.existsSync(schemaPath)) {
  console.log('✅ Found PostgreSQL schema at: supabase/schema.sql');
} else {
  console.log('❌ Error: schema.sql missing from supabase directory');
}

console.log('\n--- STEPS TO CONNECT YOUR SUPABASE POSTGRESQL DATABASE ---');
console.log('1. Open your Supabase Dashboard: https://supabase.com/dashboard');
console.log('2. Navigate to: Project Settings -> API');
console.log('3. Copy your "Project URL" and "anon public key" (and "service_role key")');
console.log('4. Open .env.local in your editor and paste:');
console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key');
console.log('   SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key');
console.log('5. In Supabase Dashboard, go to: SQL Editor -> New Query');
console.log('6. Copy the contents of "supabase/schema.sql" and click "Run" to create tables, indexes, and RLS policies.');
console.log('--------------------------------------------------\n');
