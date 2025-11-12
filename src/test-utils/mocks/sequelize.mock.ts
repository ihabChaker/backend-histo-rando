// Mock Sequelize model factory
export const createMockModel = <T = any>() => {
  const mockInstance = {
    save: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    reload: jest.fn().mockResolvedValue(undefined),
  };

  return {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn(),
    mockInstance,
  };
};

// Mock Sequelize module
export const mockSequelize = {
  transaction: jest.fn().mockImplementation((callback) => {
    return callback({
      commit: jest.fn(),
      rollback: jest.fn(),
    });
  }),
};
