-- PostgreSQL Database Initialization Script
-- Run this script after creating the database to set up the schema

-- Enable UUID extension (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------
-- Table structure for user
-- ----------------------------
CREATE TABLE IF NOT EXISTS "user" (
  id VARCHAR(255) PRIMARY KEY,
  nickname VARCHAR(255) DEFAULT NULL,
  account VARCHAR(255) NOT NULL DEFAULT '',
  password VARCHAR(255) NOT NULL DEFAULT '',
  avatar VARCHAR(255) DEFAULT NULL,
  role VARCHAR(255) DEFAULT NULL,
  integral INTEGER DEFAULT 0,
  cashback_ratio INTEGER DEFAULT NULL,
  vip_expire_time TIMESTAMP DEFAULT NULL,
  svip_expire_time TIMESTAMP DEFAULT NULL,
  status INTEGER DEFAULT 1,
  ip VARCHAR(255) DEFAULT NULL,
  invite_code VARCHAR(255) DEFAULT NULL,
  superior_id VARCHAR(255) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  aikey_id VARCHAR(255) DEFAULT NULL,
  create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- Table structure for action
-- ----------------------------
CREATE TABLE IF NOT EXISTS action (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(255) DEFAULT NULL,
  describe VARCHAR(255) DEFAULT NULL,
  ip VARCHAR(255) DEFAULT NULL,
  create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- Table structure for invite_record
-- ----------------------------
CREATE TABLE IF NOT EXISTS invite_record (
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

-- ----------------------------
-- Table structure for amount_details
-- ----------------------------
CREATE TABLE IF NOT EXISTS amount_details (
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

-- ----------------------------
-- Table structure for cashback
-- ----------------------------
CREATE TABLE IF NOT EXISTS cashback (
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

-- ----------------------------
-- Table structure for aikey
-- ----------------------------
CREATE TABLE IF NOT EXISTS aikey (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL DEFAULT '',
  host VARCHAR(255) NOT NULL DEFAULT '',
  remarks VARCHAR(255) DEFAULT NULL,
  type VARCHAR(255) DEFAULT NULL,
  models VARCHAR(255) DEFAULT NULL,
  "check" INTEGER DEFAULT NULL,
  "limit" DOUBLE PRECISION DEFAULT 0,
  usage DOUBLE PRECISION DEFAULT 0,
  status INTEGER DEFAULT 1,
  create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- Table structure for config
-- ----------------------------
CREATE TABLE IF NOT EXISTS config (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  value TEXT,
  remarks VARCHAR(255) DEFAULT NULL,
  create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- Table structure for product
-- ----------------------------
CREATE TABLE IF NOT EXISTS product (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL DEFAULT '',
  title VARCHAR(255) DEFAULT '',
  price DOUBLE PRECISION DEFAULT 0,
  original_price DOUBLE PRECISION DEFAULT 0,
  vip_price DOUBLE PRECISION DEFAULT 0,
  value INTEGER DEFAULT NULL,
  badge VARCHAR(255) DEFAULT NULL,
  type VARCHAR(255) DEFAULT NULL,
  level INTEGER DEFAULT 1,
  days INTEGER DEFAULT 0,
  inventory INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  describe VARCHAR(255) DEFAULT NULL,
  sort INTEGER DEFAULT 1,
  status INTEGER DEFAULT 1,
  create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- Table structure for order
-- ----------------------------
CREATE TABLE IF NOT EXISTS "order" (
  id BIGSERIAL PRIMARY KEY,
  trade_no VARCHAR(255) DEFAULT NULL,
  pay_type VARCHAR(255) DEFAULT NULL,
  product_id BIGINT DEFAULT NULL,
  trade_status VARCHAR(255) DEFAULT NULL,
  user_id VARCHAR(255) DEFAULT NULL,
  product_info TEXT DEFAULT NULL,
  channel VARCHAR(255) DEFAULT NULL,
  payment_id BIGINT DEFAULT NULL,
  payment_info TEXT DEFAULT NULL,
  money DOUBLE PRECISION DEFAULT NULL,
  params TEXT DEFAULT NULL,
  ip VARCHAR(255) DEFAULT NULL,
  notify_info TEXT DEFAULT NULL,
  pay_url VARCHAR(255) DEFAULT NULL,
  product_title VARCHAR(255) DEFAULT NULL,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- Table structure for message
-- ----------------------------
CREATE TABLE IF NOT EXISTS message (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  parent_message_id VARCHAR(255) DEFAULT NULL,
  persona_id BIGINT DEFAULT NULL,
  plugin_id BIGINT DEFAULT NULL,
  frequency_penalty DOUBLE PRECISION DEFAULT NULL,
  max_tokens INTEGER DEFAULT NULL,
  model VARCHAR(255) DEFAULT NULL,
  presence_penalty DOUBLE PRECISION DEFAULT NULL,
  temperature DOUBLE PRECISION DEFAULT NULL,
  status INTEGER DEFAULT 1,
  create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- Table structure for dialog
-- ----------------------------
CREATE TABLE IF NOT EXISTS dialog (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) DEFAULT NULL,
  issue TEXT,
  answer TEXT,
  models VARCHAR(255) DEFAULT NULL,
  delay INTEGER NOT NULL DEFAULT 0,
  status INTEGER DEFAULT 1,
  create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- Table structure for persona
-- ----------------------------
CREATE TABLE IF NOT EXISTS persona (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) DEFAULT NULL,
  description VARCHAR(255) DEFAULT NULL,
  context TEXT,
  status INTEGER DEFAULT 1,
  system INTEGER DEFAULT 0,
  create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- Table structure for plugin
-- ----------------------------
CREATE TABLE IF NOT EXISTS plugin (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  variables VARCHAR(255) DEFAULT NULL,
  function TEXT DEFAULT NULL,
  script TEXT DEFAULT NULL,
  status INTEGER NOT NULL DEFAULT 1,
  create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- Table structure for carmi
-- ----------------------------
CREATE TABLE IF NOT EXISTS carmi (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) DEFAULT NULL,
  ip VARCHAR(255) DEFAULT NULL,
  key VARCHAR(255) NOT NULL UNIQUE,
  value VARCHAR(255) NOT NULL,
  status INTEGER DEFAULT 0,
  type VARCHAR(255) NOT NULL,
  level INTEGER DEFAULT NULL,
  end_time VARCHAR(255) DEFAULT NULL,
  create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- Table structure for signin
-- ----------------------------
CREATE TABLE IF NOT EXISTS signin (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  ip VARCHAR(255) DEFAULT NULL,
  status INTEGER DEFAULT 1,
  create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- Table structure for turnover
-- ----------------------------
CREATE TABLE IF NOT EXISTS turnover (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  value VARCHAR(255) NOT NULL DEFAULT '0',
  describe VARCHAR(255) DEFAULT NULL,
  create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- Table structure for payment
-- ----------------------------
CREATE TABLE IF NOT EXISTS payment (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  channel VARCHAR(255) NOT NULL DEFAULT '',
  types VARCHAR(255) DEFAULT NULL,
  params TEXT DEFAULT NULL,
  status INTEGER NOT NULL DEFAULT 1,
  create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- Table structure for notification
-- ----------------------------
CREATE TABLE IF NOT EXISTS notification (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  sort INTEGER DEFAULT 1,
  status INTEGER DEFAULT 1,
  create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- Table structure for withdrawal_record
-- ----------------------------
CREATE TABLE IF NOT EXISTS withdrawal_record (
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

-- ----------------------------
-- Table structure for draw_record
-- ----------------------------
CREATE TABLE IF NOT EXISTS draw_record (
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

-- ----------------------------
-- Table structure for installed_plugin
-- ----------------------------
CREATE TABLE IF NOT EXISTS installed_plugin (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  plugin_id BIGINT NOT NULL,
  status INTEGER DEFAULT NULL,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_installed_plugin_user_id ON installed_plugin(user_id);
CREATE INDEX IF NOT EXISTS idx_installed_plugin_plugin_id ON installed_plugin(plugin_id);

-- ----------------------------
-- Table structure for upload_record
-- ----------------------------
CREATE TABLE IF NOT EXISTS upload_record (
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

-- ----------------------------
-- Create indexes for better performance
-- ----------------------------
CREATE INDEX IF NOT EXISTS idx_user_account ON "user"(account);
CREATE INDEX IF NOT EXISTS idx_order_user_id ON "order"(user_id);
CREATE INDEX IF NOT EXISTS idx_order_order_id ON "order"(order_id);
CREATE INDEX IF NOT EXISTS idx_message_user_id ON message(user_id);
CREATE INDEX IF NOT EXISTS idx_message_parent_message_id ON message(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_dialog_user_id ON dialog(user_id);
CREATE INDEX IF NOT EXISTS idx_persona_user_id ON persona(user_id);
CREATE INDEX IF NOT EXISTS idx_plugin_user_id ON plugin(user_id);
CREATE INDEX IF NOT EXISTS idx_carmi_key ON carmi(key);
CREATE INDEX IF NOT EXISTS idx_carmi_user_id ON carmi(user_id);
CREATE INDEX IF NOT EXISTS idx_signin_user_id ON signin(user_id);
CREATE INDEX IF NOT EXISTS idx_turnover_user_id ON turnover(user_id);
CREATE INDEX IF NOT EXISTS idx_action_user_id ON action(user_id);

-- ----------------------------
-- Migration: Add missing columns to existing tables
-- ----------------------------
-- Create action table if it doesn't exist
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
  END IF;
END $$;

-- ----------------------------
-- Migration: Add missing columns to existing tables
-- ----------------------------
-- Add missing columns to message table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='message' AND column_name='frequency_penalty') THEN
    ALTER TABLE message ADD COLUMN frequency_penalty DOUBLE PRECISION DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='message' AND column_name='max_tokens') THEN
    ALTER TABLE message ADD COLUMN max_tokens INTEGER DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='message' AND column_name='model') THEN
    ALTER TABLE message ADD COLUMN model VARCHAR(255) DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='message' AND column_name='presence_penalty') THEN
    ALTER TABLE message ADD COLUMN presence_penalty DOUBLE PRECISION DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='message' AND column_name='temperature') THEN
    ALTER TABLE message ADD COLUMN temperature DOUBLE PRECISION DEFAULT NULL;
  END IF;
  
  -- Fix status column type if it's VARCHAR
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='message' AND column_name='status' AND data_type='character varying'
  ) THEN
    UPDATE message SET status = '1' WHERE status = 'pass';
    UPDATE message SET status = '0' WHERE status = 'fail';
    ALTER TABLE message ALTER COLUMN status DROP DEFAULT;
    ALTER TABLE message ALTER COLUMN status TYPE INTEGER 
      USING CASE 
        WHEN status = 'pass' OR status = '1' THEN 1
        WHEN status = 'fail' OR status = '0' THEN 0
        ELSE 1
      END;
    ALTER TABLE message ALTER COLUMN status SET DEFAULT 1;
  END IF;
END $$;

-- Add missing columns to persona table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='persona' AND column_name='system') THEN
    ALTER TABLE persona ADD COLUMN system INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='persona' AND column_name='title') THEN
    -- Check if 'name' column exists and rename it to 'title'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='persona' AND column_name='name') THEN
      ALTER TABLE persona RENAME COLUMN name TO title;
    ELSE
      ALTER TABLE persona ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT '';
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='persona' AND column_name='description') THEN
    ALTER TABLE persona ADD COLUMN description VARCHAR(255) DEFAULT NULL;
  END IF;
END $$;

-- Add missing columns to user table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='nickname') THEN
    ALTER TABLE "user" ADD COLUMN nickname VARCHAR(255) DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='role') THEN
    ALTER TABLE "user" ADD COLUMN role VARCHAR(255) DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='ip') THEN
    ALTER TABLE "user" ADD COLUMN ip VARCHAR(255) DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='invite_code') THEN
    ALTER TABLE "user" ADD COLUMN invite_code VARCHAR(255) DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='superior_id') THEN
    ALTER TABLE "user" ADD COLUMN superior_id VARCHAR(255) DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='user_agent') THEN
    ALTER TABLE "user" ADD COLUMN user_agent TEXT DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='cashback_ratio') THEN
    ALTER TABLE "user" ADD COLUMN cashback_ratio INTEGER DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='aikey_id') THEN
    ALTER TABLE "user" ADD COLUMN aikey_id VARCHAR(255) DEFAULT NULL;
  END IF;
END $$;

-- ----------------------------
-- Add OpenAI API Key (Example)
-- ----------------------------
INSERT INTO aikey (key, host, remarks, type, models, "check", "limit", usage, status)
VALUES (
  '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',
  'https://api.openai.com',
  'OpenAI API Key',
  'openai-chat',
  'gpt-4,gpt-5,gpt-5-mini',
  1,
  0,
  0,
  1
) ON CONFLICT DO NOTHING;

