/**
 * App configuration from environment variables.
 * Database name: mylmsdoors
 */

function getEnvOptional(key: string, fallback: string): string {
  return process.env[key] ?? fallback
}

export const config = {
  /** MongoDB connection URI. Must include database name or it will use default. */
  get mongodbUri(): string {
    return getEnvOptional("MONGODB_URI", "mongodb://localhost:27017/mylmsdoors")
  },

  /** Database name used for MongoDB (mylmsdoors). */
  get databaseName(): string {
    return getEnvOptional("MONGODB_DATABASE", "mylmsdoors")
  },

  get nodeEnv(): string {
    return getEnvOptional("NODE_ENV", "development")
  },

  get isDev(): boolean {
    return this.nodeEnv === "development"
  },
} as const
