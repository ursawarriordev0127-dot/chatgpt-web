/**
 * Sanitizes data to convert empty strings to null for BIGINT fields
 * This prevents PostgreSQL errors: "invalid input syntax for type bigint"
 */
function sanitizeBigInt(data: { [key: string]: any }, bigIntFields: string[] = []): { [key: string]: any } {
  const sanitized = { ...data }
  
  // Common BIGINT field names
  const defaultBigIntFields = [
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
  
  const allBigIntFields = [...new Set([...defaultBigIntFields, ...bigIntFields])]
  
  for (const field of allBigIntFields) {
    if (field in sanitized && sanitized[field] === '') {
      sanitized[field] = null
    }
  }
  
  return sanitized
}

export default sanitizeBigInt

