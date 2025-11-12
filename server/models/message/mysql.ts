import { DataTypes } from 'sequelize'
import { sequelizeExample } from '../db'

export const messageMysql = sequelizeExample.define(
  'message',
  {
    content: {
      type: DataTypes.STRING
    },
    persona_id: {
      type: DataTypes.BIGINT
    },
    user_id: {
      type: DataTypes.STRING
    },
    plugin_id: {
      type: DataTypes.BIGINT
    },
    role: {
      type: DataTypes.STRING
    },
    frequency_penalty: {
      type: DataTypes.NUMBER
    },
    max_tokens: {
      type: DataTypes.NUMBER
    },
    model: {
      type: DataTypes.STRING
    },
    presence_penalty: {
      type: DataTypes.NUMBER
    },
    temperature: {
      type: DataTypes.NUMBER
    },
    parent_message_id: {
      type: DataTypes.STRING
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
        if (instance.persona_id === '' || instance.persona_id === 'null' || instance.persona_id === 'undefined') {
          instance.persona_id = null
        }
        if (instance.plugin_id === '' || instance.plugin_id === 'null' || instance.plugin_id === 'undefined') {
          instance.plugin_id = null
        }
      },
      beforeUpdate: (instance: any) => {
        // Convert empty strings to null for BIGINT fields
        if (instance.persona_id === '' || instance.persona_id === 'null' || instance.persona_id === 'undefined') {
          instance.persona_id = null
        }
        if (instance.plugin_id === '' || instance.plugin_id === 'null' || instance.plugin_id === 'undefined') {
          instance.plugin_id = null
        }
      },
      beforeBulkCreate: (instances: any[]) => {
        instances.forEach(instance => {
          if (instance.persona_id === '' || instance.persona_id === 'null' || instance.persona_id === 'undefined') {
            instance.persona_id = null
          }
          if (instance.plugin_id === '' || instance.plugin_id === 'null' || instance.plugin_id === 'undefined') {
            instance.plugin_id = null
          }
        })
      }
    }
  }
)

export default messageMysql
