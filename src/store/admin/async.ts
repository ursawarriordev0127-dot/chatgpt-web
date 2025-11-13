import { RequestLoginParams } from '@/types'
import adminStore from './slice'
import { postLogin, getUserInfo } from '@/request/api'

// Admin Login
export async function fetchAdminLogin(params: RequestLoginParams) {
  // Add invite_code as empty string if not provided to avoid undefined error
  const loginParams = {
    ...params,
    invite_code: params.invite_code || ''
  }
  
  const response = await postLogin(loginParams)
  if (!response.code && response.data.user_info?.role === 'administrator') {
    adminStore.getState().adminLogin({ 
      token: response.data.token,
      user_info: response.data.user_info 
    })
    // Record admin login timestamp
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_last_login_time', Date.now().toString())
    }
  } else if (!response.code && response.data.user_info?.role !== 'administrator') {
    // Not an admin user
    return { code: 403, message: 'Access denied. Admin privileges required.' }
  }
  return response
}

// Get admin information
export async function fetchAdminInfo(token: string) {
  // We'll need to pass the admin token for this request
  const response = await getUserInfo()
  if (!response.code && response.data?.role === 'administrator') {
    adminStore.getState().adminLogin({
      token: adminStore.getState().admin_token || token,
      user_info: response.data
    })
  }
  return response
}

export default {
  fetchAdminLogin,
  fetchAdminInfo
}
