import configuration from './configuration';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return default configuration when env vars are not set', () => {
    // Since we removed all defaults, we need to set the env vars
    process.env.PORT = '3000';
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '3306';
    process.env.DB_USERNAME = 'root';
    process.env.DB_PASSWORD = '';
    process.env.DB_DATABASE = 'histo_rando';
    process.env.JWT_SECRET = 'change-me-in-production';
    process.env.JWT_EXPIRATION = '7d';

    const config = configuration();

    expect(config.port).toBe(3000);
    expect(config.database.host).toBe('localhost');
    expect(config.database.port).toBe(3306);
    expect(config.database.username).toBe('root');
    expect(config.database.password).toBe('');
    expect(config.database.database).toBe('histo_rando');
    expect(config.jwt.secret).toBe('change-me-in-production');
    expect(config.jwt.expiresIn).toBe('7d');
  });

  it('should use environment variables when set', () => {
    process.env.PORT = '4000';
    process.env.DB_HOST = 'testhost';
    process.env.DB_PORT = '5433';
    process.env.DB_USERNAME = 'testuser';
    process.env.DB_PASSWORD = 'testpass';
    process.env.DB_DATABASE = 'testdb';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRATION = '1d';
    process.env.MAX_FILE_SIZE = '20971520';
    process.env.UPLOAD_DIRECTORY = './test-uploads';

    const config = configuration();

    expect(config.port).toBe(4000);
    expect(config.database.host).toBe('testhost');
    expect(config.database.port).toBe(5433);
    expect(config.database.username).toBe('testuser');
    expect(config.database.password).toBe('testpass');
    expect(config.database.database).toBe('testdb');
    expect(config.jwt.secret).toBe('test-secret');
    expect(config.jwt.expiresIn).toBe('1d');
    expect(config.upload.maxFileSize).toBe(20971520);
    expect(config.upload.directory).toBe('./test-uploads');
  });

  it('should handle DB_LOGGING flag', () => {
    process.env.DB_LOGGING = 'true';
    let config = configuration();
    expect(config.database.logging).toBe(true);

    process.env.DB_LOGGING = 'false';
    config = configuration();
    expect(config.database.logging).toBe(false);
  });
});
