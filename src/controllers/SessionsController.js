const { compare } = require("bcryptjs");
const knex = require('../database/knex');
const AppError = require('../utils/AppError');
const authConfig = require('../configs/auth');
const { sign } = require('jsonwebtoken');

class SessionsController {
    async create(request, response){
        const { email, password } = request.body;
        
        const user = await knex("users").where({ email }).first();
         
        //validação se o usuario existe ou não no banco de dados.
        if(!user) {
            throw new AppError("E-mail ou Senha Incorreta.", 401)
        }

        // verificação se a senha passada é a mesma senha criptografa
        const passwordMatched = await compare(password, user.password);

        if(!passwordMatched) {
            throw new AppError("E-mail ou Senha Incorreta.", 401)
        }

        const { secret, expiresIn } = authConfig.jwt;
        const token = sign({}, secret, {
            subject: String(user.id),
            expiresIn
        })

        return response.json({ user, token });
    }
};

module.exports = SessionsController;