import sequelize, { Sequelize } from 'sequelize'
import config from '../config'

const sequelizeExample = new Sequelize({
  ...config.getConfig('postgres_config'),
  logging: (sql: string, timing?: number) => {
    console.log(sql)
  }
})

const initPostgres = async () => {
  try {
    await sequelizeExample.authenticate()
    console.log('PostgreSQL database connection succeeded.')
  } catch (error) {
    console.log(`PostgreSQL database link error: ${error}`)
    console.log('Please ensure PostgreSQL is installed and running.')
    console.log('Check POSTGRESQL_SETUP.md for installation instructions.')
  }

  return sequelizeExample
}

const initDB = async () => {
  await initPostgres()
}

export { sequelize, sequelizeExample }
export default initDB
