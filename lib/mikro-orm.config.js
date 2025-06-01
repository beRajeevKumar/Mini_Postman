const { TsMorphMetadataProvider } = require("@mikro-orm/reflection");
const { SqliteDriver } = require("@mikro-orm/sqlite");
const { RequestHistorySchema } = require("./entities/RequestHistory.entity.js");
const path = require("path");

const isVercel = process.env.VERCEL === "1";

module.exports = {
  metadataProvider: TsMorphMetadataProvider,
  entities: [RequestHistorySchema],
  dbName: isVercel
    ? path.join("/tmp", "rest_client_history.sqlite3")
    : "rest_client_history.sqlite3",
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
  driverOptions: {
    connection: {
      filename: isVercel
        ? path.join("/tmp", "rest_client_history.sqlite3")
        : "rest_client_history.sqlite3",
    },
  },
  cache: {
    enabled: !isVercel,
    pretty: true,
    adapter: require("fs"),
    options: {
      cacheDir: isVercel
        ? "/tmp/mikro-orm-cache"
        : process.cwd() + "/temp/mikro-orm-cache",
    },
  },
};
