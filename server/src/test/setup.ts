import { afterAll, beforeAll, beforeEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { ensureMenuSeeded } from "../services/menu.service.js";
import { _clearAllTimersForTests } from "../status-scheduler.js";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

beforeEach(async () => {
  _clearAllTimersForTests();
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key]?.deleteMany({});
  }
  await ensureMenuSeeded();
});

afterAll(async () => {
  _clearAllTimersForTests();
  await mongoose.disconnect();
  await mongod.stop();
});
