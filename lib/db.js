// lib/db.js
import { MikroORM } from "@mikro-orm/sqlite";
import config from "./mikro-orm.config.js";

let orm; // This will hold the successfully initialized ORM instance
let ormInitializationPromise = null; // This promise will manage ongoing initialization

async function initializeOrm() {
  // This function should only be called if ormInitializationPromise is null
  console.log("MikroORM: Attempting ORM initialization...");
  try {
    // The config now correctly uses /tmp/ for dbName on Vercel
    console.log("MikroORM: Using config with dbName:", config.dbName);
    const newOrmInstance = await MikroORM.init(config);
    console.log("MikroORM: ORM Core Initialized.");

    // MikroORM.init() should connect by default, but an explicit check/connect is fine.
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
    // This will attempt to create/update the schema in /tmp/rest_client_history.sqlite3 on Vercel
    await generator.updateSchema({
      safe: true, // Try to produce safe schema changes, don't drop data unexpectedly
      dropTables: false, // Don't drop tables unless absolutely necessary based on entity changes
    });
    console.log("MikroORM: Schema checked/updated successfully.");
    return newOrmInstance; // Return the successfully initialized instance
  } catch (initError) {
    console.error(
      "!!! MikroORM: CRITICAL ERROR during ORM initialization or schema update !!!"
    );
    console.error("Error Name:", initError.name);
    console.error("Error Message:", initError.message);
    console.error("Error Stack:", initError.stack);
    if (config) {
      // Log the dbName that was attempted, crucial for debugging path issues
      console.error("MikroORM Config dbName attempted:", config.dbName);
    }
    ormInitializationPromise = null; // Reset the promise on failure to allow another attempt
    throw initError; // Re-throw to indicate failure to the caller
  }
}

export async function getORM() {
  if (!orm || !orm.isConnected()) {
    // If no ORM instance or it's disconnected
    if (!ormInitializationPromise) {
      // If no initialization is currently in progress, start one
      console.log(
        "MikroORM: No active ORM instance or promise, starting new initialization."
      );
      ormInitializationPromise = initializeOrm();
    } else {
      // If an initialization is already in progress, log that we're waiting
      console.log(
        "MikroORM: Waiting for ongoing ORM initialization to complete."
      );
    }

    try {
      orm = await ormInitializationPromise; // Wait for the initialization (new or ongoing)
      console.log("MikroORM: ORM ready for use (initialization successful).");
      // Once successfully initialized and 'orm' is set, clear the promise
      // so that future checks on '!orm' correctly trigger a re-evaluation if 'orm' somehow gets disconnected.
      // However, if 'orm' is now valid, the outer 'if' condition won't be met on subsequent calls until 'orm' is disconnected.
      // For simplicity, we can keep ormInitializationPromise until orm is truly invalid again.
      // A better approach for serverless might be to re-evaluate connection more strictly.
    } catch (e) {
      // This means initializeOrm() threw an error
      console.error(
        "MikroORM: getORM caught an error from the initialization promise. ORM is not available."
      );
      // 'orm' will remain undefined or the old disconnected instance.
      // The promise was reset in initializeOrm's catch block.
      throw e; // rethrow the initialization error
    }
  }
  return orm; // Return the (hopefully) connected ORM instance
}

export async function getEM() {
  try {
    const currentOrm = await getORM(); // This will ensure ORM is initialized and connected
    if (!currentOrm) {
      // Should ideally not happen if getORM throws on critical failure
      console.error(
        "!!! MikroORM: getORM returned null/undefined unexpectedly, cannot fork EntityManager !!!"
      );
      throw new Error("ORM instance is not available after getORM call.");
    }
    return currentOrm.em.fork(); // Fork an EntityManager for the current request
  } catch (error) {
    // This catch block handles errors from getORM() or em.fork()
    console.error("!!! MikroORM: Failed to get EntityManager !!!");
    console.error("Error during getEM:", error.message);
    // Provide a user-friendly error message if the underlying issue was DB related
    if (
      error.message.includes("ORM instance is not available") ||
      error.message.includes("initialization")
    ) {
      throw new Error(
        "Database service is currently initializing or unavailable. Please try again shortly."
      );
    }
    throw new Error( // Generic fallback
      "Database service unavailable due to EntityManager failure."
    );
  }
}
