import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { UserInfo } from '@/types'

export interface AdminState {
  // Admin user information
  admin_info: UserInfo | undefined
  // Admin Token
  admin_token: string | undefined
  // Admin Login
  adminLogin: (data: { token: string; user_info: UserInfo }) => void
  // Admin Logout
  adminLogout: () => void
}

const adminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      admin_info: undefined,
      admin_token: undefined,
      adminLogin: (data) => {
        // Only update if we have valid data
        if (data && data.token && data.user_info) {
          set(() => ({ 
            admin_token: data.token, 
            admin_info: data.user_info 
          }))
        }
      },
      adminLogout: () => {
        // Explicitly clear admin storage
        set(() => ({ 
          admin_info: undefined, 
          admin_token: undefined 
        }))
        // Clear admin login timestamp and force clear persisted storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_last_login_time')
          // Force clear the persisted storage to prevent stale tokens
          try {
            const adminStorage = localStorage.getItem('admin_storage')
            if (adminStorage) {
              const parsed = JSON.parse(adminStorage)
              if (parsed?.state) {
                parsed.state.admin_token = undefined
                parsed.state.admin_info = undefined
                localStorage.setItem('admin_storage', JSON.stringify(parsed))
              } else {
                // Direct format
                parsed.admin_token = undefined
                parsed.admin_info = undefined
                localStorage.setItem('admin_storage', JSON.stringify(parsed))
              }
            }
          } catch (e) {
            // If parsing fails, just remove the whole storage
            localStorage.removeItem('admin_storage')
          }
        }
      }
    }),
    {
      name: 'admin_storage', // Separate storage for admin
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields to ensure isolation
      partialize: (state) => ({
        admin_token: state.admin_token,
        admin_info: state.admin_info
      })
    }
  )
)

export default adminStore
