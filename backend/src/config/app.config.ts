export default () => ({
	NODE_ENV: process.env.NODE_ENV || 'development',
	PORT: parseInt(process.env.PORT ?? '8000', 10),
});

