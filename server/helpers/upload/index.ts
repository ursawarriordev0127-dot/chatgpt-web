import { alioss } from './alioss'
import { lsky } from './lsky'
import { local } from './local'
import { tencent } from './tencent'
import { up } from './up'
import { filterObjectNull, httpBody } from '../../utils'
import { uploadRecordModel } from '../../models'
import operateFile from './operateFile'

async function upload(file, options, extra = { user_id: '' }) {
  let result: { [key: string]: any } = {}
  const fileInfo = operateFile(file)
  const uploadInfo = await uploadRecordModel.getUploadRecordOne({
    sha1: fileInfo.sha1,
    md5: fileInfo.md5,
    status: 1
  })

  if (uploadInfo) {
    return httpBody(
      0,
      {
        ...fileInfo,
        ...uploadInfo
      },
      'Upload successful'
    )
  }

  if (options.type === 'local') {
    result = await local(file, options)
  }
  if (options.type === 'lsky') {
    result = await lsky(file, options)
  }
  if (options.type === 'tencent') {
    result = await tencent(file, options)
  }
  if (options.type === 'alioss') {
    result = await alioss(file, options)
  }
  if (options.type === 'alioss') {
    result = await alioss(file, options)
  }
  if (options.type === 'upyun') {
    result = await up(file, options)
  }

  if (Object.keys(result).length > 0 && !result.code) {
    // Store the uploaded image here
    const { data } = result
    await uploadRecordModel.addUploadRecord(
      filterObjectNull({
        user_id: extra.user_id,
        mimetype: data.mimetype,
        sha1: data.sha1,
        md5: data.md5,
        url: data.url,
        originalname: data.originalname,
        name: data.fileName,
        size: data.size,
        type: options.type,
        status: 1
      })
    )
    return result
  } else {
    return httpBody(-1, [], 'Storage strategy error')
  }
}

export default upload
