export async function textToMdFile(text: string) {
  try {
    // Create a Blob object
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
    // Create a download link
    const link = document.createElement('a')
    link.download = 'aiFile.md'
    link.href = URL.createObjectURL(blob)
    // Add link to page and trigger click event
    document.body.appendChild(link)
    link.click()
    // Release URL object
    URL.revokeObjectURL(link.href)
    Promise.resolve()
  } catch (error) {
    Promise.reject()
  }
}
