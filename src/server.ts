import { createApp, registerErrorMiddleware } from "./config/express";
import { registerRoutes } from "./config/routes";
import { connectDatabase, startDatabase } from "./config/database";

const app = createApp();

registerRoutes(app);
registerErrorMiddleware(app);

connectDatabase();
startDatabase().catch((error) => {
  console.error("Failed to connect to MongoDB:", error);
});

const port = app.get("port");
app.listen(port, () => {
  console.log("  API is running at http://localhost:%d", port);
});
