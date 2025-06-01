import { MikroORM } from "@mikro-orm/sqlite";
import config from "./mikro-orm.config.js";

let orm;

export async function getORM() {
  if (!orm) {
    console.log("MikroORM: Initializing ORM...");
    orm = await MikroORM.init(config);
    console.log("MikroORM: ORM Initialized.");

    if (process.env.NODE_ENV === "development") {
      const generator = orm.getSchemaGenerator();
      try {
        console.log("MikroORM: Updating schema (if necessary)...");
        await generator.updateSchema({
          safe: true,
          dropTables: false,
        });
        console.log("MikroORM: Schema updated/checked.");
      } catch (error) {
        console.error("MikroORM: Error during automatic schema update:", error);
      }
    }
  } else {
    if (!orm.isConnected()) {
      console.log("MikroORM: Reconnecting ORM...");
      await orm.connect();
      console.log("MikroORM: ORM Reconnected.");
    }
  }
  return orm;
}

export async function getEM() {
  const currentOrm = await getORM();
  return currentOrm.em.fork();
}
