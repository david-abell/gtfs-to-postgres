import { z } from "zod";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Prisma } from "@prisma/client";
import { CastingFunction } from "csv-parse/.";
import { padLeadingZeros } from "../utils";

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(["Serializable"]);

export const AgencyScalarFieldEnumSchema = z.enum([
  "agency_id",
  "agency_name",
  "agency_url",
  "agency_timezone",
]);

export const CalendarScalarFieldEnumSchema = z.enum([
  "service_id",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
  "start_date",
  "end_date",
]);

export const CalendarDateScalarFieldEnumSchema = z.enum([
  "id",
  "service_id",
  "date",
  "exception_type",
]);

export const RouteScalarFieldEnumSchema = z.enum([
  "route_id",
  "agency_id",
  "route_short_name",
  "route_long_name",
  "route_type",
]);

export const ShapeScalarFieldEnumSchema = z.enum([
  "id",
  "shape_id",
  "shape_pt_lat",
  "shape_pt_lon",
  "shape_pt_sequence",
  "shape_dist_traveled",
]);

export const StopTimeScalarFieldEnumSchema = z.enum([
  "id",
  "trip_id",
  "arrival_time",
  "arrival_timestamp",
  "departure_time",
  "departure_timestamp",
  "stop_id",
  "stop_sequence",
  "stop_headsign",
  "pickup_type",
  "drop_off_type",
  "timepoint",
]);

export const StopScalarFieldEnumSchema = z.enum([
  "stop_id",
  "stop_code",
  "stop_name",
  "stop_lat",
  "stop_lon",
]);

export const TripScalarFieldEnumSchema = z.enum([
  "route_id",
  "service_id",
  "trip_id",
  "trip_headsign",
  "trip_short_name",
  "direction_id",
  "block_id",
  "shape_id",
]);

export const SortOrderSchema = z.enum(["asc", "desc"]);

export const NullsOrderSchema = z.enum(["first", "last"]);

/////////////////////////////////////////
// AGENCY SCHEMA
/////////////////////////////////////////

export const AgencySchema = z.object({
  agency_id: z.string(),
  agency_name: z.string(),
  agency_url: z.string(),
  agency_timezone: z.string(),
});

export type Agency = z.infer<typeof AgencySchema>;

/////////////////////////////////////////
// CALENDAR SCHEMA
/////////////////////////////////////////

export const CalendarSchema = z.object({
  service_id: z.string(),
  monday: z.coerce.number().int(),
  tuesday: z.coerce.number().int(),
  wednesday: z.coerce.number().int(),
  thursday: z.coerce.number().int(),
  friday: z.coerce.number().int(),
  saturday: z.coerce.number().int(),
  sunday: z.coerce.number().int(),
  start_date: z.coerce.number().int(),
  end_date: z.coerce.number().int(),
});

export type Calendar = z.infer<typeof CalendarSchema>;

/////////////////////////////////////////
// CALENDAR DATE SCHEMA
/////////////////////////////////////////

export const CalendarDateSchema = z.object({
  id: z.coerce.number().int().nullable().default(null),
  service_id: z.string(),
  date: z.coerce.number().int(),
  exception_type: z.coerce.number().int(),
});

export type CalendarDate = z.infer<typeof CalendarDateSchema>;

/////////////////////////////////////////
// ROUTE SCHEMA
/////////////////////////////////////////

export const RouteSchema = z.object({
  route_id: z.string(),
  agency_id: z.string().nullable(),
  route_short_name: z.string().nullable(),
  route_long_name: z.string().nullable(),
  route_type: z.coerce.number().int(),
});

export type Route = z.infer<typeof RouteSchema>;

/////////////////////////////////////////
// SHAPE SCHEMA
/////////////////////////////////////////

export const ShapeSchema = z.object({
  id: z.coerce.number().int().nullable().default(null),
  shape_id: z.string(),
  shape_pt_lat: z.coerce.number(),
  shape_pt_lon: z.coerce.number(),
  shape_pt_sequence: z.coerce.number().int(),
  shape_dist_traveled: z.coerce.number().nullable(),
});

export type Shape = z.infer<typeof ShapeSchema>;

/////////////////////////////////////////
// STOP TIME SCHEMA
/////////////////////////////////////////

export const StopTimeSchema = z.object({
  id: z.coerce.number().int().nullable().default(null),
  trip_id: z.string(),
  arrival_time: z.string().nullable(),
  arrival_timestamp: z.number().int().nullable().default(null),
  departure_time: z.string().nullable(),
  departure_timestamp: z.number().int().nullable().default(null),
  stop_id: z.string(),
  stop_sequence: z.coerce.number().int(),
  stop_headsign: z.string().nullable(),
  pickup_type: z.coerce.number().int().nullable(),
  drop_off_type: z.coerce.number().int().nullable(),
  timepoint: z.coerce.number().int().nullable(),
});

export type StopTime = z.infer<typeof StopTimeSchema>;

/////////////////////////////////////////
// STOP SCHEMA
/////////////////////////////////////////

export const StopSchema = z.object({
  stop_id: z.string(),
  stop_code: z.string().nullable(),
  stop_name: z.string().nullable(),
  stop_lat: z.coerce.number().nullable(),
  stop_lon: z.coerce.number().nullable(),
});

export type Stop = z.infer<typeof StopSchema>;

/////////////////////////////////////////
// TRIP SCHEMA
/////////////////////////////////////////

export const TripSchema = z.object({
  route_id: z.string(),
  service_id: z.string(),
  trip_id: z.string(),
  trip_headsign: z.string().nullable(),
  trip_short_name: z.string().nullable(),
  direction_id: z.coerce.number().int().nullable(),
  block_id: z.string().nullable(),
  shape_id: z.string().nullable(),
});

export type Trip = z.infer<typeof TripSchema>;

/////////////////////////////////////////
// HELPERS
/////////////////////////////////////////

const tableNameEnum = new Map(
  Object.entries({
    agency: "agency",
    calendar_dates: "calendar_date",
    calendar: "calendar",
    routes: "route",
    shapes: "shape",
    stop_times: "stop_time",
    stops: "stop",
    trips: "trip",
  })
);

export function getZodParser(fileName: string) {
  switch (fileName) {
    case "agency":
      return AgencySchema;
    case "calendar_dates":
      return CalendarDateSchema;
    case "calendar":
      return CalendarSchema;
    case "routes":
      return RouteSchema;
    case "shapes":
      return ShapeSchema;
    case "stop_times":
      return StopTimeSchema;
    case "stops":
      return StopSchema;
    case "trips":
      return TripSchema;
    default:
      throw new Error(`No schema found for file: ${fileName}`);
  }
}

export function getTableName(fileName: string) {
  if (!tableNameEnum.has(fileName)) {
    throw new Error(`Invalid filename: ${fileName}`);
  }
  return tableNameEnum.get(fileName);
}

export function getHeaders(fileName: string) {
  switch (fileName) {
    case "agency":
      return AgencyScalarFieldEnumSchema.options.join(", ");
    case "calendar_dates":
      return CalendarDateScalarFieldEnumSchema.options.join(", ");
    case "calendar":
      return CalendarScalarFieldEnumSchema.options.join(", ");
    case "routes":
      return RouteScalarFieldEnumSchema.options.join(", ");
    case "shapes":
      return ShapeScalarFieldEnumSchema.options.join(", ");
    case "stop_times":
      return StopTimeScalarFieldEnumSchema.options.join(", ");
    case "stops":
      return StopScalarFieldEnumSchema.options.join(", ");
    case "trips":
      return TripScalarFieldEnumSchema.options.join(", ");
    default:
      throw new Error(`No schema found for file: ${fileName}`);
  }
}
