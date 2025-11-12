import { SetMetadata } from '@nestjs/common';
import { Public, IS_PUBLIC_KEY } from './public.decorator';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('Public Decorator', () => {
  it('should call SetMetadata with IS_PUBLIC_KEY and true', () => {
    Public();

    expect(SetMetadata).toHaveBeenCalledWith(IS_PUBLIC_KEY, true);
  });

  it('should have the correct IS_PUBLIC_KEY value', () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });
});
