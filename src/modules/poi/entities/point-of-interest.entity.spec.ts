import { PointOfInterest } from './point-of-interest.entity';

describe('PointOfInterest Entity', () => {
  it('should be defined', () => {
    expect(PointOfInterest).toBeDefined();
  });

  it('should have correct name', () => {
    expect(PointOfInterest.name).toBe('PointOfInterest');
  });
});
