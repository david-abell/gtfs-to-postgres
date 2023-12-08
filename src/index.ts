// ESM
import { consola } from "consola";
import { temporaryDirectory } from "tempy";
import { rename } from "fs/promises";
import { exec } from "child_process";
import { downloadFiles } from "./download";
import { importFile } from "./importFile";

import { existsSync, mkdirSync } from "fs";
import prisma from "./client";

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
  const downloadDir = "./tmp";
  // const downloadDir = temporaryDirectory();
  // await downloadFiles(downloadDir);
  // await archiveDB();
  await prepareFreshDB();

  const t0 = performance.now();

  console.profile();
  for (const file of FILE_IMPORT_ORDER) {
    await importFile(`${downloadDir}/${file}`);
  }

  const t1 = performance.now();
  consola.info(`Importing files took ${(t1 - t0) / 1000} seconds.`);
  console.profileEnd();
}

main();

async function archiveDB() {
  // move old gtfs.db to backup dir
  const backupFileName = `gtfs_${new Date().toJSON().slice(0, 10)}.db`;
  const today = backupFileName;

  const dbLocation = "./prisma/gtfs.db";
  const backupLocation = "./prisma/backup/";

  if (!existsSync(backupLocation)) {
    mkdirSync(backupLocation);
  }
  if (existsSync(dbLocation)) {
    consola.info(`Backing up previous DB to ./prisma/backup/${backupFileName}`);
    try {
      await rename(dbLocation, `${backupLocation}${today}`);
      consola.success("Completed backing up database");
    } catch (error) {
      if (error instanceof Error) {
        consola.error(error.message);
      }
    }
  }
}

async function prepareFreshDB() {
  try {
    await prisma.$queryRaw`
      DROP TABLE IF EXISTS agency,
        calendar,
        calendar_date,
        route,
        shape,
        stop,
        stop_time,
        trip;
      `;

    await new Promise((resolve, reject) => {
      exec("npx prisma db push", (error, stdout, stderr) => {
        if (error || stderr) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  } catch (error) {
    if (error instanceof Error) {
      consola.error(error.message);
    }
  }
}
