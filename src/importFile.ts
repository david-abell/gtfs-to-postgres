import Papa from "papaparse";
import { createReadStream, existsSync } from "fs";
import consola from "consola";
import { clearLine, cursorTo } from "readline";
import prisma from "./client";
import {
  Agency,
  Calendar,
  CalendarDate,
  Prisma,
  Route,
  Shape,
  Stop,
  StopTime,
  Trip,
} from "@prisma/client";
import { basename, extname } from "path";
import { FormattedLines, formatLine } from "./utils";
import { ModelWithoutId, SnakeCaseModel } from "../prisma/models";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// prisma.$on("query", (e: Prisma.QueryEvent) => {
//   // console.log("Query: " + e.query);
//   totalQueryTime += e.duration;
//   console.log("Query duration: " + e.duration + "ms");
// });

const BATCH_SIZE = 32_000;
const MAX_TABLE_HEADER_COUNT = 12;

export async function importFile(filePath: string) {
  const extension = extname(filePath);
  const fileName = basename(filePath, extension);

  if (!existsSync(filePath)) {
    return;
  }

  if (extension !== ".txt") {
    throw new Error(
      `Expected .txt file extension for file ${filePath}, found extension ${extension}`
    );
  }

  let totalLineCount = 0;
  let formattedLines: FormattedLines = [];

  consola.start(`Importing ${fileName}${extension}`);

  return new Promise((resolve, reject) => {
    Papa.parse<SnakeCaseModel>(createReadStream(filePath, "utf-8"), {
      header: true,
      // dynamicTyping: true,
      skipEmptyLines: true,

      step: async function (results, parser) {
        totalLineCount++;

        // @ts-expect-error test...
        formattedLines.push(formatLine(results.data));

        if (formattedLines.length >= BATCH_SIZE / MAX_TABLE_HEADER_COUNT) {
          clearLine(process.stdout, 1);
          cursorTo(process.stdout, 0);
          process.stdout.write(`Processing total records: ${totalLineCount}`);

          parser.pause();

          await insertLines(formattedLines, fileName);
          formattedLines = [];

          parser.resume();
        }
      },
      complete: async function () {
        if (formattedLines.length) {
          await insertLines(formattedLines, fileName);
        }

        process.stdout.write("\r");
        consola.success(
          `Processed ${totalLineCount} records from ${fileName}${extension}`
        );
        resolve(null);
      },
      error(error) {
        consola.error(error.message);
        reject(error);
        process.exit(1);
      },
    });
  });
}

async function insertLines(formattedValues: FormattedLines, filename: string) {
  // consola.info(JSON.stringify(formattedValues[0]));
  // const values = Prisma.join(
  //   formattedValues.map((row) => Prisma.sql`(${Prisma.join(row)})`)
  // );

  if (formattedValues[0] === undefined) return;

  if ("agencyName" in formattedValues[0]) {
    await prisma.agency.createMany({
      data: formattedValues as Agency[],
    });
  }

  if ("monday" in formattedValues[0]) {
    await prisma.calendar.createMany({
      data: formattedValues as Calendar[],
    });
  }

  if ("date" in formattedValues[0]) {
    await prisma.calendarDate.createMany({
      data: formattedValues as CalendarDate[],
    });
  }

  if ("routeShortName" in formattedValues[0]) {
    await prisma.route.createMany({
      data: formattedValues as Route[],
    });
  }

  if ("shapePtLat" in formattedValues[0]) {
    await prisma.shape.createMany({
      data: formattedValues as Shape[],
    });
  }

  if ("arrivalTime" in formattedValues[0]) {
    await prisma.stopTime.createMany({
      data: formattedValues as StopTime[],
    });
  }

  if ("stopCode" in formattedValues[0]) {
    await prisma.stop.createMany({
      data: formattedValues as Stop[],
    });
  }

  if ("tripHeadsign" in formattedValues[0]) {
    await prisma.trip.createMany({
      data: formattedValues as Trip[],
    });
  }
}
