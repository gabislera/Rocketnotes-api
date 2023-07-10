const AppError = require('../utils/AppError')
const { hash, compare } = require('bcryptjs')

const UserRepository = require("../repositories/UserRepository")
const sqliteConnection = require("../database/sqlite")
const UserCreateService = require("../services/UserCreateService")

class UserController {
  async create(req, res) {
    const { name, email, password } = req.body

    const userRepository = new UserRepository()
    const userCreateService = new UserCreateService(userRepository)

    await userCreateService.execute({ name, email, password })

    res.status(201).json()

  }

  async update(req, res) {
    const { name, email, password, old_password } = req.body  // valores que devem ser atualizados passados na requisição
    const user_id = req.user.id

    const database = await sqliteConnection()
    const user = await database.get("SELECT * FROM users WHERE id = (?)", [user_id]) // valores que ja estão no banco de dados

    if (!user) {
      throw new AppError('Usuário não encontrado')
    }

    const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email])

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError("Este email ja está em uso")
    }

    user.name = name ?? user.name // se nao passar name na requisição de atualizar, o name antigo vai ser utilizado
    user.email = email ?? user.email

    if (password && !old_password) { // digitou a senha nova mas nao digitou a senha antiga
      throw new AppError("Informe a senha antiga")
    }

    if (password && old_password) { // se password e old password foram informados...
      const checkOldPassword = await compare(old_password, user.password) // compara senha nova com senha antiga

      if(!checkOldPassword) {
      throw new AppError("Senhas não confere")
      }

      user.password = await hash(password, 8)
    }

    await database.run(` 
      UPDATE users SET 
      name = ?, 
      email = ?, 
      password = ?,
      updated_at = DATETIME('now') 
      WHERE id = ?`, 
      [user.name, user.email, user.password, user_id]
    ) // atualiza o bando de dados com oa valores novos

    return res.status(200).json()
  }
}

module.exports = UserController