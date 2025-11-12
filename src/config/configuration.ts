export default () => ({
  port: parseInt(process.env.PORT || "3000", 10) || 3000,
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10) || 5432,
    username: process.env.DB_USERNAME || "historando",
    password: String(process.env.DB_PASSWORD || "historando_password"),
    database: process.env.DB_DATABASE || "historando_db",
    logging: process.env.DB_LOGGING === "true",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "change-me-in-production",
    expiresIn: process.env.JWT_EXPIRATION || "7d",
  },
  upload: {
    maxFileSize:
      parseInt(process.env.MAX_FILE_SIZE || "10485760", 10) || 10485760,
    directory: process.env.UPLOAD_DIRECTORY || "./uploads",
  },
});
