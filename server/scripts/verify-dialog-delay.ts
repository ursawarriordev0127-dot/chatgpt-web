import { sequelizeExample } from '../models/db'

async function verifyDialogDelay() {
  try {
    console.log('Checking dialog table structure...')

    // Get all columns
    const [columns] = await sequelizeExample.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'dialog' 
      ORDER BY ordinal_position;
    `)
    
    console.log('\nDialog table columns:')
    console.log(JSON.stringify(columns, null, 2))
    
    // Check specifically for delay column
    const delayColumn = (columns as any[]).find((col: any) => col.column_name.toLowerCase() === 'delay')
    
    if (!delayColumn) {
      console.log('\n❌ delay column NOT FOUND! Adding it now...')
      await sequelizeExample.query(`
        ALTER TABLE dialog ADD COLUMN delay INTEGER NOT NULL DEFAULT 0;
      `)
      console.log('✅ Successfully added delay column')
    } else {
      console.log('\n✅ delay column found:')
      console.log(JSON.stringify(delayColumn, null, 2))
      
      // Test query
      try {
        const [test] = await sequelizeExample.query('SELECT delay FROM dialog LIMIT 1;')
        console.log('\n✅ Column is accessible, test query successful')
      } catch (error: any) {
        console.log('\n❌ Column exists but query failed:', error.message)
        console.log('Attempting to fix...')
        await sequelizeExample.query('ALTER TABLE dialog DROP COLUMN IF EXISTS delay;')
        await sequelizeExample.query('ALTER TABLE dialog ADD COLUMN delay INTEGER NOT NULL DEFAULT 0;')
        console.log('✅ Recreated delay column')
      }
    }
  } catch (error) {
    console.error('Error:', error)
    throw error
  } finally {
    await sequelizeExample.close()
  }
}

verifyDialogDelay()
  .then(() => {
    console.log('\n✅ Verification completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Verification failed:', error)
    process.exit(1)
  })

