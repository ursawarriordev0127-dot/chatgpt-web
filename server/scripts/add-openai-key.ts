import { aikeyModel } from '../models'
import { generateNowflakeId } from '../utils'
import { formatTime } from '../utils'

async function addOpenAIKey() {
  const apiKey = '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'
  const host = 'https://api.openai.com'
  
  // Models supported by this key (comma-separated)
  const models = 'gpt-4,gpt-5,gpt-5-mini'
  
  try {
    // Check if key already exists
    const existingKey = await aikeyModel.getOneAikey({ model: 'gpt-5' })
    
    if (existingKey && existingKey.id) {
      console.log('API key already exists. Updating...')
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
      console.log('✅ API key updated successfully!')
    } else {
      // Add new API key
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
      console.log('✅ API key added successfully!')
    }
    
    console.log('\nConfiguration:')
    console.log(`Host: ${host}`)
    console.log(`Models: ${models}`)
    console.log('Type: openai-chat')
    console.log('\n✨ Your ChatGPT application should now work!')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error adding API key:', error)
    process.exit(1)
  }
}

addOpenAIKey()

