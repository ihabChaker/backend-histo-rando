export default () => ({
  port: parseInt(process.env.PORT!, 10),
  database: {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!, 10),
    username: process.env.DB_USERNAME!,
    password: String(process.env.DB_PASSWORD!),
    database: process.env.DB_DATABASE!,
    logging: process.env.DB_LOGGING === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRATION!,
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE!, 10),
    directory: process.env.UPLOAD_DIRECTORY!,
  },
});
