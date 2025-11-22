import { generateId } from "../utils/GenerateId.js"

/**
 * Comment Model
 * Represents a single text annotation/comment on a TextFile
 */
export class Comment {
  /**
   * @param {Object} data - Comment data
   * @param {string} data.id - Unique comment ID
   * @param {string} data.textFileId - Reference to parent TextFile
   * @param {string} data.text - Comment content
   * @param {string} data.selectedText - The highlighted text
   * @param {number} data.startOffset - Character position where selection starts
   * @param {number} data.endOffset - Character position where selection ends
   * @param {string} data.createdAt - ISO timestamp of creation
   * @param {string} data.updatedAt - ISO timestamp of last update
   */
  constructor(data) {
    this.id = data.id || generateId()
    this.textFileId = data.textFileId
    this.text = data.text || ""
    this.selectedText = data.selectedText || ""
    this.startOffset = data.startOffset || 0
    this.endOffset = data.endOffset || 0
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date()
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date()
  }

  /**
   * Get formatted date string
   * @returns {string} Formatted date
   */
  getFormattedDate() {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(this.createdAt)
  }

  /**
   * Get HTML template for comment sidebar display (Desktop)
   * @returns {string} HTML markup
   */
  getHTMLTemplate() {
    return `
      <div class="comment-item card mb-2" data-comment-id="${this.id}">
        <div class="card-body p-3">
          <p class="card-text comment-text">${this.text}</p>
          <small class="text-muted d-block mt-2">
            "${this.selectedText.substring(0, 40)}${this.selectedText.length > 40 ? '...' : ''}"
          </small>
          <small class="text-muted d-block">${this.getFormattedDate()}</small>
          <button 
            type="button" 
            class="btn btn-sm btn-outline-danger mt-2" 
            onclick="app.CommentsController.deleteComment('${this.id}')"
          >
            <i class="bi bi-trash"></i> Delete
          </button>
        </div>
      </div>
    `
  }

  /**
   * Get HTML for popover content (Mobile)
   * @returns {string} HTML markup
   */
  getPopoverContent() {
    return `
      <div class="comment-popover-content">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-chat flex-shrink-0"></i>
          <p class="mb-0">${this.text}</p>
        </div>
        <button 
          type="button" 
          class="btn btn-sm btn-outline-danger" 
          onclick="app.CommentsController.deleteComment('${this.id}')"
        >
          <i class="bi bi-trash"></i> Delete
        </button>
      </div>
    `
  }
}
