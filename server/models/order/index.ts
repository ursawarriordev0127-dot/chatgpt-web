import { Paging } from '../../type'
import userMysql from '../user/mysql';
import orderMysql from './mysql'

async function getOrders({ page, page_size }: Paging, where?: { [key: string]: any }) {
  orderMysql.belongsTo(userMysql, { foreignKey:'user_id', targetKey:'id' });
  const finds = await orderMysql.findAndCountAll({
    where,
    include:[
      {
        model: userMysql,
        required:false,
      }
    ],
    order: [['create_time', 'DESC']],
    offset: page * page_size,
    limit: page_size
  })
  return finds
}

async function getOrderInfo(id) {
  const find = await orderMysql.findByPk(id)
  if (!find) return null
  return find.toJSON()
}

async function delOrder(id) {
  const del = await orderMysql.destroy({
    where: {
      id
    }
  })
  return del
}

async function addOrder(data: { [key: string]: any }) {
  // Sanitize BIGINT fields: convert empty strings to null
  const sanitized = { ...data }
  const bigIntFields = ['product_id', 'payment_id', 'id']
  for (const field of bigIntFields) {
    if (sanitized[field] === '' || sanitized[field] === 'null' || sanitized[field] === 'undefined') {
      sanitized[field] = null
    }
  }
  const add = await orderMysql.create(sanitized)
  return add
}

async function editOrder(data: { [key: string]: any }) {
  // Sanitize BIGINT fields: convert empty strings to null
  const sanitized = { ...data }
  const bigIntFields = ['product_id', 'payment_id', 'id']
  for (const field of bigIntFields) {
    if (sanitized[field] === '' || sanitized[field] === 'null' || sanitized[field] === 'undefined') {
      sanitized[field] = null
    }
  }
  const edit = await orderMysql.upsert(sanitized)
  return edit
}

export default {
  getOrders,
  delOrder,
  addOrder,
  editOrder,
  getOrderInfo
}
