import { AppSettingsController } from "./controllers/AppSettingsController.js"
import { TextFilesController } from "./controllers/TextFilesController.js"
import { commentsController } from "./controllers/CommentsController.js"
import { commentsService } from "./services/CommentsService.js"

class App {

  TextFilesController = new TextFilesController()

  AppSettingsController = new AppSettingsController()

  CommentsController = commentsController

  constructor() {
    // Initialize comments from localStorage
    commentsService.loadComments()
  }

}

window['app'] = new App()


