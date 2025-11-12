-- Add OpenAI API Key to the database
-- Run this SQL script in your MySQL database to configure OpenAI API key

-- First, delete any existing openai-chat keys to avoid duplicates
DELETE FROM `aikey` WHERE `type` = 'openai-chat';

-- Insert OpenAI API Key
-- Using a large unique ID
INSERT INTO `aikey` (
  `id`,
  `key`,
  `host`,
  `remarks`,
  `type`,
  `models`,
  `check`,
  `limit`,
  `usage`,
  `status`,
  `create_time`,
  `update_time`
) VALUES (
  1000000000000000001,
  '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',
  'https://api.openai.com',
  'OpenAI API Key',
  'openai-chat',
  'gpt-4,gpt-5,gpt-5-mini',
  1,
  0,
  0,
  1,
  NOW(),
  NOW()
);

-- Verify the insertion - should show 1 row
SELECT 
  id, 
  LEFT(key, 20) as key_preview, 
  host, 
  type, 
  models, 
  status, 
  `check`
FROM `aikey` 
WHERE `type` = 'openai-chat';

-- Test query to verify model matching works
-- This should return the key we just inserted
SELECT 
  id,
  models,
  status
FROM `aikey`
WHERE `status` = 1
  AND (
    `models` LIKE 'gpt-5,%'
    OR `models` LIKE '%,gpt-5'
    OR `models` LIKE '%,gpt-5,%'
    OR `models` = 'gpt-5'
  );

