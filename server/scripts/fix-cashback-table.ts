import { sequelizeExample } from '../models/db'

async function createCashbackTable() {
  try {
    console.log('Creating cashback table...')

    // Check if table exists
    const [results] = await sequelizeExample.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'cashback'
      );
    `)

    const tableExists = (results as any[])[0]?.exists

    if (tableExists) {
      console.log('cashback table already exists')
      return
    }

    // Create the table
    await sequelizeExample.query(`
      CREATE TABLE cashback (
        id BIGSERIAL,
        user_id VARCHAR(255) DEFAULT NULL,
        benefit_id VARCHAR(255) NOT NULL,
        pay_amount VARCHAR(255) DEFAULT NULL,
        commission_rate VARCHAR(255) DEFAULT NULL,
        commission_amount VARCHAR(255) DEFAULT NULL,
        remarks VARCHAR(255) DEFAULT NULL,
        order_id VARCHAR(255) DEFAULT NULL,
        status INTEGER NOT NULL DEFAULT 3,
        create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id, benefit_id)
      );
    `)

    // Create indexes
    await sequelizeExample.query(`
      CREATE INDEX IF NOT EXISTS idx_cashback_user_id ON cashback(user_id);
    `)

    await sequelizeExample.query(`
      CREATE INDEX IF NOT EXISTS idx_cashback_benefit_id ON cashback(benefit_id);
    `)

    console.log('Successfully created cashback table')
  } catch (error) {
    console.error('Error creating cashback table:', error)
    throw error
  } finally {
    await sequelizeExample.close()
  }
}

createCashbackTable()
  .then(() => {
    console.log('Migration completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })

