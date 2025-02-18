import { DataSource } from "typeorm";
import AppDataSource from "../database.js";
import { MigrationGenerateCommand } from "typeorm/commands/MigrationGenerateCommand";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { existsSync, mkdirSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generateMigration = async () => {
  if (process.argv.length < 3) {
    console.error("Please provide a migration name");
    process.exit(1);
  }

  const migrationName = process.argv[2];
  const migrationsDir = join(__dirname, "..", "migrations");
  
  // Ensure migrations directory exists
  if (!existsSync(migrationsDir)) {
    mkdirSync(migrationsDir, { recursive: true });
  }
  
  try {
    await AppDataSource.initialize();
    
    const command = new MigrationGenerateCommand();
    await command.handler({
      name: migrationName,
      dir: migrationsDir,
      outputJs: false,
      pretty: true,
      dataSource: AppDataSource,
      timestamp: true,
      check: false,
      dryrun: false
    });
    
    await AppDataSource.destroy();
    
  } catch (error) {
    console.error("Error generating migration:", error);
    process.exit(1);
  }
};

generateMigration().catch(console.error);