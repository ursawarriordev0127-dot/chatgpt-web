-- PostgreSQL Migration Script
-- Add missing columns to fix "column does not exist" errors
-- Run this script if you're getting errors about missing columns

-- ----------------------------
-- Migration: Add missing columns to message table
-- ----------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='message' AND column_name='frequency_penalty') THEN
    ALTER TABLE message ADD COLUMN frequency_penalty DOUBLE PRECISION DEFAULT NULL;
    RAISE NOTICE 'Added frequency_penalty column to message table';
  ELSE
    RAISE NOTICE 'Column frequency_penalty already exists in message table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='message' AND column_name='max_tokens') THEN
    ALTER TABLE message ADD COLUMN max_tokens INTEGER DEFAULT NULL;
    RAISE NOTICE 'Added max_tokens column to message table';
  ELSE
    RAISE NOTICE 'Column max_tokens already exists in message table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='message' AND column_name='model') THEN
    ALTER TABLE message ADD COLUMN model VARCHAR(255) DEFAULT NULL;
    RAISE NOTICE 'Added model column to message table';
  ELSE
    RAISE NOTICE 'Column model already exists in message table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='message' AND column_name='presence_penalty') THEN
    ALTER TABLE message ADD COLUMN presence_penalty DOUBLE PRECISION DEFAULT NULL;
    RAISE NOTICE 'Added presence_penalty column to message table';
  ELSE
    RAISE NOTICE 'Column presence_penalty already exists in message table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='message' AND column_name='temperature') THEN
    ALTER TABLE message ADD COLUMN temperature DOUBLE PRECISION DEFAULT NULL;
    RAISE NOTICE 'Added temperature column to message table';
  ELSE
    RAISE NOTICE 'Column temperature already exists in message table';
  END IF;
END $$;

-- ----------------------------
-- Migration: Add delay column to dialog table
-- ----------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dialog' AND column_name='delay') THEN
    ALTER TABLE dialog ADD COLUMN delay INTEGER NOT NULL DEFAULT 0;
    RAISE NOTICE 'Added delay column to dialog table';
  ELSE
    RAISE NOTICE 'Column delay already exists in dialog table';
  END IF;
END $$;

-- ----------------------------
-- Migration: Add missing columns to persona table
-- ----------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='persona' AND column_name='system') THEN
    ALTER TABLE persona ADD COLUMN system INTEGER DEFAULT 0;
    RAISE NOTICE 'Added system column to persona table';
  ELSE
    RAISE NOTICE 'Column system already exists in persona table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='persona' AND column_name='title') THEN
    -- Check if 'name' column exists and rename it to 'title'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='persona' AND column_name='name') THEN
      ALTER TABLE persona RENAME COLUMN name TO title;
      RAISE NOTICE 'Renamed name column to title in persona table';
    ELSE
      ALTER TABLE persona ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT '';
      RAISE NOTICE 'Added title column to persona table';
    END IF;
  ELSE
    RAISE NOTICE 'Column title already exists in persona table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='persona' AND column_name='description') THEN
    ALTER TABLE persona ADD COLUMN description VARCHAR(255) DEFAULT NULL;
    RAISE NOTICE 'Added description column to persona table';
  ELSE
    RAISE NOTICE 'Column description already exists in persona table';
  END IF;
END $$;

-- ----------------------------
-- Migration: Create action table if it doesn't exist
-- ----------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='action') THEN
    CREATE TABLE action (
      id BIGSERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      type VARCHAR(255) DEFAULT NULL,
      describe VARCHAR(255) DEFAULT NULL,
      ip VARCHAR(255) DEFAULT NULL,
      create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_action_user_id ON action(user_id);
    RAISE NOTICE 'Created action table';
  ELSE
    RAISE NOTICE 'Action table already exists';
  END IF;
END $$;

-- ----------------------------
-- Migration: Create invite_record table if it doesn't exist
-- ----------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='invite_record') THEN
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
    CREATE INDEX IF NOT EXISTS idx_invite_record_user_id ON invite_record(user_id);
    CREATE INDEX IF NOT EXISTS idx_invite_record_superior_id ON invite_record(superior_id);
    RAISE NOTICE 'Created invite_record table';
  ELSE
    RAISE NOTICE 'invite_record table already exists';
  END IF;
END $$;

-- ----------------------------
-- Migration: Create amount_details table if it doesn't exist
-- ----------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='amount_details') THEN
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
    CREATE INDEX IF NOT EXISTS idx_amount_details_user_id ON amount_details(user_id);
    RAISE NOTICE 'Created amount_details table';
  ELSE
    RAISE NOTICE 'amount_details table already exists';
  END IF;
END $$;

-- ----------------------------
-- Migration: Create cashback table if it doesn't exist
-- ----------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='cashback') THEN
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
    CREATE INDEX IF NOT EXISTS idx_cashback_user_id ON cashback(user_id);
    CREATE INDEX IF NOT EXISTS idx_cashback_benefit_id ON cashback(benefit_id);
    RAISE NOTICE 'Created cashback table';
  ELSE
    RAISE NOTICE 'cashback table already exists';
  END IF;
END $$;

-- ----------------------------
-- Migration: Add missing columns to user table
-- ----------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='nickname') THEN
    ALTER TABLE "user" ADD COLUMN nickname VARCHAR(255) DEFAULT NULL;
    RAISE NOTICE 'Added nickname column to user table';
  ELSE
    RAISE NOTICE 'Column nickname already exists in user table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='role') THEN
    ALTER TABLE "user" ADD COLUMN role VARCHAR(255) DEFAULT NULL;
    RAISE NOTICE 'Added role column to user table';
  ELSE
    RAISE NOTICE 'Column role already exists in user table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='ip') THEN
    ALTER TABLE "user" ADD COLUMN ip VARCHAR(255) DEFAULT NULL;
    RAISE NOTICE 'Added ip column to user table';
  ELSE
    RAISE NOTICE 'Column ip already exists in user table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='invite_code') THEN
    ALTER TABLE "user" ADD COLUMN invite_code VARCHAR(255) DEFAULT NULL;
    RAISE NOTICE 'Added invite_code column to user table';
  ELSE
    RAISE NOTICE 'Column invite_code already exists in user table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='superior_id') THEN
    ALTER TABLE "user" ADD COLUMN superior_id VARCHAR(255) DEFAULT NULL;
    RAISE NOTICE 'Added superior_id column to user table';
  ELSE
    RAISE NOTICE 'Column superior_id already exists in user table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='user_agent') THEN
    ALTER TABLE "user" ADD COLUMN user_agent TEXT DEFAULT NULL;
    RAISE NOTICE 'Added user_agent column to user table';
  ELSE
    RAISE NOTICE 'Column user_agent already exists in user table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='cashback_ratio') THEN
    ALTER TABLE "user" ADD COLUMN cashback_ratio INTEGER DEFAULT NULL;
    RAISE NOTICE 'Added cashback_ratio column to user table';
  ELSE
    RAISE NOTICE 'Column cashback_ratio already exists in user table';
  END IF;
END $$;

-- ----------------------------
-- Migration: Add missing columns to carmi table
-- ----------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='carmi' AND column_name='type') THEN
    ALTER TABLE carmi ADD COLUMN type VARCHAR(255) NOT NULL DEFAULT 'integral';
    RAISE NOTICE 'Added type column to carmi table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='carmi' AND column_name='level') THEN
    ALTER TABLE carmi ADD COLUMN level INTEGER DEFAULT NULL;
    RAISE NOTICE 'Added level column to carmi table';
  END IF;
  
  -- Update value column to NOT NULL if needed
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='carmi' AND column_name='value' AND is_nullable='YES') THEN
    ALTER TABLE carmi ALTER COLUMN value SET NOT NULL;
    RAISE NOTICE 'Updated value column to NOT NULL';
  END IF;
END $$;

-- ----------------------------
-- Migration: Add missing columns to plugin table
-- ----------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plugin' AND column_name='variables') THEN
    ALTER TABLE plugin ADD COLUMN variables VARCHAR(255) DEFAULT NULL;
    RAISE NOTICE 'Added variables column to plugin table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plugin' AND column_name='function') THEN
    ALTER TABLE plugin ADD COLUMN function TEXT DEFAULT NULL;
    RAISE NOTICE 'Added function column to plugin table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plugin' AND column_name='script') THEN
    ALTER TABLE plugin ADD COLUMN script TEXT DEFAULT NULL;
    RAISE NOTICE 'Added script column to plugin table';
  END IF;
  
  -- Update user_id to allow NULL if needed
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plugin' AND column_name='user_id' AND is_nullable='NO') THEN
    ALTER TABLE plugin ALTER COLUMN user_id DROP NOT NULL;
    RAISE NOTICE 'Updated user_id column to allow NULL';
  END IF;
  
  -- Update avatar to NOT NULL if needed
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plugin' AND column_name='avatar' AND is_nullable='YES') THEN
    ALTER TABLE plugin ALTER COLUMN avatar SET NOT NULL;
    RAISE NOTICE 'Updated avatar column to NOT NULL';
  END IF;
  
  -- Update status to NOT NULL if needed
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plugin' AND column_name='status' AND is_nullable='YES') THEN
    ALTER TABLE plugin ALTER COLUMN status SET NOT NULL;
    RAISE NOTICE 'Updated status column to NOT NULL';
  END IF;
END $$;

-- ----------------------------
-- Migration: Create withdrawal_record table if it doesn't exist
-- ----------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='withdrawal_record') THEN
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
    CREATE INDEX IF NOT EXISTS idx_withdrawal_record_user_id ON withdrawal_record(user_id);
    RAISE NOTICE 'Created withdrawal_record table';
  ELSE
    RAISE NOTICE 'withdrawal_record table already exists';
  END IF;
END $$;

-- ----------------------------
-- Migration: Create missing tables if they don't exist
-- ----------------------------
DO $$
BEGIN
  -- Create draw_record table
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='draw_record') THEN
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
    CREATE INDEX IF NOT EXISTS idx_draw_record_user_id ON draw_record(user_id);
    RAISE NOTICE 'Created draw_record table';
  END IF;
  
  -- Create installed_plugin table
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='installed_plugin') THEN
    CREATE TABLE installed_plugin (
      id BIGSERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      plugin_id BIGINT NOT NULL,
      status INTEGER DEFAULT NULL,
      create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_installed_plugin_user_id ON installed_plugin(user_id);
    CREATE INDEX IF NOT EXISTS idx_installed_plugin_plugin_id ON installed_plugin(plugin_id);
    RAISE NOTICE 'Created installed_plugin table';
  END IF;
  
  -- Create upload_record table
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='upload_record') THEN
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
    CREATE INDEX IF NOT EXISTS idx_upload_record_user_id ON upload_record(user_id);
    RAISE NOTICE 'Created upload_record table';
  END IF;
END $$;

-- ----------------------------
-- Migration: Fix payment table columns
-- ----------------------------
DO $$
BEGIN
  -- Add channel column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment' AND column_name='channel') THEN
    ALTER TABLE payment ADD COLUMN channel VARCHAR(255) NOT NULL DEFAULT '';
    RAISE NOTICE 'Added channel column to payment table';
  END IF;
  
  -- Rename config to params if config exists and params doesn't
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment' AND column_name='config')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment' AND column_name='params') THEN
    ALTER TABLE payment RENAME COLUMN config TO params;
    RAISE NOTICE 'Renamed config column to params in payment table';
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment' AND column_name='params') THEN
    ALTER TABLE payment ADD COLUMN params TEXT DEFAULT NULL;
    RAISE NOTICE 'Added params column to payment table';
  END IF;
  
  -- Remove icon column if it exists (not in MySQL schema)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment' AND column_name='icon') THEN
    ALTER TABLE payment DROP COLUMN icon;
    RAISE NOTICE 'Removed icon column from payment table';
  END IF;
  
  -- Update status to NOT NULL if needed
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment' AND column_name='status' AND is_nullable='YES') THEN
    ALTER TABLE payment ALTER COLUMN status SET NOT NULL;
    RAISE NOTICE 'Updated status column to NOT NULL in payment table';
  END IF;
END $$;

-- ----------------------------
-- Migration: Fix order table columns
-- ----------------------------
DO $$
BEGIN
  -- Add missing columns to order table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='trade_no') THEN
    ALTER TABLE "order" ADD COLUMN trade_no VARCHAR(255) DEFAULT NULL;
    RAISE NOTICE 'Added trade_no column to order table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='trade_status') THEN
    ALTER TABLE "order" ADD COLUMN trade_status VARCHAR(255) DEFAULT NULL;
    RAISE NOTICE 'Added trade_status column to order table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='channel') THEN
    ALTER TABLE "order" ADD COLUMN channel VARCHAR(255) DEFAULT NULL;
    RAISE NOTICE 'Added channel column to order table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='payment_id') THEN
    ALTER TABLE "order" ADD COLUMN payment_id BIGINT DEFAULT NULL;
    RAISE NOTICE 'Added payment_id column to order table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='payment_info') THEN
    ALTER TABLE "order" ADD COLUMN payment_info TEXT DEFAULT NULL;
    RAISE NOTICE 'Added payment_info column to order table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='money') THEN
    ALTER TABLE "order" ADD COLUMN money DOUBLE PRECISION DEFAULT NULL;
    RAISE NOTICE 'Added money column to order table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='params') THEN
    ALTER TABLE "order" ADD COLUMN params TEXT DEFAULT NULL;
    RAISE NOTICE 'Added params column to order table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='ip') THEN
    ALTER TABLE "order" ADD COLUMN ip VARCHAR(255) DEFAULT NULL;
    RAISE NOTICE 'Added ip column to order table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='notify_info') THEN
    ALTER TABLE "order" ADD COLUMN notify_info TEXT DEFAULT NULL;
    RAISE NOTICE 'Added notify_info column to order table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='pay_url') THEN
    ALTER TABLE "order" ADD COLUMN pay_url VARCHAR(255) DEFAULT NULL;
    RAISE NOTICE 'Added pay_url column to order table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='product_title') THEN
    ALTER TABLE "order" ADD COLUMN product_title VARCHAR(255) DEFAULT NULL;
    RAISE NOTICE 'Added product_title column to order table';
  END IF;
  
  -- Update user_id to VARCHAR if needed
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='user_id' AND data_type != 'character varying') THEN
    ALTER TABLE "order" ALTER COLUMN user_id TYPE VARCHAR(255);
    RAISE NOTICE 'Updated user_id column type to VARCHAR';
  END IF;
  
  -- Update product_id to allow NULL if needed
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='product_id' AND is_nullable='NO') THEN
    ALTER TABLE "order" ALTER COLUMN product_id DROP NOT NULL;
    RAISE NOTICE 'Updated product_id to allow NULL';
  END IF;
  
  -- Remove order_id column if it exists (not in MySQL schema)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='order_id') THEN
    ALTER TABLE "order" DROP CONSTRAINT IF EXISTS order_order_id_key;
    ALTER TABLE "order" DROP COLUMN order_id;
    RAISE NOTICE 'Removed order_id column';
  END IF;
  
  -- Remove pay_status and pay_time if they exist (not in MySQL schema)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='pay_status') THEN
    ALTER TABLE "order" DROP COLUMN pay_status;
    RAISE NOTICE 'Removed pay_status column';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='pay_time') THEN
    ALTER TABLE "order" DROP COLUMN pay_time;
    RAISE NOTICE 'Removed pay_time column';
  END IF;
  
  -- Update create_time and update_time to allow NULL if needed
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='create_time' AND is_nullable='NO') THEN
    ALTER TABLE "order" ALTER COLUMN create_time DROP NOT NULL;
    RAISE NOTICE 'Updated create_time to allow NULL';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='update_time' AND is_nullable='NO') THEN
    ALTER TABLE "order" ALTER COLUMN update_time DROP NOT NULL;
    RAISE NOTICE 'Updated update_time to allow NULL';
  END IF;
END $$;

-- ----------------------------
-- Migration: Fix turnover.value column type
-- ----------------------------
DO $$
BEGIN
  -- Check current column type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='turnover' AND column_name='value' AND data_type='double precision'
  ) THEN
    -- Change column type from DOUBLE PRECISION to VARCHAR
    ALTER TABLE turnover 
    ALTER COLUMN value TYPE VARCHAR(255) USING COALESCE(value::text, '0');
    
    -- Set NOT NULL constraint
    ALTER TABLE turnover 
    ALTER COLUMN value SET NOT NULL;
    
    -- Set default value
    ALTER TABLE turnover 
    ALTER COLUMN value SET DEFAULT '0';
    
    RAISE NOTICE 'Converted turnover.value column from DOUBLE PRECISION to VARCHAR';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='turnover' AND column_name='value' AND data_type='character varying'
  ) THEN
    -- Ensure NOT NULL constraint
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name='turnover' AND column_name='value' AND is_nullable='YES'
    ) THEN
      ALTER TABLE turnover 
      ALTER COLUMN value SET NOT NULL;
      RAISE NOTICE 'Set NOT NULL constraint on turnover.value';
    END IF;
    
    -- Ensure default value
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name='turnover' AND column_name='value' AND column_default LIKE '%0%'
    ) THEN
      ALTER TABLE turnover 
      ALTER COLUMN value SET DEFAULT '0';
      RAISE NOTICE 'Set default value on turnover.value';
    END IF;
  END IF;
END $$;

-- Migration completed
SELECT 'Migration completed successfully!' AS status;

