import { sequelizeExample } from '../models/db'

async function fixPluginColumns() {
  try {
    console.log('Adding missing columns to plugin table...')

    // Check and add variables column
    const [variablesCheck] = await sequelizeExample.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'plugin' AND column_name = 'variables'
      );
    `)
    const variablesExists = (variablesCheck as any[])[0]?.exists

    if (!variablesExists) {
      await sequelizeExample.query(`
        ALTER TABLE plugin ADD COLUMN variables VARCHAR(255) DEFAULT NULL;
      `)
      console.log('Added variables column to plugin table')
    }

    // Check and add function column
    const [functionCheck] = await sequelizeExample.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'plugin' AND column_name = 'function'
      );
    `)
    const functionExists = (functionCheck as any[])[0]?.exists

    if (!functionExists) {
      await sequelizeExample.query(`
        ALTER TABLE plugin ADD COLUMN function TEXT DEFAULT NULL;
      `)
      console.log('Added function column to plugin table')
    }

    // Check and add script column
    const [scriptCheck] = await sequelizeExample.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'plugin' AND column_name = 'script'
      );
    `)
    const scriptExists = (scriptCheck as any[])[0]?.exists

    if (!scriptExists) {
      await sequelizeExample.query(`
        ALTER TABLE plugin ADD COLUMN script TEXT DEFAULT NULL;
      `)
      console.log('Added script column to plugin table')
    }

    // Update user_id to allow NULL if needed
    const [userIdCheck] = await sequelizeExample.query(`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'plugin' AND column_name = 'user_id';
    `)
    const userIdNullable = (userIdCheck as any[])[0]?.is_nullable === 'YES'

    if (!userIdNullable) {
      await sequelizeExample.query(`
        ALTER TABLE plugin ALTER COLUMN user_id DROP NOT NULL;
      `)
      console.log('Updated user_id column to allow NULL')
    }

    // Update avatar to NOT NULL if needed
    const [avatarCheck] = await sequelizeExample.query(`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'plugin' AND column_name = 'avatar';
    `)
    const avatarNullable = (avatarCheck as any[])[0]?.is_nullable === 'YES'

    if (avatarNullable) {
      await sequelizeExample.query(`
        ALTER TABLE plugin ALTER COLUMN avatar SET NOT NULL;
      `)
      console.log('Updated avatar column to NOT NULL')
    }

    // Update status to NOT NULL if needed
    const [statusCheck] = await sequelizeExample.query(`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'plugin' AND column_name = 'status';
    `)
    const statusNullable = (statusCheck as any[])[0]?.is_nullable === 'YES'

    if (statusNullable) {
      await sequelizeExample.query(`
        ALTER TABLE plugin ALTER COLUMN status SET NOT NULL;
      `)
      console.log('Updated status column to NOT NULL')
    }

    console.log('Successfully fixed plugin table columns')
  } catch (error) {
    console.error('Error fixing plugin table columns:', error)
    throw error
  } finally {
    await sequelizeExample.close()
  }
}

fixPluginColumns()
  .then(() => {
    console.log('Migration completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })

