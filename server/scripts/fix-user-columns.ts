import { sequelizeExample } from '../models/db'
import { QueryTypes } from 'sequelize'

async function fixUserColumns() {
  try {
    console.log('Connecting to database...')
    await sequelizeExample.authenticate()
    console.log('Database connection successful!')

    console.log('\nAdding missing columns to user table...\n')

    const userColumns = [
      { name: 'nickname', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'role', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'ip', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'invite_code', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'superior_id', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'user_agent', type: 'TEXT DEFAULT NULL' },
      { name: 'cashback_ratio', type: 'INTEGER DEFAULT NULL' }
    ]

    for (const col of userColumns) {
      const checkQuery = `
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='user' AND column_name='${col.name}'
      `
      const exists = await sequelizeExample.query(checkQuery, {
        type: QueryTypes.SELECT
      })

      if (Array.isArray(exists) && exists.length === 0) {
        const alterQuery = `ALTER TABLE "user" ADD COLUMN ${col.name} ${col.type}`
        await sequelizeExample.query(alterQuery)
        console.log(`✅ Added column '${col.name}' to user table`)
      } else {
        console.log(`⏭️  Column '${col.name}' already exists in user table`)
      }
    }

    console.log('\n✨ User table columns fix completed successfully!')
    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ Fix failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

fixUserColumns()

