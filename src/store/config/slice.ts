import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { ChatGptConfig, PersonaInfo } from '@/types'
import { NotificationInfo } from '@/types/admin'

export interface ConfigState {
  // Configuration information
  config: ChatGptConfig
  // Models
  models: Array<{
    label: string
    value: string
  }>
  // Configuration modal switch
  configModal: boolean
  // Modify configuration modal
  setConfigModal: (value: boolean) => void
  // Modify configuration
  changeConfig: (config: ChatGptConfig) => void
  notifications: Array<NotificationInfo>
  shop_introduce: string
  user_introduce: string
  replaceData: (config: { [key: string]: any }) => void
  website_title: string
  website_description: string
  website_keywords: string
  website_logo: string
  website_footer: string
  invite_introduce: string,
  random_personas: Array<PersonaInfo>
}

const configStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      configModal: false,
      notifications: [],
      shop_introduce: '',
      user_introduce: '',
      website_title: '',
      website_description: '',
      website_keywords: '',
      website_logo: '',
      website_footer: '',
      invite_introduce: '',
      random_personas: [],
      // Models will be loaded from database via fetchConfig()
      // Start with empty array - will be populated from API on app load
      models: [],
      config: {
        model: '',
        temperature: 1,
        presence_penalty: 0,
        frequency_penalty: 0,
        max_tokens: 1888
      },
      setConfigModal: (value) => set({ configModal: value }),
      changeConfig: (config) =>
        set((state: ConfigState) => ({
          config: { ...state.config, ...config }
        })),
      replaceData: (data) => {
        // Explicitly update models from database
        const newState = { ...data }

        // Priority: Use models if provided (already mapped in async.ts)
        if (data.models && Array.isArray(data.models) && data.models.length > 0) {
          // Ensure all models are properly formatted with string label and value
          newState.models = data.models
            .filter((m: any) => m && typeof m === 'object' && (m.label || m.value))
            .map((m: any) => ({
              label: String(m.label || m.value || ''),
              value: String(m.value || m.label || '')
            }))
        } else if (data.chat_models && Array.isArray(data.chat_models) && data.chat_models.length > 0) {
          // Map chat_models to models if models not directly provided
          newState.models = data.chat_models
            .filter((m: any) => m && typeof m === 'object' && (m.label || m.value))
            .map((m: any) => ({
              label: String(m.label || m.value || ''),
              value: String(m.value || m.label || '')
            }))
        }
        
        // If no models from database, keep existing models (don't clear them)
        if (!newState.models || newState.models.length === 0) {
          const currentState = get()
          if (currentState.models && currentState.models.length > 0) {
            newState.models = currentState.models
          } else {
            newState.models = []
          }
        }
        
        // Set default model if config.model is empty and we have models
        if (newState.models && newState.models.length > 0) {
          const currentConfig = get().config
          if (!currentConfig.model || !newState.models.some((m: { label: string; value: string }) => m.value === currentConfig.model)) {
            newState.config = {
              ...currentConfig,
              ...(data.config || {}),
              model: newState.models[0].value
            }
          } else {
            newState.config = {
              ...currentConfig,
              ...(data.config || {})
            }
          }
        }
        
        set((state: ConfigState) => ({ ...state, ...newState }))
      }
    }),
    {
      name: 'config_storage', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage) // (optional) by default the 'localStorage' is used
    }
  )
)

export default configStore
