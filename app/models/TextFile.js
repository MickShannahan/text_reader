import { generateId } from "../utils/GenerateId.js";
import { TextAnalyzer } from "../utils/TextAnalyzer.js";


export class TextFile {
  constructor(data) {
    this.id = data.id || generateId()
    this.title = data.title || this.getFileName(data)
    this.body = data.body || this.getFileBody(data)
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date()
    this.readingProgress = data.readingProgress || 0
    this.maxScrollPosition = data.maxScrollPosition || 0
    this.lastParagraphRead = data.lastParagraphRead || -1
  }

  updateReadingProgress(percentage) {
    this.readingProgress = Math.min(Math.max(percentage, 0), 100)
  }

  updateMaxScrollPosition(scrollPixels) {
    this.maxScrollPosition = Math.max(this.maxScrollPosition, scrollPixels)
  }

  get ListTemplate() {
    const wordCount = TextAnalyzer.getWordCount(this.body)
    const formattedDate = TextAnalyzer.formatDate(this.createdAt)
    const progressPercentage = Math.round(this.readingProgress)
    const isComplete = progressPercentage == 100

    return `
      <div class="card mb-2 text-file-card" onclick="app.TextFilesController.setActiveTextFile('${this.id}')">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="flex-grow-1">
              <h6 class="card-title mb-1"><i class="bi ${!isComplete ? 'bi-journal' : 'bi-journal-check'}"></i> ${this.title}</h6>
              <small class="text-muted">${wordCount} words • ${formattedDate}</small>
            </div>
            <button 
              type="button" 
              class="btn btn-sm btn-outline-danger" 
              onclick="event.stopPropagation(); app.TextFilesController.removeTextFile('${this.id}')"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
          <div class="progress" style="height: 6px;">
            <div class="progress-bar" role="progressbar" style="width: ${progressPercentage}%" aria-valuenow="${progressPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
          </div>
          <small class="text-muted d-block mt-1">${progressPercentage}% read</small>
        </div>
      </div>
    `
  }

  get ActiveTemplate() {
    const wordCount = TextAnalyzer.getWordCount(this.body)
    const paragraphCount = TextAnalyzer.getParagraphCount(this.body)
    const formattedDate = TextAnalyzer.formatDate(this.createdAt)
    const progressPercentage = Math.round(this.readingProgress)
    const paragraphs = TextAnalyzer.splitIntoParagraphs(this.body)
    const paragraphsHtml = paragraphs.map((p, idx) => {
      const isBookmarked = idx === this.lastParagraphRead
      const bookmark = isBookmarked ? '<span class="bookmark-indicator" title="Last read">📍</span>' : ''
      return `<p data-paragraph-index="${idx}">${bookmark} ${p}</p>`
    }).join('')

    return `
      <div class="active-text-file-wrapper">
        <div class="reader-header mb-4">
          <h1 class="mb-2">${this.title}</h1>
          <div class="reader-meta text-muted">
            <small>
              Created: ${formattedDate} • 
              <span id="word-count">${wordCount}</span> words • 
              <span id="paragraph-count">${paragraphCount}</span> paragraphs
            </small>
          </div>
          <div class="mt-2">
            <div class="progress" style="height: 8px;">
              <div class="progress-bar bg-success" role="progressbar" style="width: ${progressPercentage}%" aria-valuenow="${progressPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <small id="reading-progress-text" class="text-muted mt-1 d-block">${progressPercentage}% completed</small>
          </div>
        </div>
        <div class="reader-content" id="reader-content">
          ${paragraphsHtml}
        </div>
      </div>
    `
  }


  getFileName(data) {
    return 'placeholder title'
  }

  getFileBody(data) {
    return 'placeholder Body'
  }
}