import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { ConsumeRecordInfo, InvitationRecordInfo, ResponseLoginData, UserInfo } from '@/types'
import { TableData } from '@/types/admin'

export interface userState {
  // Login modal switch
  loginModal: boolean
  // User information
  user_info: UserInfo | undefined
  // Login Token
  token: string | undefined
  // Modify login modal
  setLoginModal: (value: boolean) => void
  // Login
  login: (data: ResponseLoginData) => void
  // Logout
  logout: () => void
  // Record data
  invitation_records: TableData<InvitationRecordInfo>
  // Consumption records
  consume_records: TableData<ConsumeRecordInfo>
  // Withdrawal records
  withdrawal_records: TableData<InvitationRecordInfo>
  changeRecords: (data: TableData<any>, type: string | number) => void
  changeUserCurrentAmount: (amount?: number) => void
}

const userStore = create<userState>()(
  persist(
    (set, get) => ({
      loginModal: false,
      user_info: undefined,
      token: undefined,
      setLoginModal: (value) => set({ loginModal: value }),
      login: (data) => set(() => ({ ...data })),
      logout: () => set(() => ({ user_info: undefined, token: undefined })),
      invitation_records: {
        count: 0,
        rows: []
      },
      consume_records: {
        count: 0,
        rows: []
      },
      withdrawal_records: {
        count: 0,
        rows: []
      },
      changeUserCurrentAmount: (amount) =>
        set((state) => {
          const current_amount = amount ? Number(state.user_info?.current_amount || 0) + amount : 0
          const userInfo = {
            ...(state.user_info || {}),
            current_amount
          } as UserInfo
          return {
            user_info: userInfo
          }
        }),
      changeRecords: (data, type) =>
        set(() => {
          if (type === 'invitation_records') {
            return {
              invitation_records: { ...data }
            }
          }

          if (type === 'consume_records') {
            return {
              consume_records: { ...data }
            }
          }

          if (type === 'withdrawal_records') {
            return {
              withdrawal_records: { ...data }
            }
          }

          return {}
        })
    }),
    {
      name: 'user_storage', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage) // (optional) by default the 'localStorage' is used
    }
  )
)

export default userStore
