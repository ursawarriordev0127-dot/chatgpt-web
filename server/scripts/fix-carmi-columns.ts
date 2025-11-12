import { sequelizeExample } from '../models/db'

async function fixCarmiColumns() {
  try {
    console.log('Adding missing columns to carmi table...')

    // Check and add type column
    const [typeCheck] = await sequelizeExample.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'carmi' AND column_name = 'type'
      );
    `)
    const typeExists = (typeCheck as any[])[0]?.exists

    if (!typeExists) {
      await sequelizeExample.query(`
        ALTER TABLE carmi ADD COLUMN type VARCHAR(255) NOT NULL DEFAULT 'integral';
      `)
      console.log('Added type column to carmi table')
    } else {
      console.log('type column already exists')
    }

    // Check and add level column
    const [levelCheck] = await sequelizeExample.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'carmi' AND column_name = 'level'
      );
    `)
    const levelExists = (levelCheck as any[])[0]?.exists

    if (!levelExists) {
      await sequelizeExample.query(`
        ALTER TABLE carmi ADD COLUMN level INTEGER DEFAULT NULL;
      `)
      console.log('Added level column to carmi table')
    } else {
      console.log('level column already exists')
    }

    // Update value column to NOT NULL if needed
    const [valueCheck] = await sequelizeExample.query(`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'carmi' AND column_name = 'value';
    `)
    const valueNullable = (valueCheck as any[])[0]?.is_nullable === 'YES'

    if (valueNullable) {
      await sequelizeExample.query(`
        ALTER TABLE carmi ALTER COLUMN value SET NOT NULL;
      `)
      console.log('Updated value column to NOT NULL')
    }

    console.log('Successfully fixed carmi table columns')
  } catch (error) {
    console.error('Error fixing carmi table columns:', error)
    throw error
  } finally {
    await sequelizeExample.close()
  }
}

fixCarmiColumns()
  .then(() => {
    console.log('Migration completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })

