import { sequelizeExample } from '../models/db'

async function createInviteRecordTable() {
  try {
    console.log('Creating invite_record table...')

    // Check if table exists
    const [results] = await sequelizeExample.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'invite_record'
      );
    `)

    const tableExists = (results as any[])[0]?.exists

    if (tableExists) {
      console.log('invite_record table already exists')
      return
    }

    // Create the table
    await sequelizeExample.query(`
      CREATE TABLE invite_record (
        id BIGSERIAL,
        user_id VARCHAR(255) NOT NULL,
        invite_code VARCHAR(255) DEFAULT NULL,
        superior_id VARCHAR(255) DEFAULT NULL,
        reward VARCHAR(255) DEFAULT NULL,
        reward_type VARCHAR(255) DEFAULT NULL,
        status INTEGER NOT NULL DEFAULT 1,
        remarks VARCHAR(255) DEFAULT NULL,
        ip VARCHAR(255) DEFAULT NULL,
        user_agent TEXT DEFAULT NULL,
        create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id, user_id)
      );
    `)

    // Create indexes
    await sequelizeExample.query(`
      CREATE INDEX IF NOT EXISTS idx_invite_record_user_id ON invite_record(user_id);
    `)

    await sequelizeExample.query(`
      CREATE INDEX IF NOT EXISTS idx_invite_record_superior_id ON invite_record(superior_id);
    `)

    console.log('Successfully created invite_record table')
  } catch (error) {
    console.error('Error creating invite_record table:', error)
    throw error
  } finally {
    await sequelizeExample.close()
  }
}

createInviteRecordTable()
  .then(() => {
    console.log('Migration completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })

