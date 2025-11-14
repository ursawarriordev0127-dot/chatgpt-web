import {
  CarmiInfo,
  ConfigInfo,
  MessageInfo,
  NotificationInfo,
  OrderInfo,
  Paging,
  PaymentInfo,
  ProductInfo,
  RequestAddCarmi,
  SigninInfo,
  TableData,
  AikeyInfo,
  TurnoverInfo,
  UserInfo,
  InviteRecordInfo,
  CashbackInfo,
  AmountDetailInfo,
  WithdrawalRecordInfo,
  DialogInfo,
  PersonaInfo,
  PluginInfo,
  DrawRecordInfo
} from '@/types/admin'
import request from '.'

// Get activation code list
export function getAdminCarmi(params: Paging) {
  return request.get<TableData<CarmiInfo>>('/api/admin/carmi', params)
}

// Check activation code
export function getAdminCarmiCheck() {
  return request.get<TableData<CarmiInfo>>('/api/admin/carmi/check')
}

// Delete activation code
export function delAdminCarmi(params: { id: string | number }) {
  return request.del(`/api/admin/carmi/${params.id}`)
}

// Batch generate activation codes
export function addAdminCarmis(params: RequestAddCarmi) {
  return request.post<Array<CarmiInfo>>('/api/admin/carmi', params)
}

// User list
export function getAdminUsers(params: Paging) {
  return request.get<TableData<UserInfo>>('/api/admin/user', params)
}
// Delete user
export function delAdminUsers(params: { id: string | number }) {
  return request.del(`/api/admin/user/${params.id}`)
}
// Modify user
export function putAdminUsers(params: UserInfo) {
  return request.put('/api/admin/user', params)
}
// Add user
export function postAdminUser(params: UserInfo) {
	return request.post('/api/admin/user', params)
}

// User consumption list
export function getAdminTurnovers(params: Paging) {
  return request.get<TableData<TurnoverInfo>>('/api/admin/turnover', params)
}
// Delete user consumption record
export function delAdminTurnover(params: { id: string | number }) {
  return request.del(`/api/admin/turnover/${params.id}`)
}
// Modify user consumption record
export function putAdminTurnover(params: TurnoverInfo) {
  return request.put('/api/admin/turnover', params)
}

// User sign-in list
export function getAdminSignin(params: Paging) {
  return request.get<TableData<SigninInfo>>('/api/admin/signin', params)
}

// User conversation list
export function getAdminMessages(params: Paging) {
  return request.get<TableData<MessageInfo>>('/api/admin/messages', params)
}

// Product list
export function getAdminProducts(params: Paging) {
  return request.get<TableData<ProductInfo>>('/api/admin/products', params)
}
// Delete product
export function delAdminProduct(params: { id: string | number }) {
  return request.del(`/api/admin/products/${params.id}`)
}
// Add product
export function postAdminProduct(params: ProductInfo) {
  return request.post('/api/admin/products', params)
}
// Modify product
export function putAdminProduct(params: ProductInfo) {
  return request.put('/api/admin/products', params)
}

// Get Token
export function getAdminAikeys(params: Paging) {
  return request.get<TableData<AikeyInfo>>('/api/admin/aikey', params)
}

// Delete Token
export function delAdminAikey(params: { id: string | number }) {
  return request.del(`/api/admin/aikey/${params.id}`)
}

// Add token
export function postAdminAikey(params: AikeyInfo) {
  return request.post('/api/admin/aikey', params)
}

// Edit token
export function putAdminAikey(params: AikeyInfo) {
  return request.put('/api/admin/aikey', params)
}
// Check token
export function postAdminAikeyCheck(params: AikeyInfo | { all: boolean }) {
  return request.post('/api/admin/aikey/check', params)
}

// Fetch available models from OpenAI API
export function fetchAikeyModels(params: { key: string; host: string }) {
  return request.post<Array<{ label: string; value: string; created?: number; owned_by?: string }>>('/api/admin/aikey/fetch-models', params)
}

// Get configuration data
export function getAdminConfig() {
  return request.get<Array<ConfigInfo>>('/api/admin/config')
}

// Modify configuration data
export function putAdminConfig(params: { [key: string]: any }) {
  return request.put<Array<ConfigInfo>>('/api/admin/config', params)
}

// Get payment channels
export function getAdminPayment(params: Paging) {
  return request.get<TableData<PaymentInfo>>('/api/admin/payment', params)
}

// Delete channel
export function delAdminPayment(params: { id: string | number }) {
  return request.del(`/api/admin/payment/${params.id}`)
}

// Add channel
export function addAdminPayment(params: PaymentInfo) {
  return request.post('/api/admin/payment', params)
}
// Edit channel
export function putAdminPayment(params: PaymentInfo) {
  return request.put('/api/admin/payment', params)
}

// Get order list
export function getAdminOrders(params: Paging) {
  return request.get<TableData<OrderInfo>>('/api/admin/orders', params)
}

// Get Notification
export function getAdminNotification(params: Paging) {
  return request.get<TableData<NotificationInfo>>('/api/admin/notification', params)
}

// Delete Notification
export function delAdminNotification(params: { id: string | number }) {
  return request.del(`/api/admin/notification/${params.id}`)
}

// Add Notification
export function postAdminNotification(params: NotificationInfo) {
  return request.post('/api/admin/notification', params)
}

// Edit Notification
export function putAdminNotification(params: NotificationInfo) {
  return request.put('/api/admin/notification', params)
}

// Get invitation records
export function getAdminInviteRecord(params: Paging) {
  return request.get<TableData<InviteRecordInfo>>('/api/admin/invite_record', params)
}

// Delete invitation record
export function delAdminInviteRecord(params: { id: string | number }) {
  return request.del(`/api/admin/invite_record/${params.id}`)
}

// Modify invitation record
export function putAdminInviteRecord(params: InviteRecordInfo) {
  return request.put('/api/admin/invite_record', params)
}

// Approve invitation
export function putAdminInviteRecordPass(params?: { id: string | number }) {
  return request.put('/api/admin/invite_record/pass', params)
}

// Get commission records
export function getAdminCashback(params?: Paging) {
  return request.get<TableData<CashbackInfo>>('/api/admin/cashback', params)
}

// Delete commission record
export function delAdminCashback(params: { id: string | number }) {
  return request.del(`/api/admin/cashback/${params.id}`)
}

// Modify commission record
export function putAdminCashback(params: CashbackInfo) {
  return request.put('/api/admin/cashback', params)
}

// Approve commission
export function putAdminCashbackPass(params: { id: string | number }) {
  return request.put('/api/admin/cashback/pass', params)
}

// Get amount detail records
export function getAdminAmountDetails(params?: Paging) {
  return request.get<TableData<AmountDetailInfo>>('/api/admin/amount_details', params)
}

// Delete amount detail
export function delAdminAmountDetails(params: { id: string | number }) {
  return request.del(`/api/admin/amount_details/${params.id}`)
}

// Modify amount detail
export function putAdminAmountDetails(params: AmountDetailInfo) {
  return request.put('/api/admin/amount_details', params)
}

// Add amount detail
export function postAdminAmountDetails(params: AmountDetailInfo) {
  return request.post('/api/admin/amount_details', params)
}

// Get withdrawal list
export function getAdminWithdrawalRecords(params?: Paging) {
  return request.get<TableData<WithdrawalRecordInfo>>('/api/admin/withdrawal_record', params)
}

// Delete withdrawal record
export function delAdminWithdrawalRecord(params: { id: string | number }) {
  return request.del(`/api/admin/withdrawal_record/${params.id}`)
}

// Modify withdrawal record
export function putAdminWithdrawalRecord(params: WithdrawalRecordInfo) {
  return request.put('/api/admin/withdrawal_record', params)
}

// Add withdrawal record
export function postAdminWithdrawalRecord(params: WithdrawalRecordInfo) {
  return request.post('/api/admin/withdrawal_record', params)
}

// Operate withdrawal status
export function putAdminWithdrawalRecordOperate(params: WithdrawalRecordInfo) {
	return request.put('/api/admin/withdrawal_record/operate', params)
}

// Delete message
export function delAdminMessage(params: { id: string | number }) {
	return request.del(`/api/admin/messages/${params.id}`)
}

// Modify message
export function putAdminMessage(params: MessageInfo) {
	return request.put('/api/admin/messages', params)
}

// Get built-in conversations
export function getAdminDialogs(params?: Paging) {
	return request.get<TableData<DialogInfo>>('/api/admin/dialog', params)
}

// Modify built-in conversation
export function putAdminDialog(params: DialogInfo) {
	return request.put('/api/admin/dialog', params)
}

// Add built-in conversation
export function postAdminDialog(params: DialogInfo) {
	return request.post('/api/admin/dialog', params)
}

// Delete built-in conversation
export function delAdminDialog(params: { id: string | number }) {
	return request.del(`/api/admin/dialog/${params.id}`)
}

// Get persona data
export function getAdminPersonas(params?: Paging) {
	return request.get<TableData<PersonaInfo>>('/api/admin/persona', params)
}
// Edit persona data
export function putAdminPersona(params: PersonaInfo) {
	return request.put('/api/admin/persona', params)
}
// Add persona data
export function postAdminPersona(params: PersonaInfo) {
	return request.post('/api/admin/persona', params)
}
// Delete persona data
export function delAdminPersona(params: { id: string | number }) {
	return request.del(`/api/admin/persona/${params.id}`)
}

// Get plugin data
export function getAdminPlugins(params?: Paging) {
	return request.get<TableData<PluginInfo>>('/api/admin/plugins', params)
}
// Delete plugin
export function delAdminPlugin(params: { id: string | number }) {
	return request.del(`/api/admin/plugin/${params.id}`)
}
// Edit plugin data
export function putAdminPlugin(params: PluginInfo) {
	return request.put('/api/admin/plugin', params)
}
// Add plugin data
export function postAdminPlugin(params: PluginInfo) {
	return request.post('/api/admin/plugin', params)
}
// Get drawing list
export function getAdminDrawRecords(params?: Paging) {
	return request.get<TableData<DrawRecordInfo>>('/api/admin/draw_record', params)
}
// Delete drawing data
export function delAdminDrawRecord(params: { id: string | number }) {
	return request.del(`/api/admin/draw_record/${params.id}`)
}

// Modify drawing data
export function putAdminDrawRecord(params: DrawRecordInfo | { images: string }) {
	return request.put('/api/admin/draw_record', params)
}
