import { sequelizeExample } from '../models/db'

async function fixTurnoverValueColumn() {
  try {
    console.log('Fixing turnover.value column type...')

    // Check current column type
    const [check] = await sequelizeExample.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'turnover' AND column_name = 'value';
    `)
    const currentType = (check as any[])[0]?.data_type

    if (currentType === 'double precision') {
      console.log('Converting value column from DOUBLE PRECISION to VARCHAR...')
      
      // Change column type to VARCHAR directly using USING clause
      // This will convert numeric values to text automatically
      await sequelizeExample.query(`
        ALTER TABLE turnover 
        ALTER COLUMN value TYPE VARCHAR(255) USING COALESCE(value::text, '0');
      `)
      
      // Set NOT NULL constraint
      await sequelizeExample.query(`
        ALTER TABLE turnover 
        ALTER COLUMN value SET NOT NULL;
      `)
      
      // Set default value
      await sequelizeExample.query(`
        ALTER TABLE turnover 
        ALTER COLUMN value SET DEFAULT '0';
      `)
      
      console.log('Successfully converted turnover.value column to VARCHAR')
    } else if (currentType === 'character varying') {
      console.log('turnover.value column is already VARCHAR, checking constraints...')
      
      // Check if NOT NULL constraint exists
      const [nullableCheck] = await sequelizeExample.query(`
        SELECT is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'turnover' AND column_name = 'value';
      `)
      const isNullable = (nullableCheck as any[])[0]?.is_nullable === 'YES'
      
      if (isNullable) {
        await sequelizeExample.query(`
          ALTER TABLE turnover 
          ALTER COLUMN value SET NOT NULL;
        `)
        console.log('Set NOT NULL constraint on turnover.value')
      }
      
      // Check default value
      const [defaultCheck] = await sequelizeExample.query(`
        SELECT column_default 
        FROM information_schema.columns 
        WHERE table_name = 'turnover' AND column_name = 'value';
      `)
      const defaultValue = (defaultCheck as any[])[0]?.column_default
      
      if (!defaultValue || !defaultValue.includes('\'0\'')) {
        await sequelizeExample.query(`
          ALTER TABLE turnover 
          ALTER COLUMN value SET DEFAULT '0';
        `)
        console.log('Set default value on turnover.value')
      }
    } else {
      console.log(`Warning: Unexpected column type: ${currentType}`)
    }

    console.log('Successfully fixed turnover.value column')
  } catch (error) {
    console.error('Error fixing turnover.value column:', error)
    throw error
  } finally {
    await sequelizeExample.close()
  }
}

fixTurnoverValueColumn()
  .then(() => {
    console.log('Migration completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })

