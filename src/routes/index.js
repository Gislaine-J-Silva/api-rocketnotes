const { Router } = require("express");

//importar o userRoutes
const userRouter = require("./users.routes");
const notesRouter = require("./notes.routes");
const tagsRouter = require("./tags.routes");
const sessionsRouter = require("./sessions.routes");

//toda vez que alguém for acessar o /users vai ser redirecionado para o userRoutes, que é o grupo de rotas do usuário
const routes = Router();

routes.use("/users", userRouter);
routes.use("/notes", notesRouter);
routes.use("/tags", tagsRouter);
routes.use("/sessions", sessionsRouter);

module.exports = routes;