import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });
dotenv.config({ path: join(__dirname, '../.env') });

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not found in environment variables');
  console.log('\nPlease create a .env.local file in the project root with:');
  console.log('DATABASE_URL=postgresql://postgres:excollo123excollo@db.gmjgjwtkbpctpapxdury.supabase.co:5432/postgres');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    console.log('   Server time:', result.rows[0].now);
    
    // List all tables
    console.log('\n📋 Searching for tables...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('⚠️  No tables found in public schema');
    } else {
      console.log(`\n📊 Found ${tablesResult.rows.length} table(s):`);
      tablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
    }
    
    // List all views
    const viewsResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    if (viewsResult.rows.length > 0) {
      console.log(`\n👁️  Found ${viewsResult.rows.length} view(s):`);
      viewsResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
    }
    
    // Check for the expected table
    const expectedTable = process.env.MASTER_TABLE_NAME || 'master_inventory_view';
    console.log(`\n🔍 Checking for table/view: "${expectedTable}"...`);
    
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      ) OR EXISTS (
        SELECT FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [expectedTable]);
    
    if (checkTable.rows[0].exists) {
      console.log(`✅ Table/view "${expectedTable}" exists!`);
      
      // Get column names
      const columnsResult = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position;
      `, [expectedTable]);
      
      console.log(`\n📝 Columns in "${expectedTable}":`);
      columnsResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.column_name} (${row.data_type})`);
      });
      
      // Try a simple query
      console.log(`\n🧪 Testing query on "${expectedTable}"...`);
      const testQuery = await pool.query(`SELECT COUNT(*) as count FROM ${expectedTable}`);
      console.log(`✅ Query successful! Found ${testQuery.rows[0].count} row(s)`);
    } else {
      console.log(`❌ Table/view "${expectedTable}" NOT FOUND`);
      console.log('\n💡 Suggestion: Update MASTER_TABLE_NAME in .env.local to one of the tables/views listed above');
    }
    
    await pool.end();
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    if (error.detail) {
      console.error('   Details:', error.detail);
    }
    await pool.end();
    process.exit(1);
  }
}

testConnection();

