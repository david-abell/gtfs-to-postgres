import { parse } from "csv-parse";
import { createReadStream, existsSync } from "fs";
import consola from "consola";

import { Prisma } from "@prisma/client";
import { basename, extname } from "path";
import { formatLine } from "./utils";
import { record } from "zod";
import prisma from "./client";

const BATCH_SIZE = 20_000;
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

  const csvParser = parse({
    bom: true,
    columns: true,
    relax_quotes: true,
    trim: true,
    skip_empty_lines: true,
    // cast: castCsvValues,
  });
  let totalLineCount = 0;
  let formattedLines: (string | number | null)[][] = [];

  consola.start(`Importing ${fileName}${extension}`);

  return new Promise((resolve, reject) => {
    csvParser.on("readable", async () => {
      let record;
      while ((record = csvParser.read())) {
        totalLineCount++;

        formattedLines.push(formatLine(record));

        if (formattedLines.length >= BATCH_SIZE / MAX_TABLE_HEADER_COUNT) {
          // consola.info(JSON.stringify(formattedLines[0]));
          process.stdout.write("\r");
          process.stdout.write(`Processing total records: ${totalLineCount}`);
          await insertLines(formattedLines, fileName);
          formattedLines = [];
        }
      }
    });

    csvParser.on("error", (err) => {
      console.error(err.message);
      reject(err);
    });

    csvParser.on("end", async () => {
      await insertLines(formattedLines, fileName);
      process.stdout.write("\r");
      consola.success(
        `Processed ${totalLineCount} records from ${fileName}${extension}`
      );
      resolve(record);
    });
    createReadStream(filePath, "utf-8").pipe(csvParser);
  });
}

async function insertLines(
  formattedValues: (string | number | null)[][],
  filename: string
) {
  // consola.info(JSON.stringify(formattedValues[0]));
  const values = Prisma.join(
    formattedValues.map((row) => Prisma.sql`(${Prisma.join(row)})`)
  );

  switch (filename) {
    case "agency":
      await prisma.$queryRaw`
      INSERT into agency
      (agency_id, agency_name, agency_url, agency_timezone)
      VALUES
      ${values}`;
      break;

    case "calendar_dates":
      await prisma.$queryRaw`
      INSERT into calendar_date
      (id, service_id, date, exception_type)
      VALUES
      ${values}`;
      break;

    case "calendar":
      await prisma.$queryRaw`
      INSERT into calendar
      (service_id, monday, tuesday, wednesday, thursday, friday, saturday, sunday, start_date, end_date)
      VALUES
      ${values}`;
      break;

    case "routes":
      await prisma.$queryRaw`
      INSERT into route
      (route_id, agency_id, route_short_name, route_long_name, route_type)
      VALUES
      ${values}`;
      break;

    case "shapes":
      await prisma.$queryRaw`
      INSERT into shape
      (id, shape_id, shape_pt_lat, shape_pt_lon, shape_pt_sequence, shape_dist_traveled)
      VALUES
      ${values}`;
      break;

    case "stop_times":
      await prisma.$queryRaw`
      INSERT into stop_time
      (id, trip_id, arrival_time, arrival_timestamp, departure_time, departure_timestamp, stop_id, stop_sequence, stop_headsign, pickup_type, drop_off_type, timepoint)
      VALUES
      ${values}`;
      break;

    case "stops":
      await prisma.$queryRaw`
      INSERT into stop
      (stop_id, stop_code, stop_name, stop_lat, stop_lon)
      VALUES
      ${values}`;
      break;

    case "trips":
      await prisma.$queryRaw`
      INSERT into trip
      (route_id, service_id, trip_id, trip_headsign, trip_short_name, direction_id, block_id, shape_id)
      VALUES
      ${values}`;
      break;

    default:
      throw new Error(`Invalid file name: ${filename}`);
  }
}
