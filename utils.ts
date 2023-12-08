// Modified from https://stackoverflow.com/questions/15256290/read-the-last-line-of-a-csv-file-and-extract-one-value

import path from "path";
import { open } from "fs/promises";
import { CastingFunction } from "csv-parse/.";
import {
  SnakeCaseModel,
  ModelWithoutId,
  CalendarDateWithoutId,
  ShapeWithoutId,
  StopTimeWithoutId,
} from "./prisma/models";

import {
  Agency,
  Calendar,
  CalendarDate,
  Route,
  Trip,
  Stop,
  Shape,
  StopTime,
} from "@prisma/client";

export type FormattedLines =
  | Agency[]
  | Calendar[]
  | CalendarDateWithoutId[]
  | Route[]
  | Trip[]
  | Stop[]
  | ShapeWithoutId[]
  | StopTimeWithoutId[];

export function calculateSecondsFromMidnight(time: string | null | undefined) {
  if (!time) return null;

  const split = time.split(":").map((d) => Number.parseInt(d, 10));

  if (
    split.length !== 3 ||
    split[0] === undefined ||
    split[1] === undefined ||
    split[2] === undefined
  ) {
    return null;
  }

  return split[0] * 3600 + split[1] * 60 + split[2];
}

export function padLeadingZeros(time: string | null) {
  if (!time) return null;
  const split = time.split(":").map((d) => String(Number(d)).padStart(2, "0"));
  if (
    split.length !== 3 ||
    split[0] === undefined ||
    split[1] === undefined ||
    split[2] === undefined
  ) {
    return null;
  }

  return split.join(":");
}

export const castCsvValues: CastingFunction = (value, context) => {
  switch (context.column) {
    case "monday":
    case "tuesday":
    case "wednesday":
    case "thursday":
    case "friday":
    case "saturday":
    case "sunday":
    case "start_date":
    case "end_date":
    case "date":
    case "exception_type":
    case "route_type":
    case "shape_pt_lat":
    case "shape_pt_lon":
    case "shape_dist_traveled":
    case "stop_sequence":
    case "pickup_type":
    case "drop_off_type":
    case "timepoint":
    case "stop_lat":
    case "stop_lon":
    case "direction_id":
      return Number(value);

    // case "arrival_time":
    // case "departure_time":
    //   return padLeadingZeros(value);

    default:
      return value;
  }
};

function castColumnValue(key: string, value: string | number | null) {
  switch (key) {
    case "monday":
    case "tuesday":
    case "wednesday":
    case "thursday":
    case "friday":
    case "saturday":
    case "sunday":
    case "start_date":
    case "end_date":
    case "date":
    case "exception_type":
    case "route_type":
    case "shape_pt_lat":
    case "shape_pt_lon":
    case "shape_pt_sequence":
    case "shape_dist_traveled":
    case "stop_sequence":
    case "pickup_type":
    case "drop_off_type":
    case "timepoint":
    case "stop_lat":
    case "stop_lon":
    case "direction_id":
      return Number(value);

    default:
      return value;
  }
}

export function formatLine(csvRecord: SnakeCaseModel): ModelWithoutId {
  // eslint-disable-next-line prefer-const
  for (let [key, value] of Object.entries(csvRecord)) {
    // @ts-expect-error this is the correct key
    csvRecord[key] = castColumnValue(key, value);
  }

  if ("agency_name" in csvRecord) {
    return {
      agencyId: csvRecord.agency_id,
      agencyName: csvRecord.agency_name,
      agencyUrl: csvRecord.agency_url,
      agencyTimezone: csvRecord.agency_timezone,
    };
  }

  if ("monday" in csvRecord) {
    return {
      serviceId: csvRecord.service_id,
      monday: csvRecord.monday,
      tuesday: csvRecord.tuesday,
      wednesday: csvRecord.wednesday,
      thursday: csvRecord.thursday,
      friday: csvRecord.friday,
      saturday: csvRecord.saturday,
      sunday: csvRecord.sunday,
      startDate: csvRecord.start_date,
      endDate: csvRecord.end_date,
    };
  }

  if ("date" in csvRecord) {
    return {
      serviceId: csvRecord.service_id,
      date: csvRecord.date,
      exceptionType: csvRecord.exception_type,
    };
  }

  if ("route_short_name" in csvRecord) {
    return {
      routeId: csvRecord.route_id,
      agencyId: csvRecord.agency_id || null,
      routeShortName: csvRecord.route_short_name || null,
      routeLongName: csvRecord.route_long_name || null,
      routeType: csvRecord.route_type,
    };
  }

  if ("shape_pt_lat" in csvRecord) {
    return {
      shapeId: csvRecord.shape_id,
      shapePtLat: csvRecord.shape_pt_lat,
      shapePtLon: csvRecord.shape_pt_lon,
      shapePtSequence: csvRecord.shape_pt_sequence,
      shapeDistTraveled: csvRecord.shape_dist_traveled || null,
    };
  }

  if ("arrival_time" in csvRecord) {
    csvRecord.arrival_time = padLeadingZeros(csvRecord.arrival_time);
    csvRecord.departure_time = padLeadingZeros(csvRecord.departure_time);

    csvRecord.arrival_timestamp = calculateSecondsFromMidnight(
      csvRecord.arrival_time
    );

    csvRecord.departure_timestamp = calculateSecondsFromMidnight(
      csvRecord.departure_time
    );

    return {
      tripId: csvRecord.trip_id,
      arrivalTime: csvRecord.arrival_time || null,
      arrivalTimestamp: csvRecord.arrival_timestamp,
      departureTime: csvRecord.departure_time || null,
      departureTimestamp: csvRecord.departure_timestamp,
      stopId: csvRecord.stop_id,
      stopSequence: csvRecord.stop_sequence,
      stopHeadsign: csvRecord.stop_headsign || null,
      pickupType: csvRecord.pickup_type || null,
      dropOffType: csvRecord.drop_off_type || null,
      timepoint: csvRecord.timepoint || null,
    };
  }

  if ("stop_code" in csvRecord) {
    return {
      stopId: csvRecord.stop_id,
      stopCode: csvRecord.stop_code || null,
      stopName: csvRecord.stop_name || null,
      stopLat: csvRecord.stop_lat || null,
      stopLon: csvRecord.stop_lon || null,
    };
  }

  if ("trip_headsign" in csvRecord) {
    return {
      routeId: csvRecord.route_id,
      serviceId: csvRecord.service_id,
      tripId: csvRecord.trip_id,
      tripHeadsign: csvRecord.trip_headsign || null,
      tripShortName: csvRecord.trip_short_name || null,
      directionId: csvRecord.direction_id || null,
      blockId: csvRecord.block_id || null,
      shapeId: csvRecord.shape_id || null,
    };
  }

  throw new Error(`Parsing failed for record ${JSON.stringify(csvRecord)}`);
}
