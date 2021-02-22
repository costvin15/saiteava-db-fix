import 'dotenv/config'
import mysql from 'mysql2/promise'

const getField = async ({connection}) => {
  const [rows] = await connection.query('SELECT * FROM mdl_user_info_field WHERE name = ?', ['estado_residencia'])
  const result = rows.pop()
  return result
}

const getUsers = async ({connection}) => {
  const [rows] = await connection.query('SELECT * FROM mdl_user WHERE id <> 1')
  return rows
}

const setAnswers = async ({user, field, connection}) => {
  const [rows] = await connection.query('SELECT * FROM mdl_user_info_data WHERE userid = ? AND fieldid = ?', [user.id, field.id])

  if (rows.length === 0) {
    console.log(`-> O campo do usuário ${user.id} está sendo atualizado.`)
    await connection.query('INSERT INTO mdl_user_info_data (userid, fieldid, data, dataformat) VALUES (?, ?, ?, ?)', [user.id, field.id, "Maranhão", 0])
  } else {
    console.log(`-> O usuário ${user.id} não precisa ser atualizado. Uma resposta já foi preenchida com: ${rows[0].data}`)
  }
}

(async () => {
  console.log('Criando conexão com banco de dados')
  const connection = await mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
  })

  console.log('Conectando...')
  await connection.connect()

  console.log('Pesquisando o campo no banco de dados...')
  const field = await getField({connection})

  if (!field) {
    console.error('O campo não foi encontrado')
  }

  console.log('Coletando todos os usuários no banco de dados...')
  const users = await getUsers({connection})

  for (const user of users) {
    await setAnswers({user, field, connection})
  }

  console.log('Encerrando conexão')
  await connection.end()
  console.log('Conexão encerrada')
})()
