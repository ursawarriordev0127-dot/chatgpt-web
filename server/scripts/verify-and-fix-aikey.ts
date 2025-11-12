import { aikeyModel } from '../models'
import { generateNowflakeId } from '../utils'
import { formatTime } from '../utils'

async function verifyAndFixAikey() {
  console.log('🔍 Checking API key configuration...\n')
  
  const testModels = ['gpt-4', 'gpt-5', 'gpt-5-mini']
  
  for (const model of testModels) {
    console.log(`Checking for model: ${model}`)
    const aikeyInfo = await aikeyModel.getOneAikey({ model })
    
    if (aikeyInfo && aikeyInfo.id) {
      console.log(`✅ Found API key for ${model}:`)
      console.log(`   ID: ${aikeyInfo.id}`)
      console.log(`   Host: ${aikeyInfo.host}`)
      console.log(`   Models: ${aikeyInfo.models}`)
      console.log(`   Status: ${aikeyInfo.status}`)
      console.log(`   Type: ${aikeyInfo.type}\n`)
    } else {
      console.log(`❌ No API key found for ${model}\n`)
    }
  }
  
  // Try to add/update the key
  console.log('🔧 Attempting to add/update OpenAI API key...\n')
  
  const apiKey = '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'
  const host = 'https://api.openai.com'
  const models = 'gpt-4,gpt-5,gpt-5-mini'
  
  try {
    // Check for existing openai-chat keys
    const existingKeys = await aikeyModel.getAikeys({ page: 0, page_size: 100 }, {
      type: 'openai-chat'
    })
    
    if (existingKeys.rows.length > 0) {
      console.log(`Found ${existingKeys.rows.length} existing openai-chat key(s). Updating first one...`)
      const existingKey = existingKeys.rows[0].toJSON()
      await aikeyModel.editAikey(existingKey.id, {
        key: apiKey,
        host: host,
        models: models,
        type: 'openai-chat',
        status: 1,
        check: 1,
        limit: 0,
        usage: 0,
        remarks: 'OpenAI API Key',
        update_time: formatTime()
      })
      console.log('✅ Updated existing API key\n')
    } else {
      console.log('No existing key found. Creating new one...')
      const id = generateNowflakeId(1)()
      await aikeyModel.addAikey({
        id: id,
        key: apiKey,
        host: host,
        models: models,
        type: 'openai-chat',
        status: 1,
        check: 1,
        limit: 0,
        usage: 0,
        remarks: 'OpenAI API Key',
        create_time: formatTime(),
        update_time: formatTime()
      })
      console.log('✅ Created new API key\n')
    }
    
    // Verify again
    console.log('🔍 Verifying configuration after update...\n')
    for (const model of testModels) {
      const aikeyInfo = await aikeyModel.getOneAikey({ model })
      if (aikeyInfo && aikeyInfo.id) {
        console.log(`✅ ${model}: OK`)
      } else {
        console.log(`❌ ${model}: Still not found`)
      }
    }
    
    console.log('\n✨ Setup complete!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

verifyAndFixAikey()

