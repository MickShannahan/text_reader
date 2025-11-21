

export class AppSettings {
  constructor(data) {
    this.fontSize = data.fontSize || 16
    this.lineHeight = data.lineHeight || 1.6
    this.fontFamily = data.fontFamily || 'serif'
    this.letterSpacing = data.letterSpacing || 0
    this.textAlign = data.textAlign || 'left'
    this.backgroundColor = data.backgroundColor || '#1a1a1a'
    this.textColor = data.textColor || '#ffffff'
    this.maxWidth = data.maxWidth || 60
    this.paragraphSpacing = data.paragraphSpacing || 1.5
    this.contrast = data.contrast || 1
    this.theme = data.theme || 'dark'
  }

  applySettings(element) {
    if (!element) return

    element.style.fontSize = `${this.fontSize}px`
    element.style.lineHeight = `${this.lineHeight}`
    element.style.fontFamily = this.fontFamily
    element.style.letterSpacing = `${this.letterSpacing}px`
    element.style.textAlign = this.textAlign
    element.style.backgroundColor = this.backgroundColor
    element.style.color = this.textColor
    element.style.maxWidth = `${this.maxWidth}ch`
    element.style.padding = '2rem'
    element.style.margin = '0 auto'
    element.style.lineHeight = `${this.lineHeight}`
    element.style.filter = `contrast(${this.contrast})`

    // Apply paragraph spacing to all p tags
    const paragraphs = element.querySelectorAll('p')
    paragraphs.forEach(p => {
      p.style.marginBottom = `${this.paragraphSpacing}rem`
    })

    // Apply theme to body
    if (document && document.body) {
      document.body.setAttribute('data-bs-theme', this.theme)
    }
  }
}