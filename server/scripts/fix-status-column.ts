import { sequelizeExample } from '../models/db'
import { QueryTypes } from 'sequelize'

async function fixStatusColumn() {
  try {
    console.log('Connecting to database...')
    await sequelizeExample.authenticate()
    console.log('Database connection successful!')

    console.log('\nFixing status column type in message table...\n')

    // Check current status column type
    const checkQuery = `
      SELECT data_type FROM information_schema.columns 
      WHERE table_name='message' AND column_name='status'
    `
    const result = await sequelizeExample.query(checkQuery, {
      type: QueryTypes.SELECT
    }) as any[]

    if (result.length > 0 && result[0].data_type === 'character varying') {
      console.log('Status column is VARCHAR, converting to INTEGER...')
      
      // First, update any 'pass' values to 1
      await sequelizeExample.query('UPDATE message SET status = \'1\' WHERE status = \'pass\'')
      await sequelizeExample.query('UPDATE message SET status = \'0\' WHERE status = \'fail\'')
      
      // Drop default value first
      await sequelizeExample.query('ALTER TABLE message ALTER COLUMN status DROP DEFAULT')
      
      // Change column type to INTEGER
      await sequelizeExample.query(`
        ALTER TABLE message 
        ALTER COLUMN status TYPE INTEGER 
        USING CASE 
          WHEN status = 'pass' OR status = '1' THEN 1
          WHEN status = 'fail' OR status = '0' THEN 0
          ELSE 1
        END
      `)
      
      // Set default value back
      await sequelizeExample.query('ALTER TABLE message ALTER COLUMN status SET DEFAULT 1')
      
      console.log('✅ Successfully converted status column to INTEGER')
    } else {
      console.log('⏭️  Status column is already INTEGER or does not exist')
    }

    console.log('\n✨ Column type fix completed successfully!')
    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ Fix failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

fixStatusColumn()

