import { Parcours } from '@/modules/parcours/entities/parcours.entity';

export const createMockParcours = (overrides = {}) =>
  ({
    id: 1,
    name: 'Chemin du Débarquement',
    description: 'Parcours historique le long des plages du débarquement',
    difficultyLevel: 'medium',
    distanceKm: 12.5,
    estimatedDuration: 180,
    isPmrAccessible: true,
    isActive: true,
    historicalTheme: 'D-Day 1944',
    startingPointLat: 49.3394,
    startingPointLon: -0.8566,
    endingPointLat: 49.35,
    endingPointLon: -0.87,
    gpxFileUrl: 'https://example.com/gpx/parcours1.gpx',
    mapImageUrl: 'https://example.com/maps/parcours1.jpg',
    thumbnailUrl: 'https://example.com/thumbnails/parcours1.jpg',
    creationDate: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    save: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockImplementation(function (this: any, values: any) {
      Object.assign(this, values);
      return Promise.resolve(this);
    }),
    destroy: jest.fn().mockResolvedValue(undefined),
    reload: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  }) as unknown as Parcours;

export const mockParcours = createMockParcours();

export const mockParcours2 = {
  id: 2,
  name: 'Route des Bunkers',
  description: "Découverte des fortifications du Mur de l'Atlantique",
  difficultyLevel: 'hard',
  distanceKm: 18.3,
  estimatedDuration: 240,
  isPmrAccessible: false,
  isActive: true,
  historicalTheme: 'Fortifications',
  startingPointLat: 49.4,
  startingPointLon: -0.9,
  endingPointLat: 49.42,
  endingPointLon: -0.93,
  gpxFileUrl: 'https://example.com/gpx/parcours2.gpx',
  mapImageUrl: 'https://example.com/maps/parcours2.jpg',
  thumbnailUrl: 'https://example.com/thumbnails/parcours2.jpg',
  creationDate: new Date('2025-01-02'),
  updatedAt: new Date('2025-01-02'),
  save: jest.fn().mockResolvedValue(undefined),
  update: jest.fn().mockResolvedValue(undefined),
  destroy: jest.fn().mockResolvedValue(undefined),
  reload: jest.fn().mockResolvedValue(undefined),
} as unknown as Parcours;
