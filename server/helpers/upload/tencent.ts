import COS from 'cos-nodejs-sdk-v5'
import { NodeFile } from '../../type'
import operateFile from './operateFile'
import { httpBody } from '../../utils'

export async function tencent(file: NodeFile, { secret_id, secret_key, bucket, region }) {
	const fileInfo = operateFile(file)
	const cos = new COS({
		SecretId: secret_id,
		SecretKey: secret_key
	})

	const result = await cos.putObject({
		Bucket: bucket,
		Region: region,
		Key: fileInfo.fileName,
		Body: fileInfo.buffer
	})

	if (result.statusCode !== 200) {
		return httpBody(500, {}, 'Upload failed')
	}

	return httpBody(0, {
		...fileInfo,
		url: '//' + result.Location
	}, 'Upload successful')
}
