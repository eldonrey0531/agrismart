import { DatabaseConfig } from "@/types/database";

// Default database configuration
export const databaseConfig: DatabaseConfig = {
  url: process.env.DATABASE_URL!,
  logQueries: process.env.NODE_ENV !== "production",
  slowQueryThreshold: parseInt(process.env.DB_SLOW_QUERY_THRESHOLD || "1000"),
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || "10"),
  timeout: parseInt(process.env.DB_TIMEOUT || "5000"),
};

// Database environment validation
export function validateDatabaseConfig(): void {
  const requiredEnvVars = [
    "DATABASE_URL",
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(", ")}`
    );
  }

  if (!process.env.DATABASE_URL?.startsWith("postgresql://")) {
    throw new Error(
      "DATABASE_URL must be a valid PostgreSQL connection string"
    );
  }
}

// Connection options based on environment
export const connectionOptions = {
  development: {
    log: ["query", "error", "warn"],
    errorFormat: "pretty",
  },
  test: {
    log: ["error"],
    errorFormat: "minimal",
  },
  production: {
    log: ["error"],
    errorFormat: "minimal",
  },
}[process.env.NODE_ENV || "development"];

// Query logging options
export const queryLoggingOptions = {
  enabled: process.env.NODE_ENV !== "production",
  slowQueryThreshold: databaseConfig.slowQueryThreshold,
  logParameters: process.env.NODE_ENV === "development",
  logResults: false,
};

// Error formatting options
export const errorFormatOptions = {
  development: {
    colorize: true,
    truncate: 1000,
    includeStack: true,
  },
  test: {
    colorize: false,
    truncate: 200,
    includeStack: true,
  },
  production: {
    colorize: false,
    truncate: 100,
    includeStack: false,
  },
}[process.env.NODE_ENV || "development"];

// Pool configuration
export const poolConfig = {
  min: 2,
  max: databaseConfig.maxConnections,
  idle: 10000,
  acquire: databaseConfig.timeout,
  retry: {
    max: 3,
    timeout: 5000,
    match: [
      /deadlock detected/,
      /connection timeout/,
      /Connection terminated/,
    ],
  },
};

// Migration settings
export const migrationConfig = {
  directory: "./prisma/migrations",
  tableName: "_prisma_migrations",
  transactional: true,
  validateChecksums: true,
};

// Schema validation options
export const schemaValidationOptions = {
  validateAll: process.env.NODE_ENV !== "production",
  validateChecksums: true,
  validateForeignKeys: true,
  validateUniques: true,
};

// Export everything as a single configuration object
export const database = {
  config: databaseConfig,
  validate: validateDatabaseConfig,
  connection: connectionOptions,
  logging: queryLoggingOptions,
  errors: errorFormatOptions,
  pool: poolConfig,
  migrations: migrationConfig,
  validation: schemaValidationOptions,
};

export default database;