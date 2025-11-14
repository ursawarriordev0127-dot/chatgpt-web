import { sequelize } from '../db'
import userMysql from '../user/mysql'
import cashbackMysql from './mysql'

async function addCashback(data: { [key: string]: string | number }) {
  const create = await cashbackMysql.create(data)
  return create
}

async function getCashbackInfo(where: { [key: string]: string | number }) {
  const find = await cashbackMysql.findOne({
    where
  })

  if (find) return find.toJSON()
  return find
}

async function getCashback({ page, page_size }, where?: { [key: string]: any }) {
  cashbackMysql.belongsTo(userMysql, { foreignKey: 'user_id', targetKey: 'id' })
  const find = await cashbackMysql.findAndCountAll({
    where,
    include: [
      {
        model: userMysql,
        required: false,
        as: 'user',
        attributes: ['id', 'account', 'avatar', 'nickname']
      }
    ],
    order: [['create_time', 'DESC']],
    offset: page * page_size,
    limit: page_size
  })

  const rows = await Promise.all(
    find.rows.map(async (item) => {
      const json = await item.toJSON()
      const superiorInfo = await userMysql.findByPk(json?.benefit_id).then((user) => user?.toJSON())
	  if(!superiorInfo){
		return {
			...json,
			benefit: null
		}
	  }
      return {
        ...json,
        benefit: {
          id: superiorInfo.id,
          account: superiorInfo.account,
          avatar: superiorInfo.avatar,
          nickname: superiorInfo.nickname
        }
      }
    })
  )

  return { ...find, rows }
}

async function delCashback(id) {
  const del = await cashbackMysql.destroy({
    where: {
      id
    }
  })
  return del
}

async function editCashback(id: number | string, data: { [key: string]: any }) {
  const edit = await cashbackMysql.update(
    { ...data },
    {
      where: {
        id
      }
    }
  )
  return edit
}

async function getUserCashbackAmount(
  key: string,
  where?: { [key: string]: string | number },
  dates?: Array<Date>
) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 59)
  const date = dates && dates.length === 2 ? [...dates] : [today, todayEnd]
  
  // Build where conditions
  const whereConditions: any = {
    ...where,
    create_time: {
      [sequelize.Op.between]: [...date]
    }
  }
  
  // Build WHERE clause dynamically
  const Op = sequelize.Op
  let whereSql = '1=1'
  const replacements: any = {}
  let paramIndex = 0
  
  // Handle all where conditions
  for (const [field, value] of Object.entries(whereConditions)) {
    if (field === 'create_time' && value && typeof value === 'object' && value[Op.between]) {
      whereSql += ' AND "create_time" BETWEEN :date_start AND :date_end'
      replacements.date_start = value[Op.between][0]
      replacements.date_end = value[Op.between][1]
    } else if (value !== undefined && value !== null) {
      const paramName = `param_${paramIndex++}`
      whereSql += ` AND "${field}" = :${paramName}`
      replacements[paramName] = value
    }
  }
  
  // Use raw query to cast VARCHAR to numeric for SUM in PostgreSQL
  const [results] = await cashbackMysql.sequelize.query(`
    SELECT COALESCE(SUM(CAST("${key}" AS DECIMAL)), 0) as sum_value
    FROM "${cashbackMysql.tableName}"
    WHERE ${whereSql}
  `, {
    replacements
  })

  const amount = results && results[0] ? parseFloat((results[0] as any).sum_value || '0') : 0

  return {
    [key]: amount
  }
}

export default {
  addCashback,
  getCashback,
  delCashback,
  editCashback,
  getCashbackInfo,
  getUserCashbackAmount
}
