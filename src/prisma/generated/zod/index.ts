import { z } from 'zod';
import type { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// DECIMAL
//------------------------------------------------------

export const DecimalJSLikeSchema: z.ZodType<Prisma.DecimalJsLike> = z.object({ d: z.array(z.number()), e: z.number(), s: z.number(), toFixed: z.function().args().returns(z.string()), });

export const DecimalJSLikeListSchema: z.ZodType<Prisma.DecimalJsLike[]> = z.object({ d: z.array(z.number()), e: z.number(), s: z.number(), toFixed: z.function().args().returns(z.string()), }).array();

export const DECIMAL_STRING_REGEX = /^[0-9.,e+-bxffo_cp]+$|Infinity|NaN/;

export const isValidDecimalInput =
  (v?: null | string | number | Prisma.DecimalJsLike): v is string | number | Prisma.DecimalJsLike => {
    if (v === undefined || v === null) return false;
    return (
      (typeof v === 'object' && 'd' in v && 'e' in v && 's' in v && 'toFixed' in v) ||
      (typeof v === 'string' && DECIMAL_STRING_REGEX.test(v)) ||
      typeof v === 'number'
    )
  };

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const AgencyScalarFieldEnumSchema = z.enum(['agencyId','agencyName','agencyUrl','agencyTimezone']);

export const CalendarScalarFieldEnumSchema = z.enum(['serviceId','monday','tuesday','wednesday','thursday','friday','saturday','sunday','startDate','endDate']);

export const CalendarDateScalarFieldEnumSchema = z.enum(['serviceId','date','exceptionType','id']);

export const RouteScalarFieldEnumSchema = z.enum(['routeId','agencyId','routeShortName','routeLongName','routeType']);

export const ShapeScalarFieldEnumSchema = z.enum(['shapeId','shapePtLat','shapePtLon','shapePtSequence','shapeDistTraveled','id']);

export const StopTimeScalarFieldEnumSchema = z.enum(['tripId','arrivalTime','arrivalTimestamp','departureTime','departureTimestamp','stopId','stopSequence','stopHeadsign','pickupType','dropOffType','timepoint','id']);

export const StopScalarFieldEnumSchema = z.enum(['stopId','stopCode','stopName','stopLat','stopLon']);

export const TripScalarFieldEnumSchema = z.enum(['routeId','serviceId','tripId','tripHeadsign','tripShortName','directionId','blockId','shapeId']);

export const ApiUpdateLogScalarFieldEnumSchema = z.enum(['last_modified_date','expires','id']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);
/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// AGENCY SCHEMA
/////////////////////////////////////////

export const AgencySchema = z.object({
  agencyId: z.string(),
  agencyName: z.string(),
  agencyUrl: z.string(),
  agencyTimezone: z.string(),
})

export type Agency = z.infer<typeof AgencySchema>

/////////////////////////////////////////
// CALENDAR SCHEMA
/////////////////////////////////////////

export const CalendarSchema = z.object({
  serviceId: z.string(),
  monday: z.number().int(),
  tuesday: z.number().int(),
  wednesday: z.number().int(),
  thursday: z.number().int(),
  friday: z.number().int(),
  saturday: z.number().int(),
  sunday: z.number().int(),
  startDate: z.number().int(),
  endDate: z.number().int(),
})

export type Calendar = z.infer<typeof CalendarSchema>

/////////////////////////////////////////
// CALENDAR DATE SCHEMA
/////////////////////////////////////////

export const CalendarDateSchema = z.object({
  serviceId: z.string(),
  date: z.number().int(),
  exceptionType: z.number().int(),
  id: z.number().int(),
})

export type CalendarDate = z.infer<typeof CalendarDateSchema>

/////////////////////////////////////////
// ROUTE SCHEMA
/////////////////////////////////////////

export const RouteSchema = z.object({
  routeId: z.string(),
  agencyId: z.string().nullable(),
  routeShortName: z.string().nullable(),
  routeLongName: z.string().nullable(),
  routeType: z.number().int(),
})

export type Route = z.infer<typeof RouteSchema>

/////////////////////////////////////////
// SHAPE SCHEMA
/////////////////////////////////////////

export const ShapeSchema = z.object({
  shapeId: z.string(),
  shapePtLat: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: "Field 'shapePtLat' must be a Decimal. Location: ['Models', 'Shape']",  }),
  shapePtLon: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: "Field 'shapePtLon' must be a Decimal. Location: ['Models', 'Shape']",  }),
  shapePtSequence: z.number().int(),
  shapeDistTraveled: z.number().nullable(),
  id: z.number().int(),
})

export type Shape = z.infer<typeof ShapeSchema>

/////////////////////////////////////////
// STOP TIME SCHEMA
/////////////////////////////////////////

export const StopTimeSchema = z.object({
  tripId: z.string(),
  arrivalTime: z.string().nullable(),
  arrivalTimestamp: z.number().int().nullable(),
  departureTime: z.string().nullable(),
  departureTimestamp: z.number().int().nullable(),
  stopId: z.string(),
  stopSequence: z.number().int(),
  stopHeadsign: z.string().nullable(),
  pickupType: z.number().int().nullable(),
  dropOffType: z.number().int().nullable(),
  timepoint: z.number().int().nullable(),
  id: z.number().int(),
})

export type StopTime = z.infer<typeof StopTimeSchema>

/////////////////////////////////////////
// STOP SCHEMA
/////////////////////////////////////////

export const StopSchema = z.object({
  stopId: z.string(),
  stopCode: z.string().nullable(),
  stopName: z.string().nullable(),
  stopLat: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: "Field 'stopLat' must be a Decimal. Location: ['Models', 'Stop']",  }).nullable(),
  stopLon: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: "Field 'stopLon' must be a Decimal. Location: ['Models', 'Stop']",  }).nullable(),
})

export type Stop = z.infer<typeof StopSchema>

/////////////////////////////////////////
// TRIP SCHEMA
/////////////////////////////////////////

export const TripSchema = z.object({
  routeId: z.string(),
  serviceId: z.string(),
  tripId: z.string(),
  tripHeadsign: z.string().nullable(),
  tripShortName: z.string().nullable(),
  directionId: z.number().int().nullable(),
  blockId: z.string().nullable(),
  shapeId: z.string().nullable(),
})

export type Trip = z.infer<typeof TripSchema>

/////////////////////////////////////////
// API UPDATE LOG SCHEMA
/////////////////////////////////////////

export const ApiUpdateLogSchema = z.object({
  last_modified_date: z.coerce.date(),
  expires: z.coerce.date(),
  id: z.number().int(),
})

export type ApiUpdateLog = z.infer<typeof ApiUpdateLogSchema>
