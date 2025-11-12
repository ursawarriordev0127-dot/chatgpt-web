import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

function ResultPage() {
  const navigate = useNavigate()
  return (
    <Result
      status="success"
      title="Payment Successful!"
      subTitle=""
      extra={[
        <Button
          key="home"
          onClick={() => {
            navigate('/')
          }}
        >
          Back to Home
        </Button>,
        <Button
          type="primary"
          key="shop"
          onClick={() => {
            navigate('/shop')
          }}
        >
          View Records
        </Button>
      ]}
    />
  )
}
export default ResultPage
