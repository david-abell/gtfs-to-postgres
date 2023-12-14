import { fileURLToPath } from "url";
import { SnakeCaseModel, ModelWithoutId } from "./prisma/models";

import { dirname, join } from "path";

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

export function resolveFilePath(filePath: string) {
  const currentFilePath = fileURLToPath(import.meta.url);
  const __dirname = dirname(currentFilePath);

  return join(__dirname, filePath);
}

export function getTableNameAndColumns(filename: string) {
  switch (filename) {
    case "agency":
      return "agency (agency_id, agency_name, agency_url, agency_timezone)";

    case "calendar_dates":
      return "calendar_date (service_id, date, exception_type)";

    case "calendar":
      return "calendar (service_id, monday, tuesday, wednesday, thursday, friday, saturday, sunday, start_date, end_date)";

    case "routes":
      return "route (route_id, agency_id, route_short_name, route_long_name, route_type)";

    case "shapes":
      return "shape (shape_id, shape_pt_lat, shape_pt_lon, shape_pt_sequence, shape_dist_traveled)";

    case "stop_times":
      return "stop_time (trip_id, arrival_time, arrival_timestamp, departure_time, departure_timestamp, stop_id, stop_sequence, stop_headsign, pickup_type, drop_off_type, timepoint)";

    case "stops":
      return "stop (stop_id, stop_code, stop_name, stop_lat, stop_lon)";

    case "trips":
      return "trip (route_id, service_id, trip_id, trip_headsign, trip_short_name, direction_id, block_id, shape_id)";

    default:
      throw new Error(`Invalid file name: ${filename}`);
  }
}
