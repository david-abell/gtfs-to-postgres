import { z } from 'zod';
import type { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['Serializable']);

export const AgencyScalarFieldEnumSchema = z.enum(['agencyId','agencyName','agencyUrl','agencyTimezone']);

export const CalendarScalarFieldEnumSchema = z.enum(['serviceId','monday','tuesday','wednesday','thursday','friday','saturday','sunday','startDate','endDate']);

export const CalendarDateScalarFieldEnumSchema = z.enum(['id','serviceId','date','exceptionType']);

export const RouteScalarFieldEnumSchema = z.enum(['routeId','agencyId','routeShortName','routeLongName','routeType']);

export const ShapeScalarFieldEnumSchema = z.enum(['id','shapeId','shapePtLat','shapePtLon','shapePtSequence','shapeDistTraveled']);

export const StopTimeScalarFieldEnumSchema = z.enum(['id','tripId','arrivalTime','arrivalTimestamp','departureTime','departureTimestamp','stopId','stopSequence','stopHeadsign','pickupType','dropOffType','timepoint']);

export const StopScalarFieldEnumSchema = z.enum(['stopId','stopCode','stopName','stopLat','stopLon']);

export const TripScalarFieldEnumSchema = z.enum(['routeId','serviceId','tripId','tripHeadsign','tripShortName','directionId','blockId','shapeId']);

export const SortOrderSchema = z.enum(['asc','desc']);

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
  id: z.number().int(),
  serviceId: z.string(),
  date: z.number().int(),
  exceptionType: z.number().int(),
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
  id: z.number().int(),
  shapeId: z.string(),
  shapePtLat: z.number(),
  shapePtLon: z.number(),
  shapePtSequence: z.number().int(),
  shapeDistTraveled: z.number().nullable(),
})

export type Shape = z.infer<typeof ShapeSchema>

/////////////////////////////////////////
// STOP TIME SCHEMA
/////////////////////////////////////////

export const StopTimeSchema = z.object({
  id: z.number().int(),
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
})

export type StopTime = z.infer<typeof StopTimeSchema>

/////////////////////////////////////////
// STOP SCHEMA
/////////////////////////////////////////

export const StopSchema = z.object({
  stopId: z.string(),
  stopCode: z.string().nullable(),
  stopName: z.string().nullable(),
  stopLat: z.number().nullable(),
  stopLon: z.number().nullable(),
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
