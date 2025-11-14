import { sequelizeExample } from '../models/db'

async function fixDialogDelayColumn() {
  try {
    console.log('Fixing delay column in dialog table...')

    // First, check if table exists
    const [tableCheck] = await sequelizeExample.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'dialog'
      );
    `)
    const tableExists = (tableCheck as any[])[0]?.exists

    if (!tableExists) {
      console.log('dialog table does not exist, creating it with delay column...')
      await sequelizeExample.query(`
        CREATE TABLE dialog (
          id BIGSERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          name VARCHAR(255) DEFAULT NULL,
          issue TEXT,
          answer TEXT,
          models VARCHAR(255) DEFAULT NULL,
          delay INTEGER NOT NULL DEFAULT 0,
          status INTEGER DEFAULT 1,
          create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `)
      console.log('Created dialog table with delay column')
      return
    }

    // Check if delay column exists (case-insensitive check)
    const [columnCheck] = await sequelizeExample.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'dialog' 
      AND LOWER(column_name) = 'delay';
    `)
    const columnExists = Array.isArray(columnCheck) && columnCheck.length > 0

    if (!columnExists) {
      console.log('Adding delay column to dialog table...')
      await sequelizeExample.query(`
        ALTER TABLE dialog ADD COLUMN delay INTEGER NOT NULL DEFAULT 0;
      `)
      console.log('Successfully added delay column to dialog table')
    } else {
      console.log('delay column already exists in dialog table')
      
      // Double-check: try to query the column to make sure it's accessible
      try {
        await sequelizeExample.query('SELECT delay FROM dialog LIMIT 1;')
        console.log('Verified delay column is accessible')
      } catch (error: any) {
        console.log('Warning: delay column exists but may not be accessible, attempting to recreate...')
        // Try to drop and recreate if there's an issue
        try {
          await sequelizeExample.query('ALTER TABLE dialog DROP COLUMN IF EXISTS delay;')
          await sequelizeExample.query('ALTER TABLE dialog ADD COLUMN delay INTEGER NOT NULL DEFAULT 0;')
          console.log('Recreated delay column successfully')
        } catch (recreateError) {
          console.error('Could not recreate delay column:', recreateError)
          throw recreateError
        }
      }
    }
  } catch (error) {
    console.error('Error fixing delay column:', error)
    throw error
  } finally {
    await sequelizeExample.close()
  }
}

fixDialogDelayColumn()
  .then(() => {
    console.log('Migration completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
