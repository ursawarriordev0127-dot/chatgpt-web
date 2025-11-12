
type ScrollElement = HTMLDivElement | null

interface ScrollReturn {
  scrollElement: ScrollElement
  scrollToBottom: () => Promise<void>
  scrollToTop: () => Promise<void>
  scrollToBottomIfAtBottom: () => Promise<void>
}

export function useScroll(scrollElement: ScrollElement): ScrollReturn {

  const scrollToBottom = async () => {
    if (scrollElement) {
      scrollElement.scrollTop = scrollElement.scrollHeight
    }
  }

  const scrollToTop = async () => {
    if (scrollElement){
      scrollElement.scrollTop = 0
    }
  }

  const scrollToBottomIfAtBottom = async () => {
    if (scrollElement) {
      const threshold = 100 // Threshold, represents the distance threshold from the bottom of the scrollbar
      const distanceToBottom = scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight;
      if (distanceToBottom <= threshold){
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }

  return {
    scrollElement,
    scrollToBottom,
    scrollToTop,
    scrollToBottomIfAtBottom,
  }
}
