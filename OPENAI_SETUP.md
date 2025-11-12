# OpenAI API Key Setup Guide

This guide will help you configure your OpenAI API key so the ChatGPT application works properly.

## Method 1: Using SQL Script (Recommended)

1. Open your MySQL database client (phpMyAdmin, MySQL Workbench, or command line)
2. Select your database
3. Run the SQL script located at `server/sql/add-openai-key.sql`

Or copy and paste this SQL directly:

```sql
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
  'gpt-3.5-turbo,gpt-3.5-turbo-16k,gpt-4,gpt-4-0613,gpt-4-32k,gpt-4-32k-0613',
  1,
  0,
  0,
  1,
  NOW(),
  NOW()
);
```

## Method 2: Using Admin Panel

1. Log in to your admin panel
2. Navigate to the "API Keys" section
3. Click "Add New API Key"
4. Fill in the form:
   - **Key**: `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`
   - **Host**: `https://api.openai.com`
   - **Type**: `openai-chat`
   - **Models**: `gpt-3.5-turbo,gpt-3.5-turbo-16k,gpt-4,gpt-4-0613,gpt-4-32k,gpt-4-32k-0613`
   - **Status**: Active (1)
   - **Check**: Yes (1)
5. Save the configuration

## Method 3: Using API Endpoint (if you have admin access)

Make a POST request to `/api/admin/aikey` with the following JSON:

```json
{
  "key": "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",
  "host": "https://api.openai.com",
  "remarks": "OpenAI API Key",
  "type": "openai-chat",
  "models": "gpt-3.5-turbo,gpt-3.5-turbo-16k,gpt-4,gpt-4-0613,gpt-4-32k,gpt-4-32k-0613",
  "check": 1,
  "status": 1
}
```

## Verification

After adding the API key, verify it's working:

1. Restart your server (if needed)
2. Try sending a message "hi" in the chat
3. You should receive a response from ChatGPT instead of the error message

## Troubleshooting

- **Error persists**: Make sure the API key is valid and has sufficient credits
- **Still getting "Administrator has not configured"**: Check that the `models` field includes the model you're trying to use (e.g., `gpt-3.5-turbo-16k`)
- **Database connection issues**: Ensure your database connection is working properly

## Supported Models

The configured API key supports these models:
- `gpt-3.5-turbo`
- `gpt-3.5-turbo-16k`
- `gpt-4`
- `gpt-4-0613`
- `gpt-4-32k`
- `gpt-4-32k-0613`

Make sure your frontend configuration uses one of these models.

