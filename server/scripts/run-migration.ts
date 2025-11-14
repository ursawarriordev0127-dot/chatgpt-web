import { sequelizeExample } from '../models/db'
import { QueryTypes } from 'sequelize'

async function runMigration() {
  try {
    console.log('Connecting to database...')
    await sequelizeExample.authenticate()
    console.log('Database connection successful!')

    console.log('\nRunning migration: Adding missing columns...\n')

    // Add missing columns to message table
    const messageColumns = [
      { name: 'frequency_penalty', type: 'DOUBLE PRECISION DEFAULT NULL' },
      { name: 'max_tokens', type: 'INTEGER DEFAULT NULL' },
      { name: 'model', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'presence_penalty', type: 'DOUBLE PRECISION DEFAULT NULL' },
      { name: 'temperature', type: 'DOUBLE PRECISION DEFAULT NULL' }
    ]

    for (const col of messageColumns) {
      const checkQuery = `
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='message' AND column_name='${col.name}'
      `
      const exists = await sequelizeExample.query(checkQuery, {
        type: QueryTypes.SELECT
      })

      if (Array.isArray(exists) && exists.length === 0) {
        const alterQuery = `ALTER TABLE message ADD COLUMN ${col.name} ${col.type}`
        await sequelizeExample.query(alterQuery)
        console.log(`✅ Added column '${col.name}' to message table`)
      } else {
        console.log(`⏭️  Column '${col.name}' already exists in message table`)
      }
    }

    // Add missing columns to persona table
    const personaColumns = [
      { name: 'system', type: 'INTEGER DEFAULT 0' },
      { name: 'description', type: 'VARCHAR(255) DEFAULT NULL' }
    ]

    for (const col of personaColumns) {
      const checkQuery = `
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='persona' AND column_name='${col.name}'
      `
      const exists = await sequelizeExample.query(checkQuery, {
        type: QueryTypes.SELECT
      })

      if (Array.isArray(exists) && exists.length === 0) {
        const alterQuery = `ALTER TABLE persona ADD COLUMN ${col.name} ${col.type}`
        await sequelizeExample.query(alterQuery)
        console.log(`✅ Added column '${col.name}' to persona table`)
      } else {
        console.log(`⏭️  Column '${col.name}' already exists in persona table`)
      }
    }

    // Check if 'name' column exists and rename to 'title'
    const nameCheckQuery = `
      SELECT 1 FROM information_schema.columns 
      WHERE table_name='persona' AND column_name='name'
    `
    const nameExists = await sequelizeExample.query(nameCheckQuery, {
      type: QueryTypes.SELECT
    })

    const titleCheckQuery = `
      SELECT 1 FROM information_schema.columns 
      WHERE table_name='persona' AND column_name='title'
    `
    const titleExists = await sequelizeExample.query(titleCheckQuery, {
      type: QueryTypes.SELECT
    })

    if (Array.isArray(nameExists) && nameExists.length > 0 && 
        Array.isArray(titleExists) && titleExists.length === 0) {
      await sequelizeExample.query('ALTER TABLE persona RENAME COLUMN name TO title')
      console.log('✅ Renamed \'name\' column to \'title\' in persona table')
    } else if (Array.isArray(titleExists) && titleExists.length > 0) {
      console.log('⏭️  Column \'title\' already exists in persona table')
    }

    console.log('\n✨ Migration completed successfully!')
    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

runMigration()

