export class TextAnalyzer {
  static getWordCount(text) {
    if (!text) return 0
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  static getParagraphCount(text) {
    if (!text) return 0
    // Use the same logic as splitIntoParagraphs to ensure consistency
    return this.splitIntoParagraphs(text).length
  }

  static formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  static splitIntoParagraphs(text) {
    if (!text) return []

    // Normalize line endings to \n
    let normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

    // Split on one or more newlines to handle different paragraph separators
    // This is more flexible than requiring double newlines
    const paragraphs = normalized.split(/\n+/)

    return paragraphs
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => {
        // Collapse multiple spaces and preserve the content
        return p.replace(/\s+/g, ' ').trim()
      })
  }
}
