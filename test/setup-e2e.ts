// Load test environment variables
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.test file
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

// Set test environment
process.env.NODE_ENV = "test";

console.log("🧪 E2E Test Environment Setup");
console.log(`   Database: ${process.env.TEST_DB_NAME || "histo_rando_test"}`);
console.log(
  `   Host: ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}`
);
