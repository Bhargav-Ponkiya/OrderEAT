import "dotenv/config";
import { createApp } from "./app.js";
import { connectDb } from "./db.js";
import { ensureMenuSeeded } from "./services/menu.service.js";

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is required. Copy .env.example to .env and set it.");
    process.exit(1);
  }

  await connectDb(uri);
  console.info("✓ Connected to MongoDB");

  await ensureMenuSeeded();
  console.info("✓ Menu seeded (if needed)");

  const port = Number(process.env.PORT ?? 4000);
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const app = createApp({ allowedOrigins });
  app.listen(port, () => {
    console.info(`✓ Server listening on http://localhost:${port}`);
    console.info(`  Allowed origins: ${allowedOrigins.join(", ")}`);
  });
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
