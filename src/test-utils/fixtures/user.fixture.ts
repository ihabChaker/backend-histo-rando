import { User } from "@/modules/users/entities/user.entity";

export const createMockUser = (overrides = {}) =>
  ({
    id: 1,
    username: "testuser",
    email: "test@example.com",
    passwordHash: "$2b$10$hashedpassword",
    firstName: "Test",
    lastName: "User",
    isPmr: false,
    totalPoints: 100,
    totalKm: 10.5,
    avatarUrl: "https://example.com/avatar.jpg",
    phoneNumber: "+33123456789",
    registrationDate: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    save: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockImplementation(function (this: any, values: any) {
      Object.assign(this, values);
      return Promise.resolve(this);
    }),
    destroy: jest.fn().mockResolvedValue(undefined),
    reload: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  }) as unknown as User;

export const mockUser = createMockUser();

export const mockUser2 = {
  id: 2,
  username: "anotheruser",
  email: "another@example.com",
  passwordHash: "$2b$10$anotherhashedpassword",
  firstName: "Another",
  lastName: "User",
  isPmr: true,
  totalPoints: 250,
  totalKm: 25.8,
  avatarUrl: null,
  phoneNumber: null,
  registrationDate: new Date("2025-01-05"),
  updatedAt: new Date("2025-01-05"),
  save: jest.fn().mockResolvedValue(undefined),
  update: jest.fn().mockResolvedValue(undefined),
  destroy: jest.fn().mockResolvedValue(undefined),
  reload: jest.fn().mockResolvedValue(undefined),
} as unknown as User;
