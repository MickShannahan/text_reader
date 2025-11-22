import { AppState } from "../AppState.js";
import { textFilesService } from "../services/TextFilesService.js";
import { commentsService } from "../services/CommentsService.js";
import { commentsController } from "./CommentsController.js";
import { getFormData } from "../utils/FormHandler.js";
import { Pop } from "../utils/Pop.js";
import { CharsetDecoder } from "../utils/CharsetDecoder.js";


export class TextFilesController {
  constructor() {
    // Bind methods first to preserve this context
    this.drawTextFilesList = this.drawTextFilesList.bind(this)
    this.drawActiveTextFile = this.drawActiveTextFile.bind(this)
    this.setupScrollTracking = this.setupScrollTracking.bind(this)
    this.updateReadingProgress = this.updateReadingProgress.bind(this)

    // Track maximum scroll position for this session
    this.maxScrollTop = 0

    AppState.on('textFiles', this.drawTextFilesList)
    AppState.on('activeTextFile', this.drawActiveTextFile)
    textFilesService.loadTextFiles()
    this.drawActiveTextFile()
  }

  drawTextFilesList() {
    const textFilesList = AppState.textFiles.map(tf => tf.ListTemplate).join('')
    const textFilesListElement = document.querySelector('#text-files-list')
    if (textFilesListElement) {
      textFilesListElement.innerHTML = textFilesList
    }
  }

  drawActiveTextFile() {
    const activeTextFileElement = document.querySelector('#active-text-file article')
    if (!activeTextFileElement) return

    if (AppState.activeTextFile) {
      // Get comment count for this file
      const commentCount = commentsService.getCommentsByTextFile(AppState.activeTextFile.id).length
      
      // Create header with toggle button for active file
      const headerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="m-0">${AppState.activeTextFile.title}</h5>
          <button 
            class="btn btn-sm btn-outline-secondary" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#commentsSidebarCollapse" 
            aria-expanded="false"
            aria-controls="commentsSidebarCollapse"
            title="Toggle Comments"
          >
            <i class="bi bi-chat-left-text"></i> ${commentCount}
          </button>
        </div>
      `
      
      activeTextFileElement.innerHTML = headerHTML + AppState.activeTextFile.ActiveTemplate
      this.setupScrollTracking()

      // Setup comments for this file
      commentsController.setupCommentSelection()
      commentsController.displayCommentsSidebar()
    } else {
      activeTextFileElement.innerHTML = `
        <div data-bs-toggle="offcanvas" data-bs-target="#settings-tab" class="placeholder-content text-center py-5">
          <i class="bi bi-file-text" style="font-size: 3rem; color: var(--bs-gray-600);"></i>
          <p class="mt-3 text-muted">Select a text file to begin reading</p>
        </div>
      `
    }

    // Apply settings to the main reader
    const mainReader = document.querySelector('.main-reader')
    if (mainReader) {
      AppState.appSettings.applySettings(mainReader)
    }

    // Trigger initial progress display
    setTimeout(() => {
      this.updateReadingProgress()
    }, 100)
  }

  setupScrollTracking() {
    const mainReader = document.querySelector('.main-reader')
    const readerContent = document.querySelector('#reader-content')
    if (!mainReader || !readerContent || !AppState.activeTextFile) {
      console.warn('❌ Cannot setup scroll tracking - missing elements')
      return
    }

    // Restore scroll position from saved data (no conversion, no rounding!)
    const savedMaxScroll = AppState.activeTextFile.maxScrollPosition
    if (savedMaxScroll > 0) {
      mainReader.scrollTop = savedMaxScroll
      console.log(`📍 Restored scroll position to ${savedMaxScroll}px`)
    }

    // Remove previous listener if exists
    if (this.scrollListener) {
      mainReader.removeEventListener('scroll', this.scrollListener)
    }

    this.scrollListener = () => this.updateReadingProgress()
    mainReader.addEventListener('scroll', this.scrollListener)
    console.log('✅ Scroll tracking setup complete')
  }

  updateReadingProgress() {
    const mainReader = document.querySelector('.main-reader')
    const readerContent = document.querySelector('#reader-content')

    if (!mainReader || !readerContent || !AppState.activeTextFile) {
      console.warn('⚠️ Missing required elements, bailing out')
      return
    }

    const paragraphs = readerContent.querySelectorAll('p')
    if (paragraphs.length === 0) {
      console.warn('⚠️ No paragraphs found')
      return
    }

    // Calculate total scroll height
    const scrollTop = mainReader.scrollTop
    const scrollHeight = mainReader.scrollHeight
    const clientHeight = mainReader.clientHeight
    const totalScrollableHeight = scrollHeight - clientHeight

    // Track the maximum scroll position reached (in pixels, not percentage)
    if (scrollTop > AppState.activeTextFile.maxScrollPosition) {
      AppState.activeTextFile.updateMaxScrollPosition(scrollTop)
    }

    // Calculate progress percentage based on current max scroll
    let progressPercentage = 0
    if (totalScrollableHeight > 0) {
      progressPercentage = (AppState.activeTextFile.maxScrollPosition / totalScrollableHeight) * 100
    }

    // Clamp between 0 and 100
    progressPercentage = Math.min(Math.max(progressPercentage, 0), 100)
    // console.log(`📈 Progress: ${progressPercentage.toFixed(2)}% (scroll: ${AppState.activeTextFile.maxScrollPosition}px)`)

    // Update the active text file reading progress percentage
    AppState.activeTextFile.updateReadingProgress(progressPercentage)

    // Update the progress bar in the reader header
    const progressBar = document.querySelector('#active-text-file .progress-bar')
    if (progressBar) {
      const roundedProgress = Math.round(progressPercentage)
      progressBar.style.width = roundedProgress + '%'
      progressBar.setAttribute('aria-valuenow', String(roundedProgress))
    }

    // Update the progress text in the reader header
    const progressTextElement = document.querySelector('#reading-progress-text')
    if (progressTextElement) {
      const roundedProgress = Math.round(progressPercentage)
      progressTextElement.textContent = `${roundedProgress}% completed`
    }

    // Track which paragraph the user is currently reading (for bookmark)
    const allParagraphs = readerContent.querySelectorAll('p')
    let currentParagraphIndex = -1

    allParagraphs.forEach((para, idx) => {
      const rect = para.getBoundingClientRect()
      const readerRect = mainReader.getBoundingClientRect()

      // Check if paragraph is in viewport
      if (rect.top < readerRect.bottom && rect.bottom > readerRect.top) {
        currentParagraphIndex = idx
      }
    })

    // Update bookmark if we're at a different paragraph
    if (currentParagraphIndex !== AppState.activeTextFile.lastParagraphRead) {
      AppState.activeTextFile.lastParagraphRead = currentParagraphIndex
      // console.log(`📍 Bookmark updated to paragraph ${currentParagraphIndex}`)
    }

    // Redraw the list to show updated progress
    this.drawTextFilesList()

    // Save progress periodically (every 2 seconds)
    if (!this.lastProgressSave || Date.now() - this.lastProgressSave > 2000) {
      textFilesService.saveTextFiles()
      this.lastProgressSave = Date.now()
    }
  }

  setActiveTextFile(textFileId) {
    textFilesService.setActiveTextFile(textFileId)
  }

  addNewTextFile(event) {
    event.preventDefault()
    const form = event.target
    const fileInput = form.querySelector('input[type="file"]')

    if (!fileInput || !fileInput.files.length) {
      return
    }

    const file = fileInput.files[0]

    // Validate file is a text file
    if (!file.type.startsWith('text/') && !file.name.endsWith('.txt')) {
      Pop.error(new Error('Please select a text file (.txt)'))
      return
    }

    // Use CharsetDecoder to handle encoding
    CharsetDecoder.decodeFile(file)
      .then(fileContent => {
        const textFileData = {
          title: file.name.replace('.txt', ''),
          body: fileContent
        }
        textFilesService.addTextFile(textFileData)
        form.reset()
      })
      .catch(error => {
        Pop.error(error)
      })
  }

  removeTextFile(textFileId) {
    // Remove associated comments
    commentsService.clearTextFileComments(textFileId)
    // Remove the file
    textFilesService.removeTextFile(textFileId)
  }
}