import { DataTypes } from 'sequelize'
import { sequelizeExample } from '../db'

export const installedPluginMysql = sequelizeExample.define(
  'installed_plugin',
  {
    user_id: {
      type: DataTypes.STRING
    },
    plugin_id: {
      type: DataTypes.BIGINT
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
    freezeTableName: true,
    hooks: {
      beforeCreate: (instance: any) => {
        // Convert empty strings to null for BIGINT fields
        if (instance.plugin_id === '' || instance.plugin_id === 'null' || instance.plugin_id === 'undefined') {
          instance.plugin_id = null
        }
      },
      beforeUpdate: (instance: any) => {
        // Convert empty strings to null for BIGINT fields
        if (instance.plugin_id === '' || instance.plugin_id === 'null' || instance.plugin_id === 'undefined') {
          instance.plugin_id = null
        }
      }
    }
  }
)

export default installedPluginMysql
