import { useLayoutEffect } from 'react'
import { ModalForm, ProFormSelect, ProFormSlider, ProFormText } from '@ant-design/pro-components'
import { Form } from 'antd'
import FormItemCard from '../FormItemCard'
import { ChatGptConfig } from '@/types'

type Props = {
  open: boolean
  onCancel: () => void
  onChange: (config: ChatGptConfig) => void
  models: Array<{
    label: string
    value: string
  }>
  data: ChatGptConfig
}

function ConfigModal(props: Props) {
  const [chatGptConfigform] = Form.useForm<ChatGptConfig>()
  const onCancel = () => {
    props.onCancel()
    chatGptConfigform.resetFields()
  }

  useLayoutEffect(() => {
    if (props.open && chatGptConfigform) {
      chatGptConfigform.setFieldsValue({
        ...props.data
      })
    }
  }, [props.open, chatGptConfigform])

  return (
    <ModalForm<ChatGptConfig>
      title="Chat Configuration"
      open={props.open}
      form={chatGptConfigform}
      onOpenChange={(visible) => {
        if (visible) return
        onCancel()
      }}
      onFinish={async (values) => {
        props.onChange(values)
        return true
      }}
      size="middle"
      width={600}
      modalProps={{
        cancelText: 'Cancel',
        okText: 'Submit',
        maskClosable: false,
        destroyOnClose: true
      }}
    >
      <FormItemCard title="GPT Model" describe="Configure according to the model settings provided by OpenAI">
        <ProFormSelect
          name="model"
          style={{ minWidth: '180px' }}
          options={[...props.models]}
          fieldProps={{
            clearIcon: false
          }}
        />
      </FormItemCard>
      {/* {(
        <>
          <FormItemCard title="Proxy API" describe="Proxy address can be any third-party proxy (ChatGPT)">
            <ProFormText
              allowClear={false}
              name="api"
              placeholder="Please enter proxy address"
              rules={[{ required: true, message: 'Please fill in proxy API address' }]}
            />
          </FormItemCard>
          <FormItemCard title="API Key" describe="Use your own OpenAPI Key or other proxy.">
            <ProFormText allowClear={false} name="api_key" placeholder="Please enter API key" />
          </FormItemCard>
        </>
      )} */}
      {/* <FormItemCard title="History Messages Count" describe="Number of history messages carried in each request">
        <ProFormSlider name="limit_message" max={10} min={0} step={1} />
      </FormItemCard> */}
      <FormItemCard title="Randomness" describe="Higher values make responses more random, values greater than 1 may cause garbled text">
        <ProFormSlider name="temperature" max={2} min={0} step={0.1} />
      </FormItemCard>
      <FormItemCard title="Topic Freshness" describe="Higher values increase the likelihood of expanding to new topics">
        <ProFormSlider name="presence_penalty" max={2} min={-2} step={0.1} />
      </FormItemCard>
      <FormItemCard title="Repetition" describe="Frequency of repeated words and phrases in text, higher values make it less fluent">
        <ProFormSlider name="frequency_penalty" max={2} min={-2} step={0.1} />
      </FormItemCard>
      <FormItemCard title="Single Reply Limit" describe="Maximum number of tokens used in a single interaction">
        <ProFormSlider name="max_tokens" max={3666} min={100} step={1} />
      </FormItemCard>
    </ModalForm>
  )
}

export default ConfigModal
