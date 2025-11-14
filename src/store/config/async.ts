import { getConfig } from '@/request/api'
import configStore from './slice'

async function fetchConfig() {
  const res = await getConfig()
  if (!res.code) {
    // Map chat_models from database to models for the store
    const data = res.data
    let modelsToUse: Array<{ label: string; value: string }> = []
    
    // Priority: Use chat_models from database if available
    if (data.chat_models && Array.isArray(data.chat_models) && data.chat_models.length > 0) {
      // Ensure all models have valid label and value as strings
      modelsToUse = data.chat_models
        .filter((m: any) => m && typeof m === 'object' && (m.label || m.value))
        .map((m: any) => ({
          label: String(m.label || m.value || ''),
          value: String(m.value || m.label || '')
        }))
      console.log('[Config] ✅ Loaded', modelsToUse.length, 'models from database:', modelsToUse.map(m => m.value).join(', '))
    } else if (data.models && Array.isArray(data.models) && data.models.length > 0) {
      // Fallback to models if chat_models not available
      modelsToUse = data.models
        .filter((m: any) => m && typeof m === 'object' && (m.label || m.value))
        .map((m: any) => ({
          label: String(m.label || m.value || ''),
          value: String(m.value || m.label || '')
        }))
      console.log('[Config] Using models from response:', modelsToUse.length, 'models')
    } else {
      // No models found in database - log warning but keep empty array
      console.warn('[Config] ⚠️ No models found in database. Please configure API keys in admin panel.')
      modelsToUse = []
    }
    
    // Ensure models are set in the data object
    data.models = modelsToUse
    
    // If models are loaded and config.model is empty or invalid, set it to the first model
    if (modelsToUse.length > 0) {
      const currentConfig = configStore.getState().config
      const currentModel = currentConfig?.model || ''
      // If current model is not in the available models, set to first model
      const modelExists = modelsToUse.some(m => m.value === currentModel)
      if (!modelExists || !currentModel) {
        data.config = {
          ...currentConfig,
          model: modelsToUse[0].value
        }
        console.log('[Config] Set default model to:', modelsToUse[0].value)
      }
    }
    
    // Update the store with all data including models
    configStore.getState().replaceData(data)
    
    const finalModels = configStore.getState().models
    if (finalModels.length > 0) {
      console.log('[Config] ✅ Store updated with', finalModels.length, 'models')
    } else {
      console.warn('[Config] ⚠️ Store has no models. Check API key configuration in admin panel.')
    }
  } else {
    console.error('[Config] ❌ Failed to fetch config:', res.message)
  }
  return res
}

export default {
  fetchConfig
}
