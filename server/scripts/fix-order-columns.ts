import { sequelizeExample } from '../models/db'

async function fixOrderColumns() {
  try {
    console.log('Fixing order table columns...')

    const columnsToAdd = [
      { name: 'trade_no', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'trade_status', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'channel', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'payment_id', type: 'BIGINT DEFAULT NULL' },
      { name: 'payment_info', type: 'TEXT DEFAULT NULL' },
      { name: 'money', type: 'DOUBLE PRECISION DEFAULT NULL' },
      { name: 'params', type: 'TEXT DEFAULT NULL' },
      { name: 'ip', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'notify_info', type: 'TEXT DEFAULT NULL' },
      { name: 'pay_url', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'product_title', type: 'VARCHAR(255) DEFAULT NULL' }
    ]

    // Check and add missing columns
    for (const col of columnsToAdd) {
      const [check] = await sequelizeExample.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'order' AND column_name = '${col.name}'
        );
      `)
      const exists = (check as any[])[0]?.exists

      if (!exists) {
        await sequelizeExample.query(`
          ALTER TABLE "order" ADD COLUMN ${col.name} ${col.type};
        `)
        console.log(`Added ${col.name} column to order table`)
      } else {
        console.log(`${col.name} column already exists`)
      }
    }

    // Update user_id to VARCHAR if it's not already
    const [userIdCheck] = await sequelizeExample.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'order' AND column_name = 'user_id';
    `)
    const userIdType = (userIdCheck as any[])[0]?.data_type

    if (userIdType && userIdType !== 'character varying') {
      console.log('Updating user_id column type...')
      // First, update any existing data if needed, then change type
      await sequelizeExample.query(`
        ALTER TABLE "order" ALTER COLUMN user_id TYPE VARCHAR(255);
      `)
      console.log('Updated user_id column type to VARCHAR')
    }

    // Update product_id to allow NULL if needed
    const [productIdCheck] = await sequelizeExample.query(`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'order' AND column_name = 'product_id';
    `)
    const productIdNullable = (productIdCheck as any[])[0]?.is_nullable === 'YES'

    if (!productIdNullable) {
      await sequelizeExample.query(`
        ALTER TABLE "order" ALTER COLUMN product_id DROP NOT NULL;
      `)
      console.log('Updated product_id to allow NULL')
    }

    // Remove order_id column if it exists (not in MySQL schema, replaced by id)
    const [orderIdCheck] = await sequelizeExample.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'order' AND column_name = 'order_id'
      );
    `)
    const orderIdExists = (orderIdCheck as any[])[0]?.exists

    if (orderIdExists) {
      // Check if there's a unique constraint on order_id
      try {
        await sequelizeExample.query(`
          ALTER TABLE "order" DROP CONSTRAINT IF EXISTS order_order_id_key;
        `)
        await sequelizeExample.query(`
          ALTER TABLE "order" DROP COLUMN IF EXISTS order_id;
        `)
        console.log('Removed order_id column (using id instead)')
      } catch (error: any) {
        console.log('Note: Could not remove order_id column:', error.message)
      }
    }

    // Remove pay_status and pay_time if they exist (not in MySQL schema)
    const [payStatusCheck] = await sequelizeExample.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'order' AND column_name = 'pay_status'
      );
    `)
    const payStatusExists = (payStatusCheck as any[])[0]?.exists

    if (payStatusExists) {
      await sequelizeExample.query(`
        ALTER TABLE "order" DROP COLUMN IF EXISTS pay_status;
      `)
      console.log('Removed pay_status column')
    }

    const [payTimeCheck] = await sequelizeExample.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'order' AND column_name = 'pay_time'
      );
    `)
    const payTimeExists = (payTimeCheck as any[])[0]?.exists

    if (payTimeExists) {
      await sequelizeExample.query(`
        ALTER TABLE "order" DROP COLUMN IF EXISTS pay_time;
      `)
      console.log('Removed pay_time column')
    }

    // Update create_time and update_time to allow NULL if needed (MySQL allows NULL)
    await sequelizeExample.query(`
      ALTER TABLE "order" ALTER COLUMN create_time DROP NOT NULL;
    `)
    await sequelizeExample.query(`
      ALTER TABLE "order" ALTER COLUMN update_time DROP NOT NULL;
    `)
    console.log('Updated create_time and update_time to allow NULL')

    console.log('Successfully fixed order table columns')
  } catch (error) {
    console.error('Error fixing order table columns:', error)
    throw error
  } finally {
    await sequelizeExample.close()
  }
}

fixOrderColumns()
  .then(() => {
    console.log('Migration completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })

