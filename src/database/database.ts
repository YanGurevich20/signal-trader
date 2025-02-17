import "reflect-metadata";
import "dotenv/config";
import { DataSource, EntityTarget, ObjectLiteral, Repository } from "typeorm";

const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_POOLER_CONNECTION_STRING,
  synchronize: true,
  entities: ["src/database/entities/**/*.ts"],
  subscribers: [],
  migrations: [],
  ssl: {
    rejectUnauthorized: false,
  },
});

class Database {
  private static instance: Database;
  private dataSource: DataSource;
  private repositories: Map<string, Repository<any>> = new Map();
  private initialized: boolean = false;

  private constructor() {
    this.dataSource = AppDataSource;
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      try {
        await this.dataSource.initialize();
        this.initialized = true;
      } catch (error) {
        console.error("[Database] Connection failed:", error);
        throw error;
      }
    }
  }

  public async getRepository<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
  ): Promise<Repository<T>> {
    await this.ensureInitialized();

    // Get entity name to use as cache key
    const entityName =
      typeof entity === "function" ? entity.name : entity.toString();

    // Check if repository exists in cache
    if (!this.repositories.has(entityName)) {
      // If not in cache, create and store it
      const repository = this.dataSource.getRepository(entity);
      this.repositories.set(entityName, repository);
    }

    // Return cached repository
    return this.repositories.get(entityName) as Repository<T>;
  }
}

// Export a singleton instance
export const database = Database.getInstance();
