const { hash, compare } = require('bcryptjs')
//conexão com banco de dados
const sqliteConnetion = require('../database/sqlite')

const AppError = require('../utils/AppError')

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body

    const database = await sqliteConnetion()
    const checkUserExist = await database.get(
      'SELECT * FROM users WHERE email = (?)',
      [email]
    )

    //Regex para validar o e-mail fornecido no formato de email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    //Verificação do Regex do padrão de email
    if (!emailPattern.test(email)) {
      throw new AppError('Por favor, insira um endereço de e-mail válido.')
    }

    //verifica se o email está sendo utilizado por alguém
    if (checkUserExist) {
      throw new AppError('Este e-mail já está em uso.')
    }

    const hashedPassword = await hash(password, 8)

    await database.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    )

    return response.status(201).json()
  }

  async update(request, response) {
    const { name, email, password, old_password } = request.body
    const user_id = request.user.id

    const database = await sqliteConnetion()
    const user = await database.get('SELECT * FROM users WHERE id = (?)', [
      user_id
    ])

    if (!user) {
      throw new AppError('Usuario não encontrado')
    }

    const userWithUpdatedEmail = await database.get(
      'SELECT * FROM users WHERE email = (?)',
      [email]
    )

    //verificação: se encontrar um email e se esse email for diferente do usuario, ta tentando mudar o email pra um email existente.
    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError('Esse e-mail já está em uso.')
    }

    user.name = name ?? user.name
    user.email = email ?? user.email
    //caso tenha nome ele adiciona, caso n informado ele mantem o que já está salvo, isso é o mesmo para o email.

    if (password && !old_password) {
      throw new AppError(
        'Você precisa informar a senha antiga para definir a nova senha.'
      )
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password)

      if (!checkOldPassword) {
        throw new AppError('A senha antiga não confere.')
      }

      user.password = await hash(password, 8)
    }

    await database.run(
      `
            UPDATE users SET
            name = ?,
            email = ?,
            password = ?,
            updated_at = DATETIME('now')
            WHERE id = ?`,
      [user.name, user.email, user.password, user_id]
    )

    return response.json()
  }
}

module.exports = UsersController
