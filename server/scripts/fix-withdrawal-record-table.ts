import { sequelizeExample } from '../models/db'

async function createWithdrawalRecordTable() {
  try {
    console.log('Creating withdrawal_record table...')

    // Check if table exists
    const [results] = await sequelizeExample.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'withdrawal_record'
      );
    `)

    const tableExists = (results as any[])[0]?.exists

    if (tableExists) {
      console.log('withdrawal_record table already exists')
      return
    }

    // Create the table
    await sequelizeExample.query(`
      CREATE TABLE withdrawal_record (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) DEFAULT NULL,
        amount VARCHAR(255) DEFAULT NULL,
        type VARCHAR(255) DEFAULT NULL,
        name VARCHAR(255) DEFAULT NULL,
        contact VARCHAR(255) DEFAULT NULL,
        account VARCHAR(255) DEFAULT NULL,
        remarks VARCHAR(255) DEFAULT NULL,
        message VARCHAR(255) DEFAULT NULL,
        status INTEGER NOT NULL DEFAULT 3,
        ip VARCHAR(255) DEFAULT NULL,
        user_agent VARCHAR(255) DEFAULT NULL,
        create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Create index
    await sequelizeExample.query(`
      CREATE INDEX IF NOT EXISTS idx_withdrawal_record_user_id ON withdrawal_record(user_id);
    `)

    console.log('Successfully created withdrawal_record table')
  } catch (error) {
    console.error('Error creating withdrawal_record table:', error)
    throw error
  } finally {
    await sequelizeExample.close()
  }
}

createWithdrawalRecordTable()
  .then(() => {
    console.log('Migration completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })

