import { CreatePOIDto, UpdatePOIDto } from '../../src/modules/poi/dto/poi.dto';

let poiCounter = 0;

export const createPOIData = (
  parcoursId: number,
  overrides: Partial<CreatePOIDto> = {},
): CreatePOIDto => {
  const counter = ++poiCounter;

  return {
    parcoursId,
    name: `Point of Interest ${counter}`,
    description: `Historical point of interest ${counter}`,
    poiType: 'monument',
    latitude: 49.182863 + counter * 0.001,
    longitude: -0.370679 + counter * 0.001,
    orderInParcours: counter,
    historicalPeriod: 'World War II',
    imageUrl: `https://example.com/images/poi${counter}.jpg`,
    audioUrl: `https://example.com/audio/poi${counter}.mp3`,
    ...overrides,
  };
};

export const createMonumentPOI = (
  parcoursId: number,
  overrides: Partial<CreatePOIDto> = {},
): CreatePOIDto => {
  return createPOIData(parcoursId, {
    poiType: 'monument',
    ...overrides,
  });
};

export const createMemorialPOI = (
  parcoursId: number,
  overrides: Partial<CreatePOIDto> = {},
): CreatePOIDto => {
  return createPOIData(parcoursId, {
    poiType: 'memorial',
    ...overrides,
  });
};

export const createBunkerPOI = (
  parcoursId: number,
  overrides: Partial<CreatePOIDto> = {},
): CreatePOIDto => {
  return createPOIData(parcoursId, {
    poiType: 'bunker',
    ...overrides,
  });
};

export const createMuseumPOI = (
  parcoursId: number,
  overrides: Partial<CreatePOIDto> = {},
): CreatePOIDto => {
  return createPOIData(parcoursId, {
    poiType: 'museum',
    ...overrides,
  });
};

export const createPOIArray = (
  parcoursId: number,
  count: number,
  overrides: Partial<CreatePOIDto> = {},
): CreatePOIDto[] => {
  return Array.from({ length: count }, (_, index) =>
    createPOIData(parcoursId, { orderInParcours: index + 1, ...overrides }),
  );
};

export const createUpdatePOIData = (
  overrides: Partial<UpdatePOIDto> = {},
): UpdatePOIDto => {
  return {
    name: 'Updated POI Name',
    description: 'Updated description',
    ...overrides,
  };
};
