import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { PromptInfo } from '@/types';

export interface PromptState {
  // Local AI prompt instructions
  localPrompt: Array<PromptInfo>;
  // Add AI prompt instructions
  addPrompts: (list: Array<PromptInfo>) => void;
  // Clear all AI prompt instructions
  clearPrompts: () => void;
  // Delete single AI prompt instruction
  delPrompt: (info: PromptInfo) => void;
  // Edit AI prompt instruction information
  editPrompt: (oldKey: string, info: PromptInfo) => void;
}

const promptStore = create<PromptState>()(
  persist(
    (set, get) => ({
      localPrompt: [],
      addPrompts: (list) =>
        set((state: PromptState) => {
          const resultMap = new Map();
          state.localPrompt.forEach((item) => resultMap.set(item.key, item));
          list.forEach((item) => resultMap.set(item.key, item));
          return {
            localPrompt: [...Array.from(resultMap.values())],
          };
        }),
      clearPrompts: () => set({ localPrompt: [] }),
      editPrompt: (oldKey, info) =>
        set((state: PromptState) => {
          const newList = state.localPrompt.map((item) => {
            if (oldKey === item.key) {
              return {
                ...info,
              };
            }
            return {
              ...item,
            };
          });
          return {
            localPrompt: [...newList],
          };
        }),
      delPrompt: (info) =>
        set((state: PromptState) => {
          const newList = state.localPrompt.filter(
            (item) => item.key !== info.key && item.value !== info.value
          );
          return {
            localPrompt: [...newList],
          };
        }),
    }),
    {
      name: 'prompt_storage', // name of item in the storage (must be unique)
      version: 2,
      storage: createJSONStorage(() => localStorage), // (optional) by default the 'localStorage' is used
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return {
            ...persistedState,
            localPrompt: [],
          } as PromptState
        }
        return persistedState as PromptState
      },
    }
  )
);

export default promptStore;
