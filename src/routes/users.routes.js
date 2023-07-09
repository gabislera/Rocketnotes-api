const { Router } = require("express")
const UserControllers = require("../controllers/UserController")
const UserAvatarController = require("../controllers/UserAvatarController")
const ensureAuthenticated = require("../middlewares/ensureAuthenticated")
const multer = require("multer")
const uploadConfig = require("../configs/upload")

const usersRoutes = Router()
const upload = multer(uploadConfig.MULTER)

// function myMiddleware(req, res, next){ exemplo antigo de middleware
//   if(!req.body.isAdmin){
//     return res.json( { message: 'user unauthorized '})
//   }
//   next()
// }

const userController = new UserControllers()
const userAvatarControler = new UserAvatarController()

usersRoutes.post("/", userController.create)
usersRoutes.put("/", ensureAuthenticated, userController.update) //removido "/:id" nao precisa passar id pois ele é acessado dentro do middleware
usersRoutes.patch("/avatar", ensureAuthenticated, upload.single("avatar"), userAvatarControler.update)

module.exports = usersRoutes