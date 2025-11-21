import { AppSettings } from './models/AppSettings.js'
import { TextFile } from './models/TextFile.js'
import { EventEmitter } from './utils/EventEmitter.js'
import { createObservableProxy } from './utils/ObservableProxy.js'
import { loadState } from './utils/Store.js'

class ObservableAppState extends EventEmitter {

  appSettings = loadState('appSettings', AppSettings)

  textFiles = loadState('textFiles', [TextFile])

  /** @type {TextFile} */
  activeTextFile = null

}

export const AppState = createObservableProxy(new ObservableAppState())