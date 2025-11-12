import aliOss from 'ali-oss'
import operateFile from './operateFile';
import { httpBody } from '../../utils';

export async function alioss(file, { region, bucket, access_key_id, access_key_secret }){
	const fileInfo = operateFile(file)
	const client = new aliOss({
		// Fill in the region where the Bucket is located. For example, for East China 1 (Hangzhou), Region should be oss-cn-hangzhou.
		region:region,
		// Alibaba Cloud account AccessKey has access to all APIs, which is very risky. It is strongly recommended that you create and use a RAM user for API access or daily operations. Please log in to the RAM console to create a RAM user.
		accessKeyId: access_key_id,
		accessKeySecret: access_key_secret,
		// Fill in the Bucket name.
		bucket: bucket,
	});

	const result = await client.put(fileInfo.fileName, fileInfo.buffer)
	if(!result?.url){
		return httpBody(500, {}, 'Upload failed')
	}
	return httpBody(0, {
		...fileInfo,
		url: result.url
	}, 'Upload successful')
}

export default alioss;
