import {
	ChatsInfo,
  ConsumeRecordInfo,
  DrawRecord,
  InvitationRecordInfo,
  PersonaInfo,
  PluginInfo,
  ProductInfo,
  RequesPrepay,
  RequestChatOptions,
  RequestImagesGenerations,
  RequestLoginParams,
  ResponseConfigData,
  ResponseLoginData,
  SigninInfo,
  SubscriptionInfo,
  TurnoverInfo,
  UserInfo,
  WithdrawalRecordInfo
} from '@/types'
import request from '.'
import { formatTime } from '@/utils'
import { TableData } from '@/types/admin'

// Get verification code (increased timeout to 30 seconds)
export function getCode(params: { source: string }) {
  return request.get('/api/send_sms', params, undefined, { timeout: 30000 })
}

// Login
export function postLogin(params: RequestLoginParams) {
  return request.post<ResponseLoginData>('/api/login', params)
}

// Get user information
export function getUserInfo() {
  return request.get<UserInfo>('/api/user/info')
}

// Request conversation
export function postChatCompletions(
  params: RequestChatOptions,
  config?: {
    headers?: { [key: string]: any }
    options?: { [key: string]: any }
  }
) {
  return request.postStreams<Response>('/api/chat/completions', params, config)
}

export function postChatCompletion(
  params: {
    prompt: string,
    type?: string
  },
  config?: {
    headers?: { [key: string]: any }
    options?: { [key: string]: any }
  }
) {
  return request.postStreams<Response>('/api/chat/completion', params, config)
}

// Request drawing
export function postImagesGenerations(
  params: RequestImagesGenerations,
  headers?: { [key: string]: any },
  options?: { [key: string]: any }
) {
  const formData = new FormData()
  Object.keys(params).forEach((key) => {
    formData.append(key, params[key])
  })
  return request.post<Array<DrawRecord>>(
    '/api/images/generations',
    formData,
    {
      'Content-Type': 'multipart/form-data',
      ...headers
    },
    options
  )
}

// Get product list
export function getProduct() {
  return request.get<{
    products: Array<ProductInfo>
    pay_types: Array<string>
  }>('/api/product')
}

// Get user consumption records
export function getUserTurnover(params: { page: number; page_size: number }) {
  return request.get<{ count: number; rows: Array<TurnoverInfo> }>('/api/turnover', params)
}

// Submit order
export function postPayPrecreate(params: RequesPrepay) {
  return request.post<{
    order_id: string
    pay_url: string
    pay_key: string
    qrcode?: string
  }>('/api/pay/precreate', params)
}

// Activation code recharge
export function postUseCarmi(params: { carmi: string }) {
  return request.post('/api/use_carmi', params)
}

// Sign in
export function postSignin() {
  return request.post('/api/signin')
}

// Get sign-in list
export function getSigninList() {
  return request.get<Array<SigninInfo>>('/api/signin/list')
}

// Get persona data
export function getPersonas(){
	return request.get<Array<PersonaInfo>>('/api/persona')
}

// Add persona data
export function postPersona(params: PersonaInfo){
	return request.post('/api/persona', params)
}

// Reset user password
export function putUserPassword(params: RequestLoginParams) {
  return request.put('/api/user/password', params)
}

// Get configuration data
export function getConfig() {
  return request.get<ResponseConfigData>('/api/config')
}

// Get user records
export function getUserRecords(params: { page: number; page_size: number; type: string | number }) {
  return request.get<TableData<InvitationRecordInfo | ConsumeRecordInfo | WithdrawalRecordInfo>>(
    '/api/user/records',
    params
  )
}

// Apply for withdrawal
export function postUserWithdrawal(params: WithdrawalRecordInfo) {
  return request.post('/api/user/withdrawal', params)
}

// Message list
export function getUserMessages(){
	return request.get<Array<ChatsInfo>>('/api/user/messages')
}

// Delete user conversation
export function delUserMessages(params: { parent_message_id?: string | number }){
	return request.del('/api/user/messages', params)
}

// Get plugin data
export function getPlugin(){
	return request.get<Array<PluginInfo>>('/api/plugin')
}

// Install plugin
export function putInstalledPlugin(id: string | number){
	return request.put(`/api/plugin/installed/${id}`)
}

// Uninstall plugin
export function putUninstallPlugin(id: string | number){
	return request.put(`/api/plugin/uninstall/${id}`)
}
// Get drawing data
export function getDrawImages(params: {
  page: number,
  page_size: number,
  type: 'gallery' | 'me' | string
}){
	return request.get<TableData<DrawRecord>>('/api/images', params)
}

// Modify drawing status
export function setDrawImages(params: {
  id?: string | number,
  status?: number
}){
	return request.put('/api/images', params)
}
