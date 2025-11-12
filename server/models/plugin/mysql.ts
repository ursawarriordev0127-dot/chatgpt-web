import { DataTypes } from 'sequelize'
import { sequelizeExample } from '../db'

export const pluginMysql = sequelizeExample.define(
  'plugin',
  {
    user_id: {
      type: DataTypes.STRING
    },
    name: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    avatar: {
      type: DataTypes.STRING
    },
    variables: {
      type: DataTypes.STRING
    },
    function: {
      type: DataTypes.TEXT
    },
    script: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.NUMBER
    },
    create_time: {
      type: DataTypes.STRING
    },
    update_time: {
      type: DataTypes.STRING
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
)

export default pluginMysql
