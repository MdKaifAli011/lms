import mongoose from "mongoose"
import { config } from "@/config"

const MONGODB_URI = config.mongodbUri
const DATABASE_NAME = config.databaseName

type CachedMongoose = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }

declare global {
  // eslint-disable-next-line no-var
  var mongoose: CachedMongoose | undefined
}

let cached: CachedMongoose
if (!global.mongoose) {
  cached = global.mongoose = { conn: null, promise: null }
} else {
  cached = global.mongoose
}

async function connectDB(): Promise<void> {
  if (cached.conn) {
    return
  }
  if (!cached.promise) {
    const opts = { dbName: DATABASE_NAME }
    cached.promise = mongoose.connect(MONGODB_URI, opts)
  }
  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }
}

export default connectDB
