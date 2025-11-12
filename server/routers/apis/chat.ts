import express from 'express'
import {
  configModel,
  messageModel,
  aikeyModel,
  turnoverModel,
  userModel,
  actionModel,
  dialogModel,
  personaModel,
  installedPluginModel,
  pluginModel
} from '../../models'
import chat, { getProxyAgent } from '../../helpers/chat'
import { GPTTokens, supportModelType } from 'gpt-tokens'
import {
  httpBody,
  getClientIP,
  generateNowflakeId,
  generateUUID,
  checkProhibitedWords
} from '../../utils'
import { ExpressRequest } from '../../type'
import { formatTime } from '../../utils'
import textModeration from '../../helpers/textModeration'
import jsvm from '../../helpers/jsvm'

const router = express.Router()

// Single conversation
router.post('/chat/completion', async (req: ExpressRequest, res, next) => {
  const user_id = req?.user_id
  if (!user_id) {
    res.status(500).json(httpBody(-1, 'Server error'))
    return
  }
  const { prompt } = req.body
  const ip = getClientIP(req)
  const messages: Array<any> = []
  const systemMessages = await personaModel.getPersonaContext({
    status: 1,
    system: 1
  })

  messages.push(...systemMessages)

  messages.push({
    role: 'user',
    content: prompt
  })

  const options: {
    model: supportModelType
  } = {
    model: 'gpt-5'
  }

  const userInfo = await userModel.getUserInfo({
    id: user_id
  })
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTime = today.getTime()
  const vipExpireTime = new Date(userInfo.vip_expire_time).getTime()
  const svipExpireTime = new Date(userInfo.svip_expire_time).getTime()

  const ai3_ratio = (await configModel.getConfigValue('ai3_ratio')) || 0
  const chatRatio = Number(ai3_ratio)

  // Calculate base token cost
  const askUsageTokenInfo = new GPTTokens({
    model: options.model,
    messages: [...messages]
  })
  const asTokens = askUsageTokenInfo.usedTokens

  // Points used for the question
  const asIntegral = chatRatio ? Math.ceil(asTokens / chatRatio) : 0

  if (
    !(userInfo.integral > asIntegral || vipExpireTime >= todayTime || svipExpireTime >= todayTime)
  ) {
    res.status(400).json(httpBody(-1, [], 'Insufficient account points balance, please recharge before using.'))
    return
  }

  const aikeyInfo = await aikeyModel.getOneAikey({ model: options.model })
  if (!aikeyInfo || !aikeyInfo.id) {
    console.error(`[Chat Error] No API key found for model: ${options.model}`)
    console.error(`[Chat Error] Requested model:`, options.model)
    const allKeys = await aikeyModel.getAikeys({ page: 0, page_size: 10 })
    console.error(`[Chat Error] Available keys in database:`, allKeys.rows.map((row: any) => ({
      id: row.id,
      type: row.type,
      models: row.models,
      status: row.status
    })))
    res.status(500).json(httpBody(-1, [], 'Administrator has not configured the corresponding AI model'))
    return
  }

  // Prepare API options
  const apiOptions: any = { ...options }
  
  // Check environment variable for GPT-5 streaming support
  const gpt5StreamingEnabled = process.env.GPT5_STREAMING_ENABLED === 'true'
  
  // GPT-5 and newer models use 'max_completion_tokens' instead of 'max_tokens'
  if (apiOptions.model && (apiOptions.model.includes('gpt-5') || apiOptions.model.includes('o1') || apiOptions.model.includes('o3'))) {
    if (apiOptions.max_tokens) {
      apiOptions.max_completion_tokens = apiOptions.max_tokens
      delete apiOptions.max_tokens
    }
    // GPT-5 only supports temperature value of 1 (default)
    // Remove temperature parameter to use the default
    if (apiOptions.temperature !== undefined && apiOptions.temperature !== 1) {
      console.log(`[GPT-5 Fix] Removing unsupported temperature value: ${apiOptions.temperature} for model: ${apiOptions.model}`)
      delete apiOptions.temperature
    }
    // Also remove other parameters that may not be supported
    if (apiOptions.presence_penalty !== undefined && apiOptions.presence_penalty !== 0) {
      delete apiOptions.presence_penalty
    }
    if (apiOptions.frequency_penalty !== undefined && apiOptions.frequency_penalty !== 0) {
      delete apiOptions.frequency_penalty
    }
  } else {
    // For older models, remove max_tokens if it's null or undefined
    if (apiOptions.max_tokens === null || apiOptions.max_tokens === undefined) {
      delete apiOptions.max_tokens
    }
  }

  await chat.streamChatCompletions(
    aikeyInfo,
    {
      ...apiOptions,
      messages,
      stream: true
    },
    res,
    (content) => {
      const describe = 'Conversation'
      console.log()
      if (!(svipExpireTime > todayTime || vipExpireTime > todayTime)) {
        const allUsageTokenInfo = new GPTTokens({
          model: options.model,
          messages: [
            ...messages,
            {
              role: 'assistant',
              content: content
            }
          ]
        })
        const tokens = allUsageTokenInfo.usedTokens
        const integral = chatRatio ? Math.ceil(tokens / chatRatio) : 0
        userModel.updataUserVIP({
          id: user_id,
          type: 'integral',
          value: integral,
          operate: 'decrement'
        })
        const turnoverId = generateNowflakeId(1)()
        turnoverModel.addTurnover({
          id: turnoverId,
          user_id,
          describe,
          value: `-${integral} points`
        })
        actionModel.addAction({
          user_id,
          id: generateNowflakeId(23)(),
          ip,
          type: 'chat',
          describe: `chat${describe}(${options.model})`
        })
      }
    }
  )
})

// Conversation
router.post('/chat/completions', async (req: ExpressRequest, res, next) => {
  const user_id = req?.user_id
  if (!user_id) {
    res.status(500).json(httpBody(-1, 'Server error'))
    return
  }

  const userInfo = await userModel.getUserInfo({
    id: user_id
  })

  const ip = getClientIP(req)

  const { prompt, parentMessageId: rawParentMessageId, persona_id: rawPersonaId } = req.body
  // Sanitize BIGINT fields: convert empty strings to null
  const persona_id = (rawPersonaId === '' || rawPersonaId === 'null' || rawPersonaId === 'undefined' || !rawPersonaId) ? null : rawPersonaId
  const parentMessageId = (rawParentMessageId === '' || rawParentMessageId === 'null' || rawParentMessageId === 'undefined' || !rawParentMessageId) ? null : rawParentMessageId
  const options: any = {
    frequency_penalty: 0,
    model: 'gpt-5',
    presence_penalty: 0,
    temperature: 0,
    ...req.body.options
  }
  
  // GPT-5 and newer models use 'max_completion_tokens' instead of 'max_tokens'
  const isGPT5OrNewer = options.model && (options.model.includes('gpt-5') || options.model.includes('o1') || options.model.includes('o3'))
  
  if (isGPT5OrNewer) {
    console.log(`[GPT-5 Request] Model: ${options.model}, Original params:`, {
      temperature: options.temperature,
      presence_penalty: options.presence_penalty,
      frequency_penalty: options.frequency_penalty,
      max_tokens: options.max_tokens
    })
    
    if (options.max_tokens) {
      options.max_completion_tokens = options.max_tokens
      delete options.max_tokens
    }
    // GPT-5 only supports temperature value of 1 (default)
    // Remove temperature parameter to use the default
    if (options.temperature !== undefined && options.temperature !== 1) {
      console.log(`[GPT-5 Fix] Removing unsupported temperature value: ${options.temperature}`)
      delete options.temperature
    }
    // Also remove other parameters that may not be supported
    if (options.presence_penalty !== undefined && options.presence_penalty !== 0) {
      console.log(`[GPT-5 Fix] Removing unsupported presence_penalty value: ${options.presence_penalty}`)
      delete options.presence_penalty
    }
    if (options.frequency_penalty !== undefined && options.frequency_penalty !== 0) {
      console.log(`[GPT-5 Fix] Removing unsupported frequency_penalty value: ${options.frequency_penalty}`)
      delete options.frequency_penalty
    }
    
    console.log(`[GPT-5 Request] Cleaned params for API call:`, {
      model: options.model,
      max_completion_tokens: options.max_completion_tokens,
      temperature: options.temperature,
      presence_penalty: options.presence_penalty,
      frequency_penalty: options.frequency_penalty
    })
  } else {
    // For older models, remove max_tokens if it's null or undefined
    if (options.max_tokens === null || options.max_tokens === undefined) {
      delete options.max_tokens
    }
  }

  const systemMessages = await personaModel.getPersonaContext({
    status: 1,
    system: 1
  })

  const personaMessages = await personaModel.getPersonaContext({
    id: persona_id,
    status: 1,
    system: 0
  })

  // Get history count
  const ai3CarryCount = await configModel.getConfigValue('ai3_carry_count')
  const ai4CarryCount = await configModel.getConfigValue('ai4_carry_count')
  let historyMessageCount = Number(ai3CarryCount) || 0

  if (options.model.indexOf('gpt-4') !== -1) {
    historyMessageCount = Number(ai4CarryCount) || 0
  }

  const getMessagesData = await messageModel.getMessages(
    { page: 0, page_size: Number(historyMessageCount) },
    {
      user_id,
      parent_message_id: parentMessageId,
      status: 1
    }
  )

  const historyMessage = getMessagesData.rows
    .map((item) => {
      return {
        role: item.toJSON().role,
        content: item.toJSON().content
      }
    })
    .reverse()

  const messages: Array<any> = [
    ...systemMessages,
    ...personaMessages,
    ...historyMessage,
    {
      role: 'user',
      content: prompt
    }
  ]

  // Get ratio
  const ai3_ratio = (await configModel.getConfigValue('ai3_ratio')) || 0
  const ai4_ratio = (await configModel.getConfigValue('ai4_ratio')) || 0
  const aiRatioInfo = {
    ai3_ratio,
    ai4_ratio
  }

  // Calculate base token cost
  const askUsageTokenInfo = new GPTTokens({
    model: options.model,
    messages: [...messages]
  })

  const asTokens = askUsageTokenInfo.usedTokens
  let chatRatio = Number(aiRatioInfo.ai3_ratio)
  if (options.model.indexOf('gpt-4') !== -1) {
    chatRatio = Number(aiRatioInfo.ai4_ratio)
  }
  // Points used for the question
  const asIntegral = chatRatio ? Math.ceil(asTokens / chatRatio) : 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTime = today.getTime()
  const vipExpireTime = new Date(userInfo.vip_expire_time).getTime()
  const svipExpireTime = new Date(userInfo.svip_expire_time).getTime()
  if (
    !(userInfo.integral > asIntegral || vipExpireTime >= todayTime || svipExpireTime >= todayTime)
  ) {
    res.status(400).json(httpBody(-1, [], 'Insufficient account points balance, please recharge before using.'))
    return
  }

  if (options.model.includes('gpt-4') && svipExpireTime < todayTime && userInfo.integral <= 0) {
    res.status(400).json(httpBody(-1, [], 'GPT4 is for super members or use points'))
    return
  }

  const aikeyInfo = await aikeyModel.getOneAikey({ model: options.model })
  if (!aikeyInfo || !aikeyInfo.id) {
    console.error(`[Chat Error] No API key found for model: ${options.model}`)
    console.error(`[Chat Error] Requested model:`, options.model)
    const allKeys = await aikeyModel.getAikeys({ page: 0, page_size: 10 })
    console.error(`[Chat Error] Available keys in database:`, allKeys.rows.map((row: any) => ({
      id: row.id,
      type: row.type,
      models: row.models,
      status: row.status
    })))
    res.status(500).json(httpBody(-1, [], 'Administrator has not configured the corresponding AI model'))
    return
  }

  const assistantMessageId = generateNowflakeId(2)()
  const userMessageId = generateNowflakeId(1)()
  const userMessageInfo = {
    user_id,
    id: userMessageId,
    role: 'user',
    content: prompt,
    parent_message_id: parentMessageId,
    persona_id: persona_id ? persona_id : null,
    create_time: formatTime(),
    ...options
  }
  const assistantInfo = {
    user_id,
    id: assistantMessageId,
    role: 'assistant',
    content: '',
    parent_message_id: parentMessageId,
    persona_id: persona_id ? persona_id : null,
    create_time: formatTime(),
    ...options
  }

  // Check if there is a built-in Q&A in the database
  const dialogInfo = await dialogModel.getOneDialogInfo({
    issue: prompt,
    model: options.model.substring(0, 5)
  })
  if (dialogInfo && dialogInfo.answer) {
    const answer = dialogInfo?.answer || ''
    assistantInfo.content = answer
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    })
    const uuid = generateUUID()
    const time = dialogInfo.delay || 0
    const sendAnswer = async () => {
      for (let i = 0; i < answer.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * time)) // Random delay 0~500ms
        const data = `${JSON.stringify({
          id: uuid,
          role: 'assistant',
          segment: i ? 'text' : 'start',
          dateTime: formatTime(),
          content: answer[i],
          parentMessageId
        })}\n\n`
        res.write(data)
      }

      const data = `${JSON.stringify({
        id: uuid,
        role: 'assistant',
        segment: 'end',
        dateTime: formatTime(),
        content: '',
        parentMessageId
      })}\n\n`
      res.write(data)

      await messageModel.addMessages([
        userMessageInfo,
        {
          ...assistantInfo,
          create_time: formatTime()
        }
      ])
      if (
        (options.model.includes('gpt-4') && svipExpireTime < todayTime) ||
        (!options.model.includes('gpt-4') && vipExpireTime < todayTime)
      ) {
        const allUsageTokenInfo = new GPTTokens({
          model: options.model,
          messages: [
            ...messages,
            {
              role: 'assistant',
              content: assistantInfo.content
            }
          ]
        })
        const tokens = allUsageTokenInfo.usedTokens
        const integral = chatRatio ? Math.ceil(tokens / chatRatio) : 0
        userModel.updataUserVIP({
          id: user_id,
          type: 'integral',
          value: integral,
          operate: 'decrement'
        })
        const turnoverId = generateNowflakeId(1)()
        turnoverModel.addTurnover({
          id: turnoverId,
          user_id,
          describe: `Conversation(${options.model})`,
          value: `-${integral} points`
        })
      }

      res.end()
    }

    await sendAnswer()

    return
  }

  // Content moderation
  const tuputech_key = await configModel.getConfigValue('tuputech_key')
  const prohibited_words = await configModel.getConfigValue('prohibited_words')
  if (tuputech_key) {
    const { action, details } = await textModeration.tuputech(tuputech_key, prompt)
    const matchedWords = Array.isArray(details) ? details?.map((item) => item.hint) : []
    if (action !== 'pass') {
      res
        .status(500)
        .json(
          httpBody(
            -1,
            `Sorry, the content you sent violates our rules, please modify and try again. Sensitive words involved: \`${matchedWords.join(
              '`, `'
            )}\``
          )
        )
      return
    }
  } else if (prohibited_words) {
    const { action, matchedWords = [] } = await checkProhibitedWords(prompt, prohibited_words)
    if (action !== 'pass') {
      res
        .status(500)
        .json(
          httpBody(
            -1,
            `Sorry, the content you sent violates our rules, please modify and try again. Sensitive words involved: \`${matchedWords.join(
              '`, `'
            )}\``
          )
        )
      return
    }
  }

  // Check if user has installed plugins
  const pluginMessages: Array<any> = []
  const installedPluginIds = await installedPluginModel.getUserInstalledPluginIds(user_id, {}, true)
  let selectPlugin: { [key: string]: string } | undefined = undefined
  let selectPluginModel: string | undefined = undefined
  if (installedPluginIds && installedPluginIds.length > 0) {
	// Use the same model for plugin function calls, or fall back to gpt-3.5-turbo
	selectPluginModel = options.model.includes('gpt-4') || options.model.includes('gpt-5') ? options.model : 'gpt-3.5-turbo'
    // View plugins
    const plugins = await pluginModel.getInPlugins(installedPluginIds)
    // Get proxy agent from environment variables
    const proxyAgent = getProxyAgent()
    const functionCallMessage = await chat.fetchChatFunction(aikeyInfo, {
      messages: [{ role: 'user', content: prompt }],
      functions: plugins.map((item) => JSON.parse(item.function)),
	  model: selectPluginModel
    }, proxyAgent)

    if (functionCallMessage?.function_call) {
      const scriptName = functionCallMessage.function_call.name || ''
      let params = functionCallMessage.function_call.arguments || undefined
      params = params.replace(/\n/g, '').replace(/\\/g, '')
      params = JSON.parse(params)

      selectPlugin =
        plugins.filter((item) => {
          const functionJson = JSON.parse(item.function)
          if (functionJson.name === scriptName) {
            return true
          }
          return false
        })[0] || undefined
      if (selectPlugin) {
        const variables = JSON.parse(selectPlugin.variables)
        const env = {}
        if (variables && Array.isArray(variables)) {
          variables.forEach((item) => {
            env[item.label] = item.value
          })
        }

        const runScriptResult = await jsvm.safeRunScript({
          script: selectPlugin.script,
          scriptName,
          env,
          params
        })

        if (runScriptResult) {
          pluginMessages.push(functionCallMessage)
          pluginMessages.push({
            role: 'function',
            name: scriptName,
            content: JSON.stringify(runScriptResult)
          })
        }
      }
    }
  }

  await chat.streamChatCompletions(
    aikeyInfo,
    {
      ...options,
	  model: selectPluginModel || options.model,
      messages: [...messages, ...pluginMessages],
      stream: true
    },
    res,
    (content) => {
      // End and save to database
      // Deduct some things here
      // Save user's message to database
      // Save returned data to database
      // Deduct related
      assistantInfo.content = content
      if (
        (options.model.includes('gpt-4') && svipExpireTime < todayTime) ||
        (!options.model.includes('gpt-4') && vipExpireTime < todayTime)
      ) {
        const allUsageTokenInfo = new GPTTokens({
          model: options.model,
          messages: [
            ...messages,
            {
              role: 'assistant',
              content: content
            }
          ]
        })
        const tokens = allUsageTokenInfo.usedTokens
        const integral = chatRatio ? Math.ceil(tokens / chatRatio) : 0
        userModel.updataUserVIP({
          id: user_id,
          type: 'integral',
          value: integral,
          operate: 'decrement'
        })
        const turnoverId = generateNowflakeId(1)()
        turnoverModel.addTurnover({
          id: turnoverId,
          user_id,
          describe: `Conversation(${options.model})`,
          value: `-${integral} points`
        })
      }
      messageModel.addMessages([
        userMessageInfo,
        {
          ...assistantInfo,
          plugin_id: selectPlugin?.id || null,
          create_time: formatTime()
        }
      ])
      actionModel.addAction({
        user_id,
        id: generateNowflakeId(23)(),
        ip,
        type: 'chat',
        describe: `Conversation(${options.model})`
      })
    },
    {
      pluginInfo: selectPlugin ? {
        id: selectPlugin?.id,
        name: selectPlugin?.name,
        avatar: selectPlugin?.avatar,
        description: selectPlugin?.description
      } : undefined
    }
  )
})

export default router
