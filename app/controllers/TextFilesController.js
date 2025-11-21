import { AppState } from "../AppState.js";
import { textFilesService } from "../services/TextFilesService.js";
import { getFormData } from "../utils/FormHandler.js";
import { Pop } from "../utils/Pop.js";


export class TextFilesController {
  constructor() {
    // Bind methods first to preserve this context
    this.drawTextFilesList = this.drawTextFilesList.bind(this)
    this.drawActiveTextFile = this.drawActiveTextFile.bind(this)
    this.setupScrollTracking = this.setupScrollTracking.bind(this)
    this.updateReadingProgress = this.updateReadingProgress.bind(this)

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
      activeTextFileElement.innerHTML = AppState.activeTextFile.ActiveTemplate
      this.setupScrollTracking()
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
  }

  setupScrollTracking() {
    const mainReader = document.querySelector('.main-reader')
    const readerContent = document.querySelector('#reader-content')
    if (!mainReader || !readerContent || !AppState.activeTextFile) return

    // Remove previous listener if exists
    if (this.scrollListener) {
      mainReader.removeEventListener('scroll', this.scrollListener)
    }

    this.scrollListener = () => this.updateReadingProgress()
    mainReader.addEventListener('scroll', this.scrollListener)
  }

  updateReadingProgress() {
    const mainReader = document.querySelector('.main-reader')
    const readerContent = document.querySelector('#reader-content')
    if (!mainReader || !readerContent || !AppState.activeTextFile) return

    const paragraphs = readerContent.querySelectorAll('p')
    if (paragraphs.length === 0) return

    // Calculate total scroll height
    const scrollTop = mainReader.scrollTop
    const scrollHeight = mainReader.scrollHeight
    const clientHeight = mainReader.clientHeight
    const totalScrollableHeight = scrollHeight - clientHeight

    // Calculate which paragraphs are visible
    let visibleParagraphs = 0
    let totalParagraphs = paragraphs.length

    paragraphs.forEach(paragraph => {
      const rect = paragraph.getBoundingClientRect()
      const readerRect = mainReader.getBoundingClientRect()

      // Check if paragraph is in viewport
      if (rect.top < readerRect.bottom && rect.bottom > readerRect.top) {
        visibleParagraphs++
      }
    })

    // Calculate progress based on scroll position and visible paragraphs
    let progressPercentage = 0

    if (totalScrollableHeight > 0) {
      // Use scroll position as primary indicator
      progressPercentage = (scrollTop / totalScrollableHeight) * 100
    } else {
      // If not scrollable, use paragraph visibility
      progressPercentage = (visibleParagraphs / totalParagraphs) * 100
    }

    // Clamp between 0 and 100
    progressPercentage = Math.min(Math.max(progressPercentage, 0), 100)

    // Update the active text file reading progress
    AppState.activeTextFile.updateReadingProgress(progressPercentage)

    // Update the progress bar in the reader
    const progressBar = mainReader.querySelector('.progress-bar')
    if (progressBar) {
      const roundedProgress = Math.round(progressPercentage)
      progressBar.style.width = roundedProgress + '%'
      progressBar.setAttribute('aria-valuenow', String(roundedProgress))
    }

    // Update the progress text
    const progressText = mainReader.querySelector('.reader-meta ~ .mt-2 small')
    if (progressText) {
      progressText.textContent = `${Math.round(progressPercentage)}% completed`
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

    const reader = new FileReader()
    reader.onload = (e) => {
      const fileContent = e.target.result
      const textFileData = {
        title: file.name.replace('.txt', ''),
        body: fileContent
      }
      textFilesService.addTextFile(textFileData)
      form.reset()
    }
    reader.onerror = () => {
      Pop.error(new Error('Failed to read file'))
    }
    reader.readAsText(file, 'UTF-8')
  }

  removeTextFile(textFileId) {
    textFilesService.removeTextFile(textFileId)
  }
}