import { AppSettingsController } from "./controllers/AppSettingsController.js"
import { TextFilesController } from "./controllers/TextFilesController.js"

class App {

  TextFilesController = new TextFilesController()

  AppSettingsController = new AppSettingsController()

}

window['app'] = new App()


