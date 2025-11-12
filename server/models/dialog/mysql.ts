import { DataTypes } from 'sequelize'
import { sequelizeExample } from '../db'

export const dialogMysql = sequelizeExample.define(
  'dialog',
  {
    user_id: {
      type: DataTypes.STRING
    },
    name: {
      type: DataTypes.STRING
    },
    issue: {
      type: DataTypes.STRING
    },
    answer: {
      type: DataTypes.STRING
    },
    models: {
      type: DataTypes.STRING
    },
    delay: {
      type: DataTypes.NUMBER
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

export default dialogMysql
