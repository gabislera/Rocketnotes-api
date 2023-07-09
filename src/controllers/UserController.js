const AppError = require('../utils/AppError')
const { hash, compare } = require('bcryptjs')

const sqliteConnection = require("../database/sqlite")

class UserController {

  async create(req, res) {
    const { name, email, password } = req.body

    const database = await sqliteConnection()
    const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email])

    if(checkUserExists) {
      throw new AppError('Esse email ja está em uso')
    }

    const hashedPassword = await hash(password, 8)

    await database.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword])

    res.status(201).json()

    // if(!name) {
    //   throw new AppError('Nome é obrigatório')
    // }

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