const { TsMorphMetadataProvider } = require("@mikro-orm/reflection");
const { SqliteDriver } = require("@mikro-orm/sqlite");
const { RequestHistorySchema } = require("./entities/RequestHistory.entity.js");

module.exports = {
  metadataProvider: TsMorphMetadataProvider,
  entities: [RequestHistorySchema],
  dbName: "rest_client_history.sqlite3",
  driver: SqliteDriver,
  debug: process.env.NODE_ENV === "development",
  migrations: {
    path: "./migrations",
    tableName: "mikro_orm_migrations",
    transactional: true,
    disableForeignKeys: true,
    allOrNothing: true,
    dropTables: true,
    safe: false,
    emit: "js",
  },
  seeder: {
    path: "./seeders",
    defaultSeeder: "DatabaseSeeder",
    glob: "!(*.d).{js,ts}",
  },
  pool: {
    afterCreate: (conn, cb) => {
      conn.run("PRAGMA journal_mode = WAL;", () => {
        conn.run("PRAGMA foreign_keys = ON;", cb);
      });
    },
  },

  schemaGenerator: {
    disableForeignKeys: false,
    createForeignKeyConstraints: true,
  },
};
