function filterObjectNull(obj: { [key: string]: any }) {
  // Common BIGINT field names that should convert empty strings to null
  const bigIntFields = [
    'id',
    'product_id',
    'payment_id',
    'persona_id',
    'plugin_id',
    'user_id',
    'parent_message_id',
    'correlation_id',
    'superior_id',
    'benefit_id',
    'order_id',
    'trade_no'
  ]
  
  const params = Object.keys(obj)
    .filter((key) => {
      const value = obj[key]
      // Filter out null, undefined, and 'undefined' string
      if (value === null || value === undefined || value === 'undefined') {
        return false
      }
      // Convert empty strings to null for BIGINT fields
      if (value === '' && bigIntFields.includes(key)) {
        return false // Will be set to null below
      }
      return true
    })
    .reduce((acc, key) => {
      const value = obj[key]
      // Convert empty strings to null for BIGINT fields
      if (value === '' && bigIntFields.includes(key)) {
        acc[key] = null
      } else {
        acc[key] = value
      }
      return acc
    }, {} as { [key: string]: any })
  
  return { ...params }
}

export default filterObjectNull
