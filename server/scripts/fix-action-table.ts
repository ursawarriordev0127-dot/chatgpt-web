import { sequelizeExample } from '../models/db'
import { QueryTypes } from 'sequelize'

async function fixActionTable() {
  try {
    console.log('Connecting to database...')
    await sequelizeExample.authenticate()
    console.log('Database connection successful!')

    console.log('\nCreating action table if it doesn\'t exist...\n')

    // Check if action table exists
    const checkTableQuery = `
      SELECT 1 FROM information_schema.tables 
      WHERE table_name='action'
    `
    const tableExists = await sequelizeExample.query(checkTableQuery, {
      type: QueryTypes.SELECT
    })

    if (Array.isArray(tableExists) && tableExists.length === 0) {
      // Create action table
      await sequelizeExample.query(`
        CREATE TABLE action (
          id BIGSERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          type VARCHAR(255) DEFAULT NULL,
          describe VARCHAR(255) DEFAULT NULL,
          ip VARCHAR(255) DEFAULT NULL,
          create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      // Create index
      await sequelizeExample.query(`
        CREATE INDEX IF NOT EXISTS idx_action_user_id ON action(user_id)
      `)
      
      console.log('✅ Created action table')
    } else {
      console.log('⏭️  Action table already exists')
    }

    console.log('\n✨ Action table fix completed successfully!')
    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ Fix failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

fixActionTable()

