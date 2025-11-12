import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { PersonaInfo } from '@/types'

export interface PersonaState {
  // AI personas
  personas: Array<PersonaInfo>
  // Add AI persona
  changePersonas: (list: Array<PersonaInfo>) => void
}

const personaStore = create<PersonaState>()(
  persist(
    (set, get) => ({
      personas: [],
      changePersonas: (list) => set((state: PersonaState) => ({ personas: list }))
    }),
    {
      name: 'persona_storage', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage) // (optional) by default the 'localStorage' is used
    }
  )
)

export default personaStore
