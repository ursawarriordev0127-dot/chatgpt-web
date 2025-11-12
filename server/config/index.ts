export type Config = {
  port: number
  postgres_config: {
    dialect: string
    host: string
    port: number
    username: string
    password: string
    database: string
    timezone: string
    dialectOptions: { [key: string]: any }
  }
  redis_config: {
    type: string
    host: string
    port: number
    auth_pass?: string
    password: string
  }
}

function getConfig(key?: keyof Config): any {
  const config: Config = {
    port: 3200,
    postgres_config: {
      dialect: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: '123qwe!@#QWE',
      database: 'chatgpt-web',
      timezone: '+08:00',
      dialectOptions: {
        // PostgreSQL specific options
        ssl: false, // Set to true if using SSL connection
        // Use native PostgreSQL types
        useUTC: false
      }
    },
    redis_config: {
      type: 'redis',
      host: '127.0.0.1',
      port: 6379,
      password: 'chatgpt-web'
    },
  }

  if (key) {
    return config[key]
  }

  return config
}

export default {
  getConfig
}
