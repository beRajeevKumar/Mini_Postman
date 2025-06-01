import { MikroORM } from "@mikro-orm/sqlite";
import config from "./mikro-orm.config.js";

let orm;
let ormInitializationPromise = null;

async function initializeOrm() {
  console.log("MikroORM: Attempting ORM initialization...");
  try {
    console.log("MikroORM: Using config with dbName:", config.dbName);
    const newOrmInstance = await MikroORM.init(config);
    console.log("MikroORM: ORM Core Initialized.");

    if (!newOrmInstance.isConnected()) {
      console.log("MikroORM: Connecting ORM explicitly...");
      await newOrmInstance.connect();
      console.log("MikroORM: ORM Connected.");
    } else {
      console.log("MikroORM: ORM already connected after init.");
    }

    const generator = newOrmInstance.getSchemaGenerator();
    console.log(
      "MikroORM: Checking/Updating schema (this runs on cold starts)..."
    );
    await generator.updateSchema({
      safe: true,
      dropTables: false,
    });
    console.log("MikroORM: Schema checked/updated successfully.");
    return newOrmInstance;
  } catch (initError) {
    console.error(
      "!!! MikroORM: CRITICAL ERROR during ORM initialization or schema update !!!"
    );
    console.error("Error Name:", initError.name);
    console.error("Error Message:", initError.message);
    console.error("Error Stack:", initError.stack);
    if (config) {
      console.error("MikroORM Config dbName attempted:", config.dbName);
    }
    ormInitializationPromise = null;
    throw initError;
  }
}

export async function getORM() {
  if (!orm || !orm.isConnected()) {
    if (!ormInitializationPromise) {
      console.log(
        "MikroORM: No active ORM instance or promise, starting new initialization."
      );
      ormInitializationPromise = initializeOrm();
    } else {
      console.log(
        "MikroORM: Waiting for ongoing ORM initialization to complete."
      );
    }

    try {
      orm = await ormInitializationPromise;
      console.log("MikroORM: ORM ready for use (initialization successful).");
    } catch (e) {
      console.error(
        "MikroORM: getORM caught an error from the initialization promise. ORM is not available."
      );
      throw e;
    }
  }
  return orm;
}

export async function getEM() {
  try {
    const currentOrm = await getORM();
    if (!currentOrm) {
      console.error(
        "!!! MikroORM: getORM returned null/undefined unexpectedly, cannot fork EntityManager !!!"
      );
      throw new Error("ORM instance is not available after getORM call.");
    }
    return currentOrm.em.fork();
  } catch (error) {
    console.error("!!! MikroORM: Failed to get EntityManager !!!");
    console.error("Error during getEM:", error.message);
    if (
      error.message.includes("ORM instance is not available") ||
      error.message.includes("initialization")
    ) {
      throw new Error(
        "Database service is currently initializing or unavailable. Please try again shortly."
      );
    }
    throw new Error(
      "Database service unavailable due to EntityManager failure."
    );
  }
}
