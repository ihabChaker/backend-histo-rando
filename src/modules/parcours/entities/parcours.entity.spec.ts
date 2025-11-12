import { Parcours } from './parcours.entity';

describe('Parcours Entity', () => {
  it('should be defined', () => {
    expect(Parcours).toBeDefined();
  });

  it('should have correct name', () => {
    expect(Parcours.name).toBe('Parcours');
  });
});
