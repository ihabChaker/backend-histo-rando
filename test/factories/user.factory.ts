import { RegisterDto } from "../../src/modules/auth/dto/auth.dto";

let userCounter = 0;

export const createRegisterData = (
  overrides: Partial<RegisterDto> = {}
): RegisterDto => {
  const timestamp = Date.now();
  const counter = ++userCounter;

  return {
    email: `user${timestamp}${counter}@example.com`,
    username: `user${timestamp}${counter}`,
    password: "SecurePassword123!",
    firstName: "John",
    lastName: "Doe",
    isPmr: false,
    ...overrides,
  };
};
export const createPmrUser = (
  overrides: Partial<RegisterDto> = {}
): RegisterDto => {
  return createRegisterData({
    isPmr: true,
    ...overrides,
  });
};

export const createUsersArray = (
  count: number,
  overrides: Partial<RegisterDto> = {}
): RegisterDto[] => {
  return Array.from({ length: count }, () => createRegisterData(overrides));
};
