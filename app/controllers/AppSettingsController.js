import { AppState } from "../AppState.js";
import { saveState } from "../utils/Store.js";
import { Pop } from "../utils/Pop.js";

export class AppSettingsController {
  constructor() {
    this.form = document.querySelector('form.app-settings-form')
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleFormSubmit(e))
      this.form.addEventListener('change', () => this.updateSettings())
      this.populateForm()
      this.applySettings()
    }
  }

  populateForm() {
    if (!this.form) return

    const fontSize = this.form.querySelector('#fontSize')
    const lineHeight = this.form.querySelector('#lineHeight')
    const fontFamily = this.form.querySelector('#fontFamily')
    const letterSpacing = this.form.querySelector('#letterSpacing')
    const textAlign = this.form.querySelector('#textAlign')
    const backgroundColor = this.form.querySelector('#backgroundColor')
    const textColor = this.form.querySelector('#textColor')
    const maxWidth = this.form.querySelector('#maxWidth')
    const paragraphSpacing = this.form.querySelector('#paragraphSpacing')
    const contrast = this.form.querySelector('#contrast')
    const theme = this.form.querySelector('#theme')

    if (fontSize) fontSize.value = AppState.appSettings.fontSize
    if (lineHeight) lineHeight.value = AppState.appSettings.lineHeight
    if (fontFamily) fontFamily.value = AppState.appSettings.fontFamily
    if (letterSpacing) letterSpacing.value = AppState.appSettings.letterSpacing
    if (textAlign) textAlign.value = AppState.appSettings.textAlign
    if (backgroundColor) backgroundColor.value = AppState.appSettings.backgroundColor
    if (textColor) textColor.value = AppState.appSettings.textColor
    if (maxWidth) maxWidth.value = AppState.appSettings.maxWidth
    if (paragraphSpacing) paragraphSpacing.value = AppState.appSettings.paragraphSpacing
    if (contrast) contrast.value = AppState.appSettings.contrast
    if (theme) theme.value = AppState.appSettings.theme

    this.updateFontSizeDisplay()
    this.updateLineHeightDisplay()
    this.updateLetterSpacingDisplay()
    this.updateMaxWidthDisplay()
    this.updateParagraphSpacingDisplay()
    this.updateContrastDisplay()
  }

  updateSettings() {
    if (!this.form) return

    const fontSize = this.form.querySelector('#fontSize')
    const lineHeight = this.form.querySelector('#lineHeight')
    const fontFamily = this.form.querySelector('#fontFamily')
    const letterSpacing = this.form.querySelector('#letterSpacing')
    const textAlign = this.form.querySelector('#textAlign')
    const backgroundColor = this.form.querySelector('#backgroundColor')
    const textColor = this.form.querySelector('#textColor')
    const maxWidth = this.form.querySelector('#maxWidth')
    const paragraphSpacing = this.form.querySelector('#paragraphSpacing')
    const contrast = this.form.querySelector('#contrast')
    const theme = this.form.querySelector('#theme')

    if (fontSize) AppState.appSettings.fontSize = parseInt(fontSize.value)
    if (lineHeight) AppState.appSettings.lineHeight = parseFloat(lineHeight.value)
    if (fontFamily) AppState.appSettings.fontFamily = fontFamily.value
    if (letterSpacing) AppState.appSettings.letterSpacing = parseFloat(letterSpacing.value)
    if (textAlign) AppState.appSettings.textAlign = textAlign.value
    if (backgroundColor) AppState.appSettings.backgroundColor = backgroundColor.value
    if (textColor) AppState.appSettings.textColor = textColor.value
    if (maxWidth) AppState.appSettings.maxWidth = parseInt(maxWidth.value)
    if (paragraphSpacing) AppState.appSettings.paragraphSpacing = parseFloat(paragraphSpacing.value)
    if (contrast) AppState.appSettings.contrast = parseFloat(contrast.value)
    if (theme) AppState.appSettings.theme = theme.value

    this.applySettings()
    this.updateFontSizeDisplay()
    this.updateLineHeightDisplay()
    this.updateLetterSpacingDisplay()
    this.updateMaxWidthDisplay()
    this.updateParagraphSpacingDisplay()
    this.updateContrastDisplay()
  }

  applySettings() {
    const mainReader = document.querySelector('.main-reader')
    if (mainReader) {
      AppState.appSettings.applySettings(mainReader)
    }
  }

  updateFontSizeDisplay() {
    const display = this.form?.querySelector('#fontSizeDisplay')
    if (display) display.textContent = AppState.appSettings.fontSize + 'px'
  }

  updateLineHeightDisplay() {
    const display = this.form?.querySelector('#lineHeightDisplay')
    if (display) display.textContent = AppState.appSettings.lineHeight.toFixed(1)
  }

  updateLetterSpacingDisplay() {
    const display = this.form?.querySelector('#letterSpacingDisplay')
    if (display) display.textContent = AppState.appSettings.letterSpacing.toFixed(1) + 'px'
  }

  updateMaxWidthDisplay() {
    const display = this.form?.querySelector('#maxWidthDisplay')
    if (display) display.textContent = AppState.appSettings.maxWidth + 'ch'
  }

  updateParagraphSpacingDisplay() {
    const display = this.form?.querySelector('#paragraphSpacingDisplay')
    if (display) display.textContent = AppState.appSettings.paragraphSpacing.toFixed(1) + 'rem'
  }

  updateContrastDisplay() {
    const display = this.form?.querySelector('#contrastDisplay')
    if (display) display.textContent = AppState.appSettings.contrast.toFixed(2)
  }

  handleFormSubmit(e) {
    e.preventDefault()
    this.saveAppSettings()
  }

  saveAppSettings() {
    saveState('appSettings', AppState.appSettings)
    Pop.success('Settings Saved', 'Your reading preferences have been saved')
  }
}

