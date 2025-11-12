import { sequelizeExample } from '../models/db'

async function createAmountDetailsTable() {
  try {
    console.log('Creating amount_details table...')

    // Check if table exists
    const [results] = await sequelizeExample.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'amount_details'
      );
    `)

    const tableExists = (results as any[])[0]?.exists

    if (tableExists) {
      console.log('amount_details table already exists')
      return
    }

    // Create the table
    await sequelizeExample.query(`
      CREATE TABLE amount_details (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        type VARCHAR(255) NOT NULL,
        correlation_id VARCHAR(255) DEFAULT NULL,
        original_amount VARCHAR(255) NOT NULL,
        operate_amount VARCHAR(255) NOT NULL,
        current_amount VARCHAR(255) NOT NULL,
        remarks VARCHAR(255) DEFAULT NULL,
        status INTEGER NOT NULL DEFAULT 1,
        create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Create index
    await sequelizeExample.query(`
      CREATE INDEX IF NOT EXISTS idx_amount_details_user_id ON amount_details(user_id);
    `)

    console.log('Successfully created amount_details table')
  } catch (error) {
    console.error('Error creating amount_details table:', error)
    throw error
  } finally {
    await sequelizeExample.close()
  }
}

createAmountDetailsTable()
  .then(() => {
    console.log('Migration completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })

