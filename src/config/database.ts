import mongoose from "mongoose";
import { MONGODB_URI } from "../util/secrets";

/**
 * MongoDB / Mongoose connection management.
 *
 * Removed deprecated options: `autoReconnect`, `keepAlive`.
 * Mongoose 5.2+ handles reconnection internally via the unified topology;
 * these legacy options are silently ignored and removed to avoid confusion.
 * `useNewUrlParser` and `useUnifiedTopology` enable the new driver
 * connection engine which is required for Mongoose 6+ compatibility.
 */
export function connectDatabase(): void {
  const connection = mongoose.connection;

  connection.on("connected", () => {
    console.log("Mongo Connection Established");
  });

  connection.on("disconnected", () => {
    console.log("Mongo Connection Disconnected");
  });

  connection.on("close", () => {
    console.log("Mongo Connection Closed");
  });

  connection.on("error", (error: Error) => {
    console.log("Mongo Connection ERROR: " + error);
  });
}

export async function startDatabase(): Promise<void> {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
  } as mongoose.ConnectionOptions);
}
