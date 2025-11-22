import { AppState } from "../AppState.js"
import { commentsService } from "../services/CommentsService.js"
import { Pop } from "../utils/Pop.js"

/**
 * CommentsController
 * Handles user interactions with comments including selection, creation, and display
 */
export class CommentsController {
  constructor() {
    // Bind methods to preserve context
    this.setupCommentSelection = this.setupCommentSelection.bind(this)
    this.handleTextSelection = this.handleTextSelection.bind(this)
    this.showCommentBox = this.showCommentBox.bind(this)
    this.submitComment = this.submitComment.bind(this)
    this.deleteComment = this.deleteComment.bind(this)
    this.registerCommentPopovers = this.registerCommentPopovers.bind(this)
    this.highlightCommentsInText = this.highlightCommentsInText.bind(this)
    this.closeCommentBox = this.closeCommentBox.bind(this)
    this.displayCommentsSidebar = this.displayCommentsSidebar.bind(this)

    // Track current selection for comment creation
    this.currentSelection = null
    this.currentRange = null

    // Listen for comment changes via AppState
    AppState.on('comments', this.displayCommentsSidebar)
  }

  /**
   * Setup comment selection handling for the active reader
   * Called when a new TextFile is displayed
   */
  setupCommentSelection() {
    const readerContent = document.querySelector('#reader-content')
    if (!readerContent || !AppState.activeTextFile) {
      console.warn('❌ Cannot setup comment selection - missing elements')
      return
    }

    // Add mouseup listener directly to reader content for better detection
    if (this.mouseupListener) {
      readerContent.removeEventListener('mouseup', this.mouseupListener)
    }

    this.mouseupListener = () => {
      console.log('📝 Text selection event detected')
      const selection = window.getSelection()
      const selectedText = selection.toString().trim()
      
      if (selectedText && selectedText.length > 0) {
        console.log('✅ Selected text:', selectedText.substring(0, 50))
        this.currentSelection = selectedText
        this.currentRange = selection.getRangeAt(0)
        
        // Show comment box on Desktop only
        if (window.innerWidth >= 768) {
          this.showCommentBox(selectedText, this.currentRange)
          // Mark that comment box was just opened to prevent immediate close
          this.commentBoxJustOpened = true
          setTimeout(() => {
            this.commentBoxJustOpened = false
          }, 100)
        }
      }
    }

    readerContent.addEventListener('mouseup', this.mouseupListener)
    
    // Close popovers and comment box on outside click
    document.addEventListener('click', this.handleOutsideClick.bind(this))

    // Highlight existing comments
    this.highlightCommentsInText()

    // Register popovers for mobile
    this.registerCommentPopovers()

    console.log('✅ Comment selection setup complete')
  }

  /**
   * Handle text selection in the reader (kept for backward compatibility)
   * @deprecated - Now using mouseup listener directly
   */
  handleTextSelection() {
    // This method is no longer used
  }

  /**
   * Close all open popovers and comment box on outside click
   * @param {Event} event - Click event
   */
  handleOutsideClick(event) {
    // Don't close if comment box was just opened
    if (this.commentBoxJustOpened) {
      return
    }

    const commentBox = document.querySelector('#comment-input-box')
    const popovers = document.querySelectorAll('.popover')
    
    // Check if click is inside comment box
    const isClickInCommentBox = commentBox && commentBox.contains(event.target)
    
    // Check if click is inside a popover
    let isClickInPopover = false
    popovers.forEach(popover => {
      if (popover.contains(event.target)) {
        isClickInPopover = true
      }
    })
    
    // Check if click is on a comment mark (would open popover)
    const isClickOnCommentMark = event.target.closest('.comment-mark')
    
    // Close comment box if clicking outside it
    if (commentBox && !isClickInCommentBox && event.target.id !== 'comment-input-box') {
      this.closeCommentBox()
    }
    
    // Close popovers if clicking outside them and not on another comment mark
    if (!isClickInPopover && !isClickOnCommentMark) {
      this.closeAllPopovers()
    }
  }

  /**
   * Close all open popovers
   */
  closeAllPopovers() {
    const highlights = document.querySelectorAll('.comment-mark')
    highlights.forEach(highlight => {
      try {
        const popover = bootstrap.Popover.getInstance(highlight)
        if (popover) {
          popover.hide()
        }
      } catch (e) {
        // Ignore errors
      }
    })
  }

  /**
   * Show the comment input box at the selection
   * @param {string} selectedText - The selected text
   * @param {Range} range - DOM range object
   */
  showCommentBox(selectedText, range) {
    console.log('🎯 Showing comment box for text:', selectedText.substring(0, 30))
    
    // Get selection position
    const rect = range.getBoundingClientRect()
    
    // Check if comment box already exists, if not create it
    let commentBox = document.querySelector('#comment-input-box')
    if (!commentBox) {
      commentBox = document.createElement('div')
      commentBox.id = 'comment-input-box'
      commentBox.className = 'card comment-box'
      document.body.appendChild(commentBox)
      console.log('📦 Created new comment box element')
    }

    // Build comment box HTML
    commentBox.innerHTML = `
      <div class="card-body p-2">
        <textarea 
          id="comment-text-input" 
          class="form-control form-control-sm mb-2" 
          placeholder="Add a comment..."
          rows="2"
          style="font-size: 0.875rem;"
        ></textarea>
        <div class="d-flex gap-1">
          <button 
            type="button" 
            class="btn btn-sm btn-primary" 
            onclick="app.CommentsController.submitComment()"
          >
            Save
          </button>
          <button 
            type="button" 
            class="btn btn-sm btn-secondary" 
            onclick="app.CommentsController.closeCommentBox()"
          >
            Cancel
          </button>
        </div>
      </div>
    `

    // Position the box at the selection
    const commentBoxEl = document.querySelector('#comment-input-box')
    if (commentBoxEl) {
      commentBoxEl.style.position = 'fixed'
      commentBoxEl.style.top = (rect.bottom + window.scrollY + 10) + 'px'
      commentBoxEl.style.left = (rect.left + window.scrollX) + 'px'
      commentBoxEl.style.zIndex = '9999'
      commentBoxEl.style.minWidth = '250px'
      commentBoxEl.style.maxWidth = '300px'
      commentBoxEl.style.display = 'block'
    }

    // Focus the textarea
    setTimeout(() => {
      const input = document.querySelector('#comment-text-input')
      if (input) {
        input.focus()
        console.log('✅ Focused comment input')
      }
    }, 0)
  }

  /**
   * Submit a comment for the selected text
   */
  submitComment() {
    const textInput = document.querySelector('#comment-text-input')
    if (!textInput || !textInput.value.trim()) {
      Pop.warning(new Error('Please enter a comment'))
      return
    }

    if (!this.currentSelection || !AppState.activeTextFile) {
      Pop.error(new Error('No text selected or file loaded'))
      return
    }

    // Calculate text offsets in the full body
    const body = AppState.activeTextFile.body
    const startOffset = body.indexOf(this.currentSelection)
    const endOffset = startOffset + this.currentSelection.length

    // Create comment
    const commentData = {
      text: textInput.value.trim(),
      selectedText: this.currentSelection,
      startOffset,
      endOffset
    }

    commentsService.addComment(AppState.activeTextFile.id, commentData)
    
    // Refresh display
    this.highlightCommentsInText()
    this.registerCommentPopovers()
    this.closeCommentBox()

    // Clear selection
    window.getSelection().removeAllRanges()

    Pop.success(new Pop('Comment saved!'))
  }

  /**
   * Close the comment input box
   */
  closeCommentBox() {
    const commentBox = document.querySelector('#comment-input-box')
    if (commentBox) {
      commentBox.style.display = 'none'
    }
  }

  /**
   * Delete a comment
   * @param {string} commentId - Comment ID to delete
   */
  async deleteComment(commentId) {
    const confirmed = await Pop.confirm('Delete Comment?', 'Are you sure you want to delete this comment? This action cannot be undone.')
    if (confirmed) {
      commentsService.removeComment(commentId)
      this.highlightCommentsInText()
      this.registerCommentPopovers()
      Pop.success('Comment Deleted')
    }
  }

  /**
   * Highlight all comments in the text with underlines
   * Uses innerHTML replacement to apply marks without breaking DOM
   */
  highlightCommentsInText() {
    if (!AppState.activeTextFile) return

    const comments = commentsService.getCommentsByTextFile(AppState.activeTextFile.id)
    const readerContent = document.querySelector('#reader-content')
    if (!readerContent || comments.length === 0) return

    // Get current HTML
    let html = readerContent.innerHTML

    // Apply each comment mark by replacing text
    comments.forEach(comment => {
      const safeText = comment.selectedText
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
      
      const regex = new RegExp(`(?<!>)${safeText}(?!</span>)`, 'g')
      const popoverContent = comment.getPopoverContent().replace(/\"/g, '&quot;').replace(/\\n/g, ' ')
      
      html = html.replace(regex, (match) => {
        return `<span class="comment-mark" data-comment-id="${comment.id}" data-bs-toggle="popover" data-bs-trigger="click" data-bs-placement="right" data-bs-content="${popoverContent}">${match}</span>`
      })
    })

    readerContent.innerHTML = html

    // Initialize popovers for the new marks
    setTimeout(() => {
      this.registerCommentPopovers()
    }, 0)
  }

  /**
   * Register Bootstrap popovers for comment highlights
   * Popovers are shown on click for all screen sizes
   */
  registerCommentPopovers() {
    const highlights = document.querySelectorAll('.comment-mark')
    highlights.forEach(highlight => {
      // Initialize Bootstrap popover if not already initialized
      let popover = null
      try {
        popover = bootstrap.Popover.getInstance(highlight)
      } catch (e) {
        // bootstrap not available, skip
      }
      
      if (!popover) {
        try {
          new bootstrap.Popover(highlight, {
            html: true,
            trigger: 'click',
            placement: 'auto',
            container: 'body'
          })
        } catch (e) {
          console.log('Popover initialization skipped')
        }
      }
    })
  }

  /**
   * Display all comments for active file in sidebar (Desktop only)
   * Comments are positioned relatively near their paragraph
   */
  displayCommentsSidebar() {
    if (!AppState.activeTextFile) return

    const commentsSidebar = document.querySelector('.comments-sidebar')
    if (!commentsSidebar) return

    const comments = commentsService.getCommentsByTextFile(AppState.activeTextFile.id)
    
    if (comments.length === 0) {
      commentsSidebar.innerHTML = '<p class="text-muted p-3 m-0">No comments yet</p>'
    } else {
      // Create a comment card for each comment without container padding
      const commentsHTML = comments.map((c, idx) => `
        <div class="comment-sidebar-item mb-2">
          <div class="comment-content">
            <p class="comment-text mb-1">${c.text}</p>
            <small class="comment-quote d-block mb-2">
              "${c.selectedText.substring(0, 50)}${c.selectedText.length > 50 ? '...' : ''}"
            </small>
            <small class="comment-meta d-block mb-2">${c.getFormattedDate()}</small>
            <button 
              type="button" 
              class="btn btn-sm btn-outline-danger" 
              onclick="app.CommentsController.deleteComment('${c.id}')"
            >
              <i class="bi bi-trash"></i> Delete
            </button>
          </div>
        </div>
      `).join('')
      
      commentsSidebar.innerHTML = `
        <div class="comments-header ps-3 pt-3 pb-2 border-bottom">
          <h6 class="m-0">Comments (${comments.length})</h6>
        </div>
        <div class="comments-list p-2">
          ${commentsHTML}
        </div>
      `
    }

    // Apply app settings to sidebar for consistency
    AppState.appSettings.applySettings(commentsSidebar)
  }
}

// Export singleton instance for global access
export const commentsController = new CommentsController()
