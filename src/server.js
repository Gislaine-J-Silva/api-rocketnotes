//importa o express-async-errors
require('express-async-errors')
const migrationsRun = require('./database/sqlite/migrations')
const AppError = require('./utils/AppError')
const uploadConfig = require('./configs/upload')

//importa toda a pasta do express e despejando nesse código.
const express = require('express')
const cors = require('cors')

// Usar as rotas, como o arquivo ta como index, não é necessário por no require (./routes/index.js) por ser carregado como padrão.
const routes = require('./routes')

//inicializa o express
const app = express()

app.use(cors())
app.use(express.json())

app.use('/files', express.static(uploadConfig.UPLOADS_FOLDER))

app.use(routes)

migrationsRun()

//Capturar o error:
app.use((error, request, response, next) => {
  //verifica se o erro vem do client:
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      status: 'error',
      message: error.message
    })
  }

  console.error(error)

  //se for erro do servidor
  return response.status(500).json({
    status: 'error',
    message: 'Internal server error'
  })
})

//Informando o express a porta
const PORT = 3333
app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`))
