import { AppState } from "../AppState.js"
import { TextFile } from "../models/TextFile.js"
import { loadState, saveState } from "../utils/Store.js"
import { Pop } from "../utils/Pop.js"



class TextFilesService {

  addTextFile(textFileData) {
    const textFile = new TextFile(textFileData)
    AppState.textFiles.push(textFile)
    this.setActiveTextFile(textFile.id)
    this.saveTextFiles()
  }

  setActiveTextFile(textFileId) {
    const textFile = AppState.textFiles.find(tf => tf.id === textFileId)
    if (!textFile) {
      console.warn(`TextFile with id ${textFileId} not found`)
      return
    }
    AppState.activeTextFile = textFile
  }

  removeTextFile(textFileId) {
    Pop.confirm(
      'Delete Text File?',
      'This action cannot be undone.',
      'Delete',
      'Cancel'
    ).then(confirmed => {
      if (!confirmed) return

      const index = AppState.textFiles.findIndex(tf => tf.id === textFileId)
      if (index === -1) return

      AppState.textFiles.splice(index, 1)

      // Clear active text file if it was the one deleted
      if (AppState.activeTextFile?.id === textFileId) {
        AppState.activeTextFile = AppState.textFiles[0] || null
      }

      this.saveTextFiles()
      Pop.success('Deleted', 'Text file removed successfully')
    })
  }

  saveTextFiles() {
    saveState('textFiles', AppState.textFiles)
  }

  loadTextFiles() {
    AppState.textFiles = loadState('textFiles', [TextFile])
  }
}

export const textFilesService = new TextFilesService()