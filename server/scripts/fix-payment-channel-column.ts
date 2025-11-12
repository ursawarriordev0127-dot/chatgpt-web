import { sequelizeExample } from '../models/db'

async function fixPaymentChannelColumn() {
  try {
    console.log('Fixing channel column in payment table...')

    // Check if table exists
    const [tableCheck] = await sequelizeExample.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'payment'
      );
    `)
    const tableExists = (tableCheck as any[])[0]?.exists

    if (!tableExists) {
      console.log('payment table does not exist, creating it with channel column...')
      await sequelizeExample.query(`
        CREATE TABLE payment (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          channel VARCHAR(255) NOT NULL DEFAULT '',
          types VARCHAR(255) DEFAULT NULL,
          params TEXT DEFAULT NULL,
          status INTEGER NOT NULL DEFAULT 1,
          create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `)
      console.log('Created payment table with channel column')
      return
    }

    // Check if channel column exists
    const [columnCheck] = await sequelizeExample.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payment' 
      AND LOWER(column_name) = 'channel';
    `)
    const columnExists = Array.isArray(columnCheck) && columnCheck.length > 0

    if (!columnExists) {
      console.log('Adding channel column to payment table...')
      await sequelizeExample.query(`
        ALTER TABLE payment ADD COLUMN channel VARCHAR(255) NOT NULL DEFAULT '';
      `)
      console.log('Successfully added channel column to payment table')
    } else {
      console.log('channel column already exists in payment table')
    }

    // Check if params column exists (should replace config if it exists)
    const [paramsCheck] = await sequelizeExample.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payment' 
      AND LOWER(column_name) = 'params';
    `)
    const paramsExists = Array.isArray(paramsCheck) && paramsCheck.length > 0

    if (!paramsExists) {
      // Check if config column exists (old name)
      const [configCheck] = await sequelizeExample.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'payment' 
        AND LOWER(column_name) = 'config';
      `)
      const configExists = Array.isArray(configCheck) && configCheck.length > 0

      if (configExists) {
        console.log('Renaming config column to params...')
        await sequelizeExample.query(`
          ALTER TABLE payment RENAME COLUMN config TO params;
        `)
        console.log('Successfully renamed config to params')
      } else {
        console.log('Adding params column to payment table...')
        await sequelizeExample.query(`
          ALTER TABLE payment ADD COLUMN params TEXT DEFAULT NULL;
        `)
        console.log('Successfully added params column to payment table')
      }
    } else {
      console.log('params column already exists in payment table')
    }

    // Remove icon column if it exists (not in MySQL schema)
    const [iconCheck] = await sequelizeExample.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payment' 
      AND LOWER(column_name) = 'icon';
    `)
    const iconExists = Array.isArray(iconCheck) && iconCheck.length > 0

    if (iconExists) {
      console.log('Removing icon column (not in MySQL schema)...')
      await sequelizeExample.query(`
        ALTER TABLE payment DROP COLUMN IF EXISTS icon;
      `)
      console.log('Removed icon column')
    }

    // Update status to NOT NULL if needed
    const [statusCheck] = await sequelizeExample.query(`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'payment' AND column_name = 'status';
    `)
    const statusNullable = (statusCheck as any[])[0]?.is_nullable === 'YES'

    if (statusNullable) {
      await sequelizeExample.query(`
        ALTER TABLE payment ALTER COLUMN status SET NOT NULL;
      `)
      console.log('Updated status column to NOT NULL')
    }

    console.log('Successfully fixed payment table columns')
  } catch (error) {
    console.error('Error fixing payment table columns:', error)
    throw error
  } finally {
    await sequelizeExample.close()
  }
}

fixPaymentChannelColumn()
  .then(() => {
    console.log('Migration completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })

