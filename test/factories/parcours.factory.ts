import {
  CreateParcoursDto,
  UpdateParcoursDto,
} from '../../src/modules/parcours/dto/parcours.dto';

let parcoursCounter = 0;

export const createParcoursData = (
  overrides: Partial<CreateParcoursDto> = {},
): CreateParcoursDto => {
  const counter = ++parcoursCounter;

  return {
    name: `Parcours ${counter}`,
    description: `Description for parcours ${counter}`,
    distanceKm: 5.5 + counter * 0.5,
    estimatedDuration: 150, // in minutes
    difficultyLevel: 'medium',
    startingPointLat: 49.182863,
    startingPointLon: -0.370679,
    isPmrAccessible: false,
    isActive: true,
    historicalTheme: 'D-Day Landing',
    ...overrides,
  };
};

export const createEasyParcours = (
  overrides: Partial<CreateParcoursDto> = {},
): CreateParcoursDto => {
  return createParcoursData({
    difficultyLevel: 'easy',
    distanceKm: 3.0,
    estimatedDuration: 90,
    isPmrAccessible: true,
    ...overrides,
  });
};

export const createHardParcours = (
  overrides: Partial<CreateParcoursDto> = {},
): CreateParcoursDto => {
  return createParcoursData({
    difficultyLevel: 'hard',
    distanceKm: 12.0,
    estimatedDuration: 300,
    isPmrAccessible: false,
    ...overrides,
  });
};

export const createPmrAccessibleParcours = (
  overrides: Partial<CreateParcoursDto> = {},
): CreateParcoursDto => {
  return createParcoursData({
    isPmrAccessible: true,
    difficultyLevel: 'easy',
    ...overrides,
  });
};

export const createInactiveParcours = (
  overrides: Partial<CreateParcoursDto> = {},
): CreateParcoursDto => {
  return createParcoursData({
    isActive: false,
    ...overrides,
  });
};

export const createParcoursArray = (
  count: number,
  overrides: Partial<CreateParcoursDto> = {},
): CreateParcoursDto[] => {
  return Array.from({ length: count }, () => createParcoursData(overrides));
};

export const createUpdateParcoursData = (
  overrides: Partial<UpdateParcoursDto> = {},
): UpdateParcoursDto => {
  return {
    name: 'Updated Parcours Name',
    description: 'Updated description',
    ...overrides,
  };
};
