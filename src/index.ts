import "dotenv/config";
import { consola } from "consola";
import { temporaryDirectory } from "tempy";
import { downloadFiles } from "./download";
import { parseAndStreamCSV } from "./parseFile";

import { readFileSync } from "fs";
import pgClientPool from "./pgClientPool";
import { PoolClient } from "pg";
import { resolveFilePath } from "./utils";

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
  const downloadDir = temporaryDirectory();
  await downloadFiles(downloadDir);

  const t0 = performance.now();
  const pgClient = await pgClientPool.connect();

  try {
    await prepareFreshDB(pgClient);

    console.profile();
    for (const file of FILE_IMPORT_ORDER) {
      await parseAndStreamCSV(`${downloadDir}/${file}`, pgClient);
    }

    const t1 = performance.now();
    consola.info(`Importing files took ${(t1 - t0) / 1000} seconds.`);

    await finalizeTables(pgClient);
    console.profileEnd();
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.log("There was an unknown error.");
    }
    process.exit(1);
  } finally {
    pgClient.release();
  }

  await pgClientPool.end();
  process.exit(0);
}

main();

async function prepareFreshDB(pgClient: PoolClient) {
  const sql = readFileSync(resolveFilePath("./sql/seedTables.sql"), "utf8");
  try {
    await pgClient.query(sql);
  } catch (error) {
    if (error instanceof Error) {
      consola.error(`Error seeding database: ${error.message}`);
    }
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
      consola.error(`Error seeding database: ${error.message}`);
    }
  }
}
