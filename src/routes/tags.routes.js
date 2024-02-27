const { Router } = require("express");

const TagsController = require("../controllers/TagsController");
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

const tagsRoutes = Router();

const tagsController = new TagsController();

//extração de info:

tagsRoutes.get("/", ensureAuthenticated, tagsController.index);



// expor as rotas para usar no servidor
module.exports = tagsRoutes;