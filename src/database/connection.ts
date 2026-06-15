import mongoose from "mongoose";
import { MONGODB_URI } from "../util/secrets";

/**
 * Connect to MongoDB using Mongoose 6+ recommended patterns.
 *
 * - `autoReconnect` and `keepAlive` are removed — they were deprecated
 *   starting with the MongoDB Node.js driver v4 / Mongoose 6.
 * - Mongoose now manages reconnection internally via `serverSelectionTimeoutMS`
 *   and the driver's built-in retry logic.
 * - For the *initial* connection we implement a simple exponential-backoff
 *   retry loop so the app can survive a brief Mongo outage during startup.
 */

const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 2000;

async function connectWithRetry(retriesLeft: number, delay: number): Promise<void> {
  try {
    // The options object is cast to `any` so the code is forward-compatible
    // with Mongoose 6+ (where serverSelectionTimeoutMS is a first-class option)
    // while still compiling against the current @types/mongoose 5.x.
    await mongoose.connect(MONGODB_URI as string, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    } as any);
    console.log("Mongo Connection Established");
  } catch (error) {
    if (retriesLeft <= 0) {
      console.error("Mongo Connection Failed after all retries:", error);
      throw error;
    }
    console.warn(
      `Mongo Connection failed — retrying in ${delay}ms (${retriesLeft} retries left)…`,
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
    return connectWithRetry(retriesLeft - 1, Math.min(delay * 2, 30000));
  }
}

export function setupConnectionEvents(): void {
  const conn = mongoose.connection;

  conn.on("disconnected", () => {
    console.log("Mongo Connection Disconnected — driver will auto-reconnect");
  });

  conn.on("reconnected", () => {
    console.log("Mongo Connection Re-established");
  });

  conn.on("close", () => {
    console.log("Mongo Connection Closed");
  });

  conn.on("error", (error: Error) => {
    console.error("Mongo Connection ERROR:", error);
  });
}

export async function connectDatabase(): Promise<void> {
  setupConnectionEvents();
  await connectWithRetry(MAX_RETRIES, INITIAL_DELAY_MS);
}
