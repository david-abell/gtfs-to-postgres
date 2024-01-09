import "dotenv/config";
import { consola } from "consola";
import { temporaryDirectory } from "tempy";
import { downloadFiles } from "./download.js";
import { parseAndStreamCSV } from "./parseAndStreamCSV.js";

import { readFileSync, existsSync } from "fs";
import pgClientPool from "./pgClientPool.js";
import { PoolClient } from "pg";
import { resolveFilePath } from "./utils.js";
import { rimraf } from "rimraf";

const FILE_IMPORT_ORDER = [
  "agency.txt",
  "calendar.txt",
  "calendar_dates.txt",
  "routes.txt",
  "shapes.txt",
  "trips.txt",
  "stops.txt",
  "stop_times.txt",
];

async function main() {
  let exitCode = 0;
  const downloadDir = temporaryDirectory();
  let pgClient: PoolClient | undefined;

  try {
    const { lastModified, expires } = await downloadFiles(downloadDir);

    const t0 = performance.now();
    pgClient = await pgClientPool.connect();

    const shouldUpdate = await compareLastUpdates(pgClient, lastModified);

    if (!shouldUpdate) {
      consola.info("Database is still current. Skipping update...");
      return;
    }

    await prepareFreshDB(pgClient);

    for (const file of FILE_IMPORT_ORDER) {
      await parseAndStreamCSV(`${downloadDir}/${file}`, pgClient);
    }

    const t1 = performance.now();

    await finalizeTables(pgClient);
    await updateApiLogOnSuccess(pgClient, [lastModified, expires]);

    consola.info(`Importing files took ${(t1 - t0) / 1000} seconds.`);
  } catch (error) {
    exitCode = 1;

    if (error instanceof Error) {
      consola.error(error.message);
    } else {
      consola.error("There was an unknown error.");
    }
  } finally {
    await cleanupTempFiles(downloadDir);

    pgClient?.release();
    await pgClientPool.end();

    process.exit(exitCode);
  }
}

main();

async function compareLastUpdates(pgClient: PoolClient, lastModified: string) {
  const sql = "SELECT MAX(expires) from api_update_log;";

  const lastUpdateLog = await pgClient.query<{ max: string }>(sql);

  if (lastUpdateLog.rows[0]?.max) {
    const currentUpdate = new Date(lastModified).getTime();
    const lastUpdate = new Date(lastUpdateLog.rows[0].max).getTime();
    return currentUpdate > lastUpdate;
  }

  return true;
}

type ApiUpdateLogValues = [string, string];

async function updateApiLogOnSuccess(
  pgClient: PoolClient,
  apiUpdateLogValues: ApiUpdateLogValues
) {
  const isSuccess = await pgClient.query<{ exists: boolean }>(
    `select exists (select 1 from stop_time);`
  );

  if (!isSuccess || !isSuccess.rows[0]?.exists) {
    throw new Error(
      "Update not successful. No existing rows found when Querying table 'stop_time'."
    );
  }

  const apiUpdateSql = `insert into api_update_log (last_modified_date, expires) 
    values($1, $2) returning *;`;

  await pgClient.query(apiUpdateSql, apiUpdateLogValues);
}

async function prepareFreshDB(pgClient: PoolClient) {
  const sql = readFileSync(resolveFilePath("./sql/seedTables.sql"), "utf8");
  try {
    await pgClient.query(sql);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error seeding database: ${error.message}`);
    }
    throw new Error(`There was an unknown error while seeding the database.`);
  }
}

async function finalizeTables(pgClient: PoolClient) {
  const relations = readFileSync(
    resolveFilePath("./sql/setRelations.sql"),
    "utf8"
  );
  const indexes = readFileSync(resolveFilePath("./sql/setIndexes.sql"), "utf8");

  try {
    await pgClient.query(relations);
    await pgClient.query(indexes);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error setting relations or indexes: ${error.message}`);
    }
    throw new Error(
      `There was an unknown error while setting relations and indexes.`
    );
  }
}

async function cleanupTempFiles(filepath: string) {
  if (existsSync(filepath)) {
    consola.info("Deleting temp files...");
    await rimraf(filepath);
    consola.success("Finished deleting temp files.");
  }
}
