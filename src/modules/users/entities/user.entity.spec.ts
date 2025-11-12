import { User } from './user.entity';

describe('User Entity', () => {
  it('should be defined', () => {
    expect(User).toBeDefined();
  });

  it('should have correct name', () => {
    expect(User.name).toBe('User');
  });
});
