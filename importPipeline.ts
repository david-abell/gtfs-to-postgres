import Papa from "papaparse";
import { createReadStream, existsSync } from "fs";
import consola from "consola";
import { clearLine, cursorTo } from "readline";

import { Prisma } from "@prisma/client";
import { basename, extname } from "path";
import { formatLine } from "./utils";
import { Stream } from "stream";
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

  let totalLineCount = 0;
  let formattedLines: (string | number | null)[][] = [];

  consola.start(`Importing ${fileName}${extension}`);

  const pipeline = Stream.pipeline(
    createReadStream(filePath, "utf-8"),
    Papa.parse(Papa.NODE_STREAM_INPUT, { header: true, skipEmptyLines: true }),
    (err) => err && console.error(err)
  );

  for await (const entry of pipeline) {
    totalLineCount++;

    formattedLines.push(formatLine(entry));

    if (formattedLines.length >= BATCH_SIZE / MAX_TABLE_HEADER_COUNT) {
      clearLine(process.stdout, 1);
      cursorTo(process.stdout, 0);
      process.stdout.write(`Processing total records: ${totalLineCount}`);

      await insertLines(formattedLines, fileName);
      formattedLines = [];
    }
  }

  if (formattedLines.length) {
    await insertLines(formattedLines, fileName);
  }

  process.stdout.write("\r");
  consola.success(
    `Processed ${totalLineCount} records from ${fileName}${extension}`
  );
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
