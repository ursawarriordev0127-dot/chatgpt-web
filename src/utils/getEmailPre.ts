export function getEmailPre(str?: string) {
  if (!str) return ''
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Email regex
  if (emailRegex.test(str)) {
    // If it's an email, return the string before @
    return str.split('@')[0]
  } else {
    // If it's not an email, return the entire string
    return str
  }
}
