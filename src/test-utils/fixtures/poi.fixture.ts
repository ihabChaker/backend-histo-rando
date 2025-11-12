import { PointOfInterest } from "@/modules/poi/entities/point-of-interest.entity";

export const createMockPOI = (overrides = {}) =>
  ({
    id: 1,
    parcoursId: 1,
    name: "Bunker de Longues-sur-Mer",
    description: "Batterie côtière allemande préservée",
    latitude: 49.34,
    longitude: -0.86,
    poiType: "bunker",
    historicalDescription:
      "Construite en 1944, cette batterie contrôlait les approches maritimes",
    mediaUrls: ["https://example.com/photos/bunker1.jpg"],
    orderInParcours: 1,
    estimatedVisitTime: 30,
    isAccessiblePmr: true,
    audioGuideUrl: "https://example.com/audio/bunker1.mp3",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    save: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockImplementation(function (this: any, values: any) {
      Object.assign(this, values);
      return Promise.resolve(this);
    }),
    destroy: jest.fn().mockResolvedValue(undefined),
    reload: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  }) as unknown as PointOfInterest;

export const mockPOI = createMockPOI();

export const mockPOI2 = {
  id: 2,
  parcoursId: 1,
  name: "Mémorial de Colleville",
  description: "Cimetière américain",
  latitude: 49.342,
  longitude: -0.862,
  poiType: "memorial",
  historicalDescription:
    "Mémorial dédié aux soldats tombés lors du débarquement",
  mediaUrls: ["https://example.com/photos/memorial1.jpg"],
  orderInParcours: 2,
  estimatedVisitTime: 45,
  isAccessiblePmr: true,
  audioGuideUrl: "https://example.com/audio/memorial1.mp3",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  save: jest.fn().mockResolvedValue(undefined),
  update: jest.fn().mockResolvedValue(undefined),
  destroy: jest.fn().mockResolvedValue(undefined),
  reload: jest.fn().mockResolvedValue(undefined),
} as unknown as PointOfInterest;
