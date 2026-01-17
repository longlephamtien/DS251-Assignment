import { registerAs } from '@nestjs/config';
import * as fs from 'fs';

export default registerAs('database', () => {
	const host = process.env.DB_HOST;
	const port = parseInt(process.env.DB_PORT ?? '14127', 10);
	const username = process.env.DB_USERNAME;
	const password = process.env.DB_PASSWORD;
	const database = process.env.DB_NAME;

	const caPath = process.env.AIVEN_SSL_CA_PATH;
	let ca: string | undefined;
	if (caPath) {
		try {
			ca = fs.readFileSync(caPath).toString();
		} catch (e) {
		}
	}
	if (!ca) {
		ca = process.env.AIVEN_SSL_CA;
	}

	return {
		host,
		port,
		username,
		password,
		database,
		ca,
	};
});


