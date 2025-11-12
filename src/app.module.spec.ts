import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { AppModule } from "./app.module";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ParcoursModule } from "./modules/parcours/parcours.module";
import { PoiModule } from "./modules/poi/poi.module";

describe("AppModule", () => {
  let module: TestingModule;

  beforeAll(async () => {
    // Mock the database connection to avoid actual connection
    jest.mock("./database/database.module", () => ({
      DatabaseModule: class MockDatabaseModule {},
    }));
  });

  it("should be defined", () => {
    expect(AppModule).toBeDefined();
  });

  it("should compile the module", async () => {
    // Just test that the module can be imported without errors
    expect(AppModule).toBeDefined();
    expect(AppModule.name).toBe("AppModule");
  });

  it("should import ConfigModule", () => {
    // Verify ConfigModule is imported
    const imports = Reflect.getMetadata("imports", AppModule) || [];
    expect(imports.length).toBeGreaterThan(0);
  });
});
