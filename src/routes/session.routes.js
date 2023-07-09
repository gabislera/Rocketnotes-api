const { Router } = require("express")

const SessionsController = require("../controllers/SessionsController")
const sessionsController = new SessionsController()  //instancia a classe usando new, alocando a classe na memoria e armazenando na constante

const sessionRoutes = Router()

sessionRoutes.post("/", sessionsController.create)

module.exports = sessionRoutes