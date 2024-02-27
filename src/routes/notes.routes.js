const { Router } = require("express")

const NotesController = require("../controllers/NotesController");
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

const notesRoutes = Router();

const notesController = new NotesController();

notesRoutes.use(ensureAuthenticated);

//extração de info:
notesRoutes.post("/", notesController.create);
notesRoutes.get("/:id", notesController.show);
notesRoutes.delete("/:id", notesController.delete);
notesRoutes.get("/", notesController.index);


// expor as rotas para usar no servidor
module.exports = notesRoutes;