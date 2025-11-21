export class TextAnalyzer {
  static getWordCount(text) {
    if (!text) return 0
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  static getParagraphCount(text) {
    if (!text) return 0
    return text.split(/\n\n+/).filter(paragraph => paragraph.trim().length > 0).length
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

    // Split on multiple newlines (paragraph breaks)
    const paragraphs = text.split(/\n\s*\n+/)

    return paragraphs
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => {
        // Replace single newlines within paragraphs with spaces
        // This handles text that's wrapped with single newlines
        return p.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
      })
  }
}
