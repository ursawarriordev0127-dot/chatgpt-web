import { Paging } from '../../type'
import { sequelize, sequelizeExample } from '../db'
import { QueryTypes } from 'sequelize'
import aikeyMysql from './mysql'

async function getOneAikey({ model, type }: { model?: string; type?: string }) {
  const where = {
    status: 1
  }
  if (type) {
    where['type'] = type
  }
  if (model) {
    where[sequelize.Op.or] = [
      { models: { [sequelize.Op.like]: `${model},%` } },
      { models: { [sequelize.Op.like]: `%,${model}` } },
      { models: { [sequelize.Op.like]: `%,${model},%` } },
      { models: { [sequelize.Op.eq]: model } }
    ]
  }
  const find = await aikeyMysql
    .findOne({
      where,
      order: sequelize.literal('RANDOM()')
    })
    .then((info) => info?.toJSON())
  return find
}

async function getAikeys({ page, page_size }: Paging, where?: { [key: string]: any }) {
  const finds = await aikeyMysql.findAndCountAll({
    where,
    order: [['create_time', 'DESC']],
    offset: page * page_size,
    limit: page_size
  })
  return finds
}

async function getAiKeyModels({ type }: { type?: 'draw' | 'chat' }) {
  try {
    const finds = await aikeyMysql.findAll({
      where: {
        status: 1
      }
    })

    console.log(`[getAiKeyModels] Found ${finds.length} aikeys with status = 1`)

    const chatArray: Array<{ [key: string]: any }> = []
    const drawArray: Array<{ [key: string]: any }> = []

    finds.forEach((item) => {
      const json = item.toJSON()

      // Skip if type or models is missing
      if (!json.type || !json.models) {
        console.warn(`[getAiKeyModels] Skipping aikey with missing type or models:`, json.id)
        return
      }

      const typeParts = json.type.split('-')
      if (typeParts.length < 2) {
        console.warn(`[getAiKeyModels] Invalid type format:`, json.type)
        return
      }

      const [app, modelType] = typeParts

      // Split models and filter out empty values
      const modelList = json.models.split(',').filter((m: string) => m && m.trim())

      if (modelList.length === 0) {
        console.warn(`[getAiKeyModels] No valid models found for aikey:`, json.id)
        return
      }

      const models = modelList.map((value: string) => ({
        label: value.trim(),
        value: value.trim(),
        type: modelType,
        app,
      }))

      const isDraw = modelType === 'draw' && json.type.includes('draw')
      const isChat = modelType === 'chat' && json.type.includes('chat')

      if (isChat) {
        chatArray.push(...models)
      }
      if (isDraw) {
        drawArray.push(...models)
      }
    })

    function uniqueByValue(arr: Array<{ [key: string]: any }>) {
      const set = new Set()
      return arr.filter(item => {
        if (set.has(item.value)) {
          return false
        } else {
          set.add(item.value)
          return true
        }
      })
    }

    const chat_models = uniqueByValue(chatArray)
    const draw_models = uniqueByValue(drawArray)

    console.log(`[getAiKeyModels] Returning ${chat_models.length} chat models and ${draw_models.length} draw models`)

    return {
      chat_models,
      draw_models
    }
  } catch (error) {
    console.error('[getAiKeyModels] Error fetching models:', error)
    return {
      chat_models: [],
      draw_models: []
    }
  }
}

async function getUserAiKeyModels(userId: string | number, { type }: { type?: 'draw' | 'chat' } = {}) {
  try {
    // Execute raw SQL query to get models from aikey table joined with user table
    // Using INNER JOIN to only get aikeys that are actually assigned to the user
    const queryResults = await sequelizeExample.query(`
      SELECT "aikey".models, "aikey".type
      FROM "aikey"
      INNER JOIN "user" ON "user".aikey_id = "aikey"."id"
      WHERE "aikey".status = 1 AND "user".id = :userId
    `, {
      replacements: { userId },
      type: QueryTypes.SELECT
    })


    const results = (queryResults as unknown) as Array<{ models: string; type: string }>

    // If no user-specific models found, return empty arrays
    if (!results || results.length === 0) {
      console.log(`[getUserAiKeyModels] No models found for user ${userId}`)
      return {
        chat_models: [],
        draw_models: []
      }
    }

    const chatArray: Array<{ [key: string]: any }> = []
    const drawArray: Array<{ [key: string]: any }> = []

    results.forEach((item) => {
      if (!item.models || !item.type) {
        console.warn(`[getUserAiKeyModels] Skipping item with missing models or type`)
        return
      }

      const app = item.type;
      // if (!modelType) {
      // console.warn(`[getUserAiKeyModels] Invalid type format:`, item.type)
      //   return
      // }

      const models = item.models.split(',').filter(m => m && m.trim()).map((value) => ({
        label: value.trim(),
        value: value.trim(),
        type: 'chat',
        app,
      }))

      chatArray.push(...models);
      // drawArray.push(...models)
    })

    function uniqueByValue(arr) {
      const set = new Set()
      return arr.filter(item => {
        if (set.has(item.value)) {
          return false
        } else {
          set.add(item.value)
          return true
        }
      })
    }

    const chat_models = uniqueByValue(chatArray)
    const draw_models = uniqueByValue(drawArray)

    console.log(`[getUserAiKeyModels] Found ${chat_models.length} chat models for user ${userId}`)

    return {
      chat_models,
      draw_models
    }
  } catch (error) {
    console.error(`[getUserAiKeyModels] Error fetching models for user ${userId}:`, error)
    return {
      chat_models: [],
      draw_models: []
    }
  }
}

async function delAikey(id) {
  const del = await aikeyMysql.destroy({
    where: {
      id
    }
  })
  return del
}

async function addAikey(data: { [key: string]: any }) {
  const add = await aikeyMysql.create(data)
  return add
}

async function editAikey(id: number | string, data: { [key: string]: any }) {
  const edit = await aikeyMysql.update(data, {
    where: {
      id
    }
  })
  return edit
}

export default {
  getOneAikey,
  getAikeys,
  delAikey,
  addAikey,
  editAikey,
  getAiKeyModels,
  getUserAiKeyModels
}
