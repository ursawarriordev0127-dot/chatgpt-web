import {
	ProForm,
	ProFormDependency,
	ProFormDigit,
	ProFormSelect,
	ProFormText,
	ProFormTextArea,
	QueryFilter
  } from '@ant-design/pro-components'
  import { Button, Form, Space, Tabs, message } from 'antd'
  import { useEffect, useRef, useState } from 'react'
  import styles from './index.module.less'
  import { getAdminConfig, putAdminConfig } from '@/request/adminApi'
  import { ConfigInfo } from '@/types/admin'
  import RichEdit from '@/components/RichEdit'

  function ConfigPage() {
	const [configs, setConfigs] = useState<Array<ConfigInfo>>([])
	const [rewardForm] = Form.useForm<{
	  register_reward: number | string
	  signin_reward: number | string
	  invite_reward: number | string
	  cashback_ratio: number | string
	}>()

	const [aiCarryCountForm] = Form.useForm<{
	  ai3_carry_count: number | string
	  ai4_carry_count: number | string
	}>()

	const [aiRatioForm] = Form.useForm<{
	  ai3_ratio: number | string
	  ai4_ratio: number | string
	}>()

	const [drawPriceForm] = Form.useForm<{
	  draw_price: number | string
	}>()

	const [webSiteForm] = Form.useForm<{
	  website_title: string
	  website_description: string
	  website_keywords: string
	  website_logo: string
	  website_footer: string
	}>()

	const [cloudStorageForm] = Form.useForm<{
	  type: string
	  secret_key?: string
	  api_host?: string
	  secret_id?: string
	  bucket?: string
	  access_key_secret?: string
	  access_key_id?: string
	  region?: string
	  local_host?: string
	}>()

	const [prohibitedWordsForm] = Form.useForm<{
	  prohibited_words: string
	}>()

	const [tuputechKeyForm] = Form.useForm<{
	  tuputech_key: string
	}>()

	const [smsForm] = Form.useForm<{
	  user: string
	  password: string
	  sign: string
	  template: string
	}>()

	const [emailForm] = Form.useForm<{
	  host: string
	  port: string | number
	  user: string
	  pass: string
	  from_title: string
	  subject: string
	}>()

	const shopIntroduce = useRef<string>()
	const userIntroduce = useRef<string>()
	const inviteIntroduce = useRef<string>()

	function getConfigValue(key: string, data: Array<ConfigInfo>) {
	  const value = data.filter((c) => c.name === key)[0]
	  return value
	}

	function onRewardFormSet(data: Array<ConfigInfo>) {
	  const registerRewardInfo = getConfigValue('register_reward', data)
	  const signinRewardInfo = getConfigValue('signin_reward', data)
	  const ai3Ratio = getConfigValue('ai3_ratio', data)
	  const ai4Ratio = getConfigValue('ai4_ratio', data)
	  const drawPrice = getConfigValue('draw_price', data)

	  const cashback_ratio = getConfigValue('cashback_ratio', data)
	  const invite_reward = getConfigValue('invite_reward', data)
	  rewardForm.setFieldsValue({
		register_reward: registerRewardInfo.value,
		signin_reward: signinRewardInfo.value,
		invite_reward: invite_reward.value,
		cashback_ratio: cashback_ratio.value
	  })

	  const ai3CarryCountInfo = getConfigValue('ai3_carry_count', data)
	  const ai4CarryCountInfo = getConfigValue('ai4_carry_count', data)
	  aiCarryCountForm.setFieldsValue({
		ai3_carry_count: Number(ai3CarryCountInfo.value) || 0,
		ai4_carry_count: Number(ai4CarryCountInfo.value) || 0
	  })

	  aiRatioForm.setFieldsValue({
		ai3_ratio: Number(ai3Ratio.value),
		ai4_ratio: Number(ai4Ratio.value)
	  })
	  if (drawPrice && drawPrice.value) {
		drawPriceForm.setFieldsValue({
		  draw_price: JSON.parse(drawPrice.value)
		})
	  }

	  const website_title = getConfigValue('website_title', data)
	  const website_description = getConfigValue('website_description', data)
	  const website_keywords = getConfigValue('website_keywords', data)
	  const website_logo = getConfigValue('website_logo', data)
	  const website_footer = getConfigValue('website_footer', data)
	  webSiteForm.setFieldsValue({
		website_title: website_title.value,
		website_description: website_description.value,
		website_keywords: website_keywords.value,
		website_logo: website_logo.value,
		website_footer: website_footer.value
	  })

	  const shop_introduce = getConfigValue('shop_introduce', data)
	  if (shop_introduce && shop_introduce.value) {
		shopIntroduce.current = shop_introduce.value
	  }

	  const user_introduce = getConfigValue('user_introduce', data)
	  if (user_introduce && user_introduce.value) {
		userIntroduce.current = user_introduce.value
	  }

	  const invite_introduce = getConfigValue('invite_introduce', data)
	  if (invite_introduce && invite_introduce.value) {
		inviteIntroduce.current = invite_introduce.value
	  }

	  const prohibited_words = getConfigValue('prohibited_words', data)
	  if (prohibited_words && prohibited_words.value) {
		prohibitedWordsForm.setFieldsValue({
		  prohibited_words: prohibited_words.value
		})
	  }

	  const tuputech_key = getConfigValue('tuputech_key', data)
	  if (tuputech_key && tuputech_key.value) {
		tuputechKeyForm.setFieldsValue({
		  tuputech_key: tuputech_key.value
		})
	  }

	  const sms = getConfigValue('sms', data)
	  if (sms && sms.value) {
		const smsData = JSON.parse(sms.value)
		smsForm.setFieldsValue({
		  ...smsData
		})
	  }

	  const email = getConfigValue('email', data)
	  if (email && email.value) {
		const emailData = JSON.parse(email.value)
		emailForm.setFieldsValue({
		  ...emailData
		})
	  }

	  const cloudStorage = getConfigValue('cloud_storage', data)
	  if (cloudStorage && cloudStorage.value) {
		const cloudStorageData = JSON.parse(cloudStorage.value)
		cloudStorageForm.setFieldsValue({
		  ...cloudStorageData
		})
	  }
	}

	function onGetConfig() {
	  getAdminConfig().then((res) => {
		if (res.code) {
		  message.error('Failed to get configuration')
		  return
		}
		onRewardFormSet(res.data)
		setConfigs(res.data)
	  })
	}

	useEffect(() => {
	  onGetConfig()
	}, [])

	async function onSave(values: any) {
	  return putAdminConfig(values).then((res) => {
		if (res.code) {
		  message.error('Save failed')
		  return
		}
		message.success('Saved successfully')
		onGetConfig()
	  })
	}

	const cloudStorageFormItems: {
	  [key: string]: Array<React.ReactNode>
	} = {
	  local: [
		<ProFormText
		  key="local_host"
		  name="host"
		  label="Access Domain (http/https)"
		  // rules={[{ required: true, message: 'Please enter access domain (ending with /)!' }]}
		/>
	  ],
	  tencent: [
		<ProFormText
		  key="tencent_secret_id"
		  name="secret_id"
		  label="SecretId"
		  rules={[{ required: true, message: 'Please enter SecretId!' }]}
		/>,
		<ProFormText
		  key="tencent_secret_key"
		  name="secret_key"
		  label="SecretKey"
		  rules={[{ required: true, message: 'Please enter SecretKey!' }]}
		/>,
		<ProFormText
		  key="tencent_bucket"
		  name="bucket"
		  label="Bucket"
		  rules={[{ required: true, message: 'Please enter Bucket!' }]}
		/>,
		<ProFormText
		  key="tencent_region"
		  name="region"
		  label="Region"
		  rules={[{ required: true, message: 'Please enter Region!' }]}
		/>
	  ],
	  alioss: [
		<ProFormText
		  key="alioss_access_key_id"
		  name="access_key_id"
		  label="AccessKeyId"
		  rules={[{ required: true, message: 'Please enter AccessKeyId!' }]}
		/>,
		<ProFormText
		  key="alioss_access_key_secret"
		  name="access_key_secret"
		  label="AccessKeySecret"
		  rules={[{ required: true, message: 'Please enter AccessKeySecret!' }]}
		/>,
		<ProFormText
		  key="alioss_bucket"
		  name="bucket"
		  label="Bucket"
		  rules={[{ required: true, message: 'Please enter Bucket!' }]}
		/>,
		<ProFormText
		  key="alioss_region"
		  name="region"
		  label="Region"
		  rules={[{ required: true, message: 'Please enter Region!' }]}
		/>
	  ],
	  upyun: [
		<ProFormText
		  key="tencent_bucket"
		  name="bucket"
		  label="Service Name"
		  rules={[{ required: true, message: 'Please enter website LOGO URL!' }]}
		/>,
		<ProFormText
		  key="upyun_secret_id"
		  name="secret_id"
		  label="Operator"
		  rules={[{ required: true, message: 'Please enter operator account!' }]}
		/>,
		<ProFormText
		  key="upyun_secret_key"
		  name="secret_key"
		  label="Operator Secret Key"
		  rules={[{ required: true, message: 'Please enter operator secret key!' }]}
		/>,
		<ProFormText
		  key="upyun_host"
		  name="host"
		  label="Access Domain (http/https)"
		  rules={[{ required: true, message: 'Please enter access domain (ending with /)!' }]}
		/>
	  ],
	  lsky: [
		<ProFormText
		  key="lsky_api_host"
		  name="api_host"
		  label="ApiHost"
		  rules={[{ required: true, message: 'Please enter website LOGO URL!' }]}
		/>,
		<ProFormText
		  key="lsky_secret_key"
		  name="secret_key"
		  label="SecretKey"
		  rules={[{ required: true, message: 'Please enter website LOGO URL!' }]}
		/>
	  ]
	}

	function IntroduceSettings() {
	  return (
		<Space
		  direction="vertical"
		  style={{
			width: '100%'
		  }}
		>
		  <div className={styles.config_form}>
			<h3>Shop Page Announcement Settings</h3>
			<div style={{ marginTop: 20, marginBottom: 20 }}>
			  <RichEdit
				defaultValue={shopIntroduce.current}
				value={shopIntroduce.current}
				onChange={(value) => {
				  shopIntroduce.current = value
				}}
			  />
			</div>
			<Button
			  size="large"
			  type="primary"
			  onClick={() => {
				onSave({
				  shop_introduce: shopIntroduce.current
				})
			  }}
			>
			  Save
			</Button>
		  </div>
		  <div className={styles.config_form}>
			<h3>User Center Page Announcement Settings</h3>
			<div style={{ marginTop: 20, marginBottom: 20 }}>
			  <RichEdit
				defaultValue={userIntroduce.current}
				value={userIntroduce.current}
				onChange={(value) => {
				  userIntroduce.current = value
				}}
			  />
			</div>
			<Button
			  size="large"
			  type="primary"
			  onClick={() => {
				onSave({
				  user_introduce: userIntroduce.current
				})
			  }}
			>
			  Save
			</Button>
		  </div>
		  <div className={styles.config_form}>
			<h3>Invitation Description Settings</h3>
			<div style={{ marginTop: 20, marginBottom: 20 }}>
			  <RichEdit
				defaultValue={inviteIntroduce.current}
				value={inviteIntroduce.current}
				onChange={(value) => {
				  inviteIntroduce.current = value
				}}
			  />
			</div>
			<Button
			  size="large"
			  type="primary"
			  onClick={() => {
				onSave({
				  invite_introduce: inviteIntroduce.current
				})
			  }}
			>
			  Save
			</Button>
		  </div>
		</Space>
	  )
	}

	function WebSiteSettings() {
	  return (
		<Space
		  direction="vertical"
		  style={{
			width: '100%'
		  }}
		>
		  <div className={styles.config_form}>
			<h3>Website Settings</h3>
			<ProForm
			  autoFocus={false}
			  autoFocusFirstInput={false}
			  form={webSiteForm}
			  size="large"
			  initialValues={{}}
			  isKeyPressSubmit={false}
			  submitter={{
				searchConfig: {
				  submitText: 'Save',
				  resetText: 'Reset'
				}
			  }}
			  onFinish={onSave}
			  onReset={() => {
				onRewardFormSet(configs)
			  }}
			>
			  <ProForm.Group>
				<ProFormText
				  width="xl"
				  name="website_title"
				  label="Website Title"
				  rules={[{ required: true, message: 'Please enter website title!' }]}
				/>
				<ProFormText
				  width="xl"
				  name="website_logo"
				  label="Website LOGO"
				  rules={[{ required: true, message: 'Please enter website LOGO URL!' }]}
				/>
			  </ProForm.Group>
			  <ProForm.Group>
				<ProFormTextArea
				  width="xl"
				  name="website_description"
				  fieldProps={{
					autoSize: {
					  minRows: 2,
					  maxRows: 2
					}
				  }}
				  label="Website Description"
				  rules={[{ required: true, message: 'Please enter website description!' }]}
				/>
				<ProFormTextArea
				  width="xl"
				  label="Website Keywords"
				  name="website_keywords"
				  fieldProps={{
					autoSize: {
					  minRows: 2,
					  maxRows: 2
					}
				  }}
				  rules={[{ required: true, message: 'Please enter website keywords!' }]}
				/>
			  </ProForm.Group>
			  <ProFormTextArea
				name="website_footer"
				label="Website Footer"
				fieldProps={{
				  autoSize: {
					minRows: 2,
					maxRows: 6
				  }
				}}
			  />
			</ProForm>
		  </div>
		</Space>
	  )
	}

	function RewardSettings() {
	  return (
		<Space
		  direction="vertical"
		  style={{
			width: '100%'
		  }}
		>
		  <div className={styles.config_form}>
			<h3>Reward Incentives</h3>
			<QueryFilter
			  autoFocus={false}
			  autoFocusFirstInput={false}
			  form={rewardForm}
			  onFinish={async (values: any) => {
				putAdminConfig(values).then((res) => {
				  if (res.code) {
					message.error('Save failed')
					return
				  }
				  message.success('Saved successfully')
				  onGetConfig()
				})
			  }}
			  onReset={() => {
				onRewardFormSet(configs)
			  }}
			  size="large"
			  collapsed={false}
			  defaultCollapsed={false}
			  requiredMark={false}
			  defaultColsNumber={79}
			  searchText="Save"
			  resetText="Reset"
			>
			  <ProFormDigit
				name="register_reward"
				label="Registration Reward"
				tooltip="Points given to new users upon registration"
				min={0}
				max={100000}
			  />
			  <ProFormDigit
				name="signin_reward"
				label="Sign-in Reward"
				tooltip="Points given for daily sign-in"
				min={0}
				max={100000}
			  />
			  <ProFormDigit
				name="invite_reward"
				label="Invitation Reward"
				tooltip="Points given for each new user invited"
				min={0}
				max={100000}
			  />
			  <ProFormDigit
				name="cashback_ratio"
				label="Consumption Commission"
				tooltip="Commission percentage for subordinate consumption"
				min={0}
				max={100000}
			  />
			</QueryFilter>
		  </div>
		  <div className={styles.config_form}>
			<h3>History Record Count</h3>
			<QueryFilter
			  autoFocus={false}
			  autoFocusFirstInput={false}
			  form={aiCarryCountForm}
			  onFinish={onSave}
			  onReset={() => {
				onRewardFormSet(configs)
			  }}
			  size="large"
			  collapsed={false}
			  defaultCollapsed={false}
			  requiredMark={false}
			  defaultColsNumber={79}
			  searchText="Save"
			  resetText="Reset"
			>
			  <ProFormDigit
				name="ai3_carry_count"
				label="GPT3"
				tooltip="Number of conversation messages to carry in context"
				min={1}
				max={100000}
			  />
			  <ProFormDigit
				name="ai4_carry_count"
				label="GPT4"
				tooltip="Number of conversation messages to carry in context"
				min={1}
				max={100000}
			  />
			</QueryFilter>
		  </div>
		  <div className={styles.config_form}>
			<h3>Conversation Points Deduction Ratio</h3>
			<p>
			  Set how many Tokens equal 1 point, e.g., 1 point = 50 Tokens, then a single conversation consuming 100 Tokens will deduct 2 points.
			</p>
			<QueryFilter
			  autoFocus={false}
			  autoFocusFirstInput={false}
			  form={aiRatioForm}
			  onFinish={onSave}
			  onReset={() => {
				onRewardFormSet(configs)
			  }}
			  size="large"
			  collapsed={false}
			  defaultCollapsed={false}
			  requiredMark={false}
			  defaultColsNumber={79}
			  searchText="Save"
			  resetText="Reset"
			>
			  <ProFormDigit
				name="ai3_ratio"
				label="GPT3"
				tooltip="How many Tokens equal 1 point"
				min={0}
				max={100000}
			  />
			  <ProFormDigit
				name="ai4_ratio"
				label="GPT4"
				tooltip="How many Tokens equal 1 point"
				min={0}
				max={100000}
			  />
			</QueryFilter>
		  </div>
		  <div className={styles.config_form}>
			<h3>Drawing Points Deduction Settings</h3>
			<p>
			  Drawing billing rule: how many points consumed per second, e.g., if set to 10, generating a 512x512 image taking 2 seconds will deduct 20 points!
			</p>
			<QueryFilter
			  autoFocus={false}
			  autoFocusFirstInput={false}
			  form={drawPriceForm}
			  onFinish={onSave}
			  onReset={() => {
				onRewardFormSet(configs)
			  }}
			  size="large"
			  collapsed={false}
			  defaultCollapsed={false}
			  requiredMark={false}
			  defaultColsNumber={79}
			  searchText="Save"
			  resetText="Reset"
			>
			  <ProFormDigit
				name="draw_price"
				label="Deduct Per Second"
				tooltip="Points deducted per second"
				min={0}
				max={100000}
			  />
			</QueryFilter>
		  </div>
		</Space>
	  )
	}

	function ReviewProhibitedWordsSettings() {
	  return (
		<Space
		  direction="vertical"
		  style={{
			width: '100%'
		  }}
		>
		  <div className={styles.config_form}>
			<h3>Text Review</h3>
			<p>
			  Text review service URL:
			  <a href="https://www.kaifain.com/s/6d23ad5feb78" target="_blank" rel="noreferrer">
				https://www.kaifain.com/s/6d23ad5feb78
			  </a>
			</p>
			<p>If KEY is configured, it will be used preferentially for text content review</p>
			<QueryFilter
			  autoFocus={false}
			  autoFocusFirstInput={false}
			  form={tuputechKeyForm}
			  onFinish={async (values: any) => {
				putAdminConfig(values).then((res) => {
				  if (res.code) {
					message.error('Save failed')
					return
				  }
				  message.success('Saved successfully')
				  onGetConfig()
				})
			  }}
			  onReset={() => {
				onRewardFormSet(configs)
			  }}
			  labelWidth="auto"
			  span={12}
			  size="large"
			  collapsed={false}
			  defaultCollapsed={false}
			  requiredMark={false}
			  defaultColsNumber={79}
			  searchText="Save"
			  resetText="Reset"
			>
			  <ProFormText width="xl" name="tuputech_key" />
			</QueryFilter>
		  </div>
		  <div className={styles.config_form}>
			<h3>Local Prohibited Words</h3>
			<p style={{ marginBottom: 12 }}>Please separate prohibited words with commas (,) in English</p>
			<ProForm
			  autoFocus={false}
			  autoFocusFirstInput={false}
			  form={prohibitedWordsForm}
			  size="large"
			  initialValues={{}}
			  isKeyPressSubmit={false}
			  submitter={{
				searchConfig: {
				  submitText: 'Save',
				  resetText: 'Reset'
				}
			  }}
			  onFinish={onSave}
			  onReset={() => {
				onRewardFormSet(configs)
			  }}
			>
			  <ProFormTextArea
				name="prohibited_words"
				fieldProps={{
				  autoSize: {
					minRows: 2,
					maxRows: 12
				  }
				}}
			  />
			</ProForm>
		  </div>
		</Space>
	  )
	}

	function SmsSettings() {
	  return (
		<Space
		  direction="vertical"
		  style={{
			width: '100%'
		  }}
		>
		  <div className={styles.config_form}>
			<h3>SMS Settings</h3>
			<ProForm
			  autoFocus={false}
			  autoFocusFirstInput={false}
			  form={smsForm}
			  size="large"
			  initialValues={{}}
			  isKeyPressSubmit={false}
			  submitter={{
				searchConfig: {
				  submitText: 'Save',
				  resetText: 'Reset'
				}
			  }}
			  onFinish={(vales) => {
				return onSave({
				  sms: JSON.stringify(vales)
				})
			  }}
			  onReset={() => {
				onRewardFormSet(configs)
			  }}
			>
			  <ProForm.Group>
				<ProFormText
				  width="xl"
				  name="user"
				  label="Username"
				  rules={[{ required: true, message: 'Please enter SMS service provider username!' }]}
				/>
				<ProFormText
				  width="xl"
				  name="password"
				  label="API Key"
				  rules={[{ required: true, message: 'Please enter API Key!' }]}
				/>
				<ProFormText
				  width="xl"
				  name="sign"
				  label="SMS Signature"
				  rules={[{ required: true, message: 'Please enter SMS signature!' }]}
				/>
				<ProFormTextArea
				  width="xl"
				  name="template"
				  fieldProps={{
					autoSize: {
					  minRows: 2,
					  maxRows: 2
					}
				  }}
				  label="SMS Template"
				  rules={[{ required: true, message: 'Please enter SMS template!' }]}
				/>
				<Space direction="vertical" size="small">
				  <p>
					1. Example template:
					{
					  'Your verification code is: {code}, valid for {time} minutes, please do not disclose. If this is not your operation, please ignore this SMS. Thank you!'
					}
				  </p>
				  <p>2. Will automatically replace code, time. If you customize the template, please follow this rule.</p>
				  <p>
					3.
					Final: 【AI Home】Your verification code is: 123456, valid for 10 minutes, please do not disclose. If this is not your operation, please ignore this SMS. Thank you!
				  </p>
				  <p
					style={{
					  marginBottom: 20
					}}
				  >
					4. SMS service provider:{' '}
					<a href="https://www.smsbao.com" target="_blank" rel="noreferrer">
					  【SMS Bao】
					</a>
				  </p>
				</Space>
			  </ProForm.Group>
			</ProForm>
		  </div>
		</Space>
	  )
	}

	function EmailSettings() {
	  return (
		<Space
		  direction="vertical"
		  style={{
			width: '100%'
		  }}
		>
		  <div className={styles.config_form}>
			<h3>Email Settings</h3>
			<ProForm
			  autoFocus={false}
			  autoFocusFirstInput={false}
			  form={emailForm}
			  size="large"
			  initialValues={{}}
			  isKeyPressSubmit={false}
			  submitter={{
				searchConfig: {
				  submitText: 'Save',
				  resetText: 'Reset'
				}
			  }}
			  onFinish={(vales) => {
				return onSave({
				  email: JSON.stringify(vales)
				})
			  }}
			  onReset={() => {
				onRewardFormSet(configs)
			  }}
			>
			  <ProForm.Group>
				<ProFormText
				  width="xl"
				  name="host"
				  label="SMTP Server"
				  rules={[{ required: true, message: 'Please enter SMTP server!' }]}
				/>
				<ProFormText
				  width="xl"
				  name="port"
				  label="SMTP Port"
				  rules={[{ required: true, message: 'Please enter SMTP port!' }]}
				/>
				<ProFormText
				  width="xl"
				  name="user"
				  label="Email Account"
				  rules={[{ required: true, message: 'Please enter email account!' }]}
				/>
				<ProFormText
				  width="xl"
				  name="pass"
				  label="Email Password"
				  rules={[{ required: true, message: 'Please enter email password!' }]}
				/>
				<ProFormText width="xl" name="from_title" label="Sender Name" />
				<ProFormText width="xl" name="subject" label="Email Subject" />
			  </ProForm.Group>
			</ProForm>
		  </div>
		</Space>
	  )
	}

	function CloudStorageSettings() {
	  return (
		<Space
		  direction="vertical"
		  style={{
			width: '100%'
		  }}
		>
		  <div className={styles.config_form}>
			<h3>Image Storage Configuration</h3>
			<ProForm
			  autoFocus={false}
			  autoFocusFirstInput={false}
			  form={cloudStorageForm}
			  size="large"
			  initialValues={{
				type: 'local'
			  }}
			  isKeyPressSubmit={false}
			  submitter={{
				searchConfig: {
				  submitText: 'Save',
				  resetText: 'Reset'
				}
			  }}
			  onFinish={(vales) => {
				return onSave({
				  cloud_storage: JSON.stringify(vales)
				})
			  }}
			  onReset={() => {
				onRewardFormSet(configs)
			  }}
			>
			  <ProFormSelect
				name="type"
				label="Storage Strategy"
				valueEnum={{
				  local: 'Local Storage',
				  tencent: 'Tencent Cloud Storage',
				  alioss: 'Alibaba Cloud Storage',
				  upyun: 'Upyun Storage',
				  lsky: 'Lsky Image Hosting'
				}}
				placeholder="Please select storage strategy!"
				rules={[{ required: true, message: 'Please select storage strategy!' }]}
			  />

			  <ProFormDependency name={['type']}>
				{({ type }) => {
				  return cloudStorageFormItems[type]
				}}
			  </ProFormDependency>
			</ProForm>
		  </div>
		</Space>
	  )
	}

	return (
	  <div className={styles.config}>
		<Tabs
		  defaultActiveKey="WebSiteSettings"
		  // centered
		  // type="card"
		  items={[
			{
			  label: 'Website Settings',
			  key: 'WebSiteSettings',
			  children: <WebSiteSettings />
			},
			{
			  label: 'Reward Settings',
			  key: 'RewardSettings',
			  children: <RewardSettings />
			},
			{
			  label: 'Page Description Settings',
			  key: 'IntroduceSettings',
			  children: <IntroduceSettings />
			},
			{
			  label: 'Prohibited Words Review Settings',
			  key: 'ReviewProhibitedWordsSettings',
			  children: <ReviewProhibitedWordsSettings />
			},
			{
			  label: 'SMS Configuration',
			  key: 'SmsSettings',
			  children: <SmsSettings />
			},
			{
			  label: 'Email Configuration',
			  key: 'EmailSettings',
			  children: <EmailSettings />
			},
			{
			  label: 'Storage Configuration',
			  key: 'CloudStorageSettings',
			  children: <CloudStorageSettings />
			}
		  ]}
		/>
	  </div>
	)
  }
  export default ConfigPage
