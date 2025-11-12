import { sequelizeExample } from '../models/db'

async function createMissingTables() {
  try {
    console.log('Creating missing tables...')

    // Check and create draw_record table
    const [drawCheck] = await sequelizeExample.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'draw_record'
      );
    `)
    const drawExists = (drawCheck as any[])[0]?.exists

    if (!drawExists) {
      await sequelizeExample.query(`
        CREATE TABLE draw_record (
          id BIGSERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          inset_image_url VARCHAR(255) DEFAULT NULL,
          images TEXT NOT NULL,
          prompt VARCHAR(255) NOT NULL,
          model VARCHAR(255) NOT NULL,
          params VARCHAR(255) DEFAULT NULL,
          take_time INTEGER DEFAULT NULL,
          size VARCHAR(255) DEFAULT NULL,
          status INTEGER DEFAULT NULL,
          create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `)
      await sequelizeExample.query(`
        CREATE INDEX IF NOT EXISTS idx_draw_record_user_id ON draw_record(user_id);
      `)
      console.log('Created draw_record table')
    } else {
      console.log('draw_record table already exists')
    }

    // Check and create installed_plugin table
    const [installedCheck] = await sequelizeExample.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'installed_plugin'
      );
    `)
    const installedExists = (installedCheck as any[])[0]?.exists

    if (!installedExists) {
      await sequelizeExample.query(`
        CREATE TABLE installed_plugin (
          id BIGSERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          plugin_id BIGINT NOT NULL,
          status INTEGER DEFAULT NULL,
          create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `)
      await sequelizeExample.query(`
        CREATE INDEX IF NOT EXISTS idx_installed_plugin_user_id ON installed_plugin(user_id);
      `)
      await sequelizeExample.query(`
        CREATE INDEX IF NOT EXISTS idx_installed_plugin_plugin_id ON installed_plugin(plugin_id);
      `)
      console.log('Created installed_plugin table')
    } else {
      console.log('installed_plugin table already exists')
    }

    // Check and create upload_record table
    const [uploadCheck] = await sequelizeExample.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'upload_record'
      );
    `)
    const uploadExists = (uploadCheck as any[])[0]?.exists

    if (!uploadExists) {
      await sequelizeExample.query(`
        CREATE TABLE upload_record (
          id BIGSERIAL PRIMARY KEY,
          user_id VARCHAR(255) DEFAULT NULL,
          mimetype VARCHAR(255) NOT NULL,
          sha1 VARCHAR(255) NOT NULL,
          md5 VARCHAR(255) NOT NULL,
          url VARCHAR(255) NOT NULL,
          originalname VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(255) NOT NULL,
          size VARCHAR(255) DEFAULT NULL,
          status INTEGER NOT NULL DEFAULT 1,
          create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `)
      await sequelizeExample.query(`
        CREATE INDEX IF NOT EXISTS idx_upload_record_user_id ON upload_record(user_id);
      `)
      console.log('Created upload_record table')
    } else {
      console.log('upload_record table already exists')
    }

    console.log('Successfully created all missing tables')
  } catch (error) {
    console.error('Error creating missing tables:', error)
    throw error
  } finally {
    await sequelizeExample.close()
  }
}

createMissingTables()
  .then(() => {
    console.log('Migration completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })

