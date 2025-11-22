import { AppState } from "../AppState.js"
import { Comment } from "../models/Comment.js"
import { saveState, loadState } from "../utils/Store.js"

/**
 * CommentsService
 * Handles all comment operations including CRUD and persistence
 */
class CommentsService {
  /**
   * Add a new comment
   * @param {string} textFileId - ID of the TextFile being commented
   * @param {Object} commentData - Comment data
   * @param {string} commentData.text - Comment text
   * @param {string} commentData.selectedText - Selected/highlighted text
   * @param {number} commentData.startOffset - Start character position
   * @param {number} commentData.endOffset - End character position
   * @returns {Comment} The created comment
   */
  addComment(textFileId, commentData) {
    const comment = new Comment({
      textFileId,
      ...commentData
    })
    
    AppState.comments.push(comment)
    this.saveComments()
    console.log(`✅ Comment added: ${comment.id}`)
    return comment
  }

  /**
   * Remove a comment by ID
   * @param {string} commentId - Comment ID to delete
   */
  removeComment(commentId) {
    const index = AppState.comments.findIndex(c => c.id === commentId)
    if (index > -1) {
      AppState.comments.splice(index, 1)
      this.saveComments()
      console.log(`✅ Comment removed: ${commentId}`)
    }
  }

  /**
   * Get all comments for a specific TextFile
   * @param {string} textFileId - TextFile ID
   * @returns {Comment[]} Array of comments
   */
  getCommentsByTextFile(textFileId) {
    return AppState.comments.filter(c => c.textFileId === textFileId)
  }

  /**
   * Update an existing comment
   * @param {string} commentId - Comment ID
   * @param {Object} updates - Fields to update
   */
  updateComment(commentId, updates) {
    const comment = AppState.comments.find(c => c.id === commentId)
    if (comment) {
      Object.assign(comment, updates)
      comment.updatedAt = new Date()
      this.saveComments()
      console.log(`✅ Comment updated: ${commentId}`)
    }
  }

  /**
   * Save all comments to localStorage
   */
  saveComments() {
    saveState('comments', AppState.comments)
  }

  /**
   * Load comments from localStorage
   */
  loadComments() {
    AppState.comments = loadState('comments', [Comment])
    console.log(`✅ Loaded ${AppState.comments.length} comments`)
  }

  /**
   * Get all comments (for debugging)
   * @returns {Comment[]} All comments
   */
  getAllComments() {
    return AppState.comments
  }

  /**
   * Clear all comments for a TextFile (useful when deleting a file)
   * @param {string} textFileId - TextFile ID
   */
  clearTextFileComments(textFileId) {
    AppState.comments = AppState.comments.filter(c => c.textFileId !== textFileId)
    this.saveComments()
  }
}

// Export singleton instance
export const commentsService = new CommentsService()
