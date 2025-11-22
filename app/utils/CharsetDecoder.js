/**
 * Decode text content with automatic charset detection
 * Tests multiple common charsets and validates output
 */
export class CharsetDecoder {
  // Common replacement character indicating failed decoding
  static REPLACEMENT_CHAR = '\uFFFD'

  // List of charsets to try in order (Windows-1252 is common for Word docs)
  static CHARSETS = [
    'UTF-8',
    'Windows-1252',
    'ISO-8859-1',
    'ISO-8859-2',
    'Windows-1250',
    'UTF-16'
  ]

  /**
   * Decode text by trying multiple charsets
   * Reads file as ArrayBuffer first, then tries different decodings
   * @param {File} file - File object from input
   * @returns {Promise<string>} Decoded text with valid charset
   */
  static async decodeFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const buffer = e.target.result
          const decoded = this.tryCharsets(buffer)
          console.log(`✅ Successfully decoded with charset: ${decoded.charset}`)
          console.log('📝 Sample:', decoded.text.substring(0, 100))
          resolve(decoded.text)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      // Read as ArrayBuffer for byte-level access
      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * Try multiple charsets on the buffer
   * @private
   * @param {ArrayBuffer} buffer - Raw file bytes
   * @returns {{text: string, charset: string}} Decoded text and charset used
   */
  static tryCharsets(buffer) {
    // Try each charset
    for (const charset of this.CHARSETS) {
      try {
        const decoder = new TextDecoder(charset, { fatal: false })
        const text = decoder.decode(buffer)

        // Check if decoding was successful (no replacement characters)
        if (!text.includes(this.REPLACEMENT_CHAR)) {
          return { text, charset }
        }
        console.log(`❌ ${charset} produced replacement characters`)
      } catch (error) {
        console.log(`❌ ${charset} not supported`)
      }
    }

    // Fallback to UTF-8 even with replacement chars
    console.warn('⚠️ All charsets produced replacement characters, using UTF-8')
    const decoder = new TextDecoder('UTF-8', { fatal: false })
    const text = decoder.decode(buffer)
    return { text, charset: 'UTF-8 (fallback)' }
  }

  /**
   * Detect if text likely has encoding issues
   * @param {string} text - Text to check
   * @returns {boolean} True if encoding issues detected
   */
  static hasEncodingIssues(text) {
    return text.includes(this.REPLACEMENT_CHAR) || /[\uFFFD\u0080-\u009F]/.test(text)
  }
}
