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
import { CamelKeysToSnake } from "../types/utils";

export type CalendarDateWithoutId = Omit<CalendarDate, "id">;
export type ShapeWithoutId = Omit<Shape, "id">;
export type StopTimeWithoutId = Omit<StopTime, "id">;

export type ModelWithoutId =
  | Agency
  | Calendar
  | Omit<CalendarDate, "id">
  | Route
  | Trip
  | Stop
  | Omit<Shape, "id">
  | Omit<StopTime, "id">;

type AgencySnakeCase = CamelKeysToSnake<Agency>;
type CalendarSnakeCase = CamelKeysToSnake<Calendar>;
type CalendarDateSnakeCase = CamelKeysToSnake<CalendarDate>;
type RouteSnakeCase = CamelKeysToSnake<Route>;
type TripSnakeCase = CamelKeysToSnake<Trip>;
type StopSnakeCase = CamelKeysToSnake<Stop>;
type ShapeSnakeCase = CamelKeysToSnake<Shape>;
type StopTimeSnakeCase = CamelKeysToSnake<StopTime>;

export type SnakeCaseModel =
  | AgencySnakeCase
  | CalendarSnakeCase
  | CalendarDateSnakeCase
  | RouteSnakeCase
  | TripSnakeCase
  | StopSnakeCase
  | ShapeSnakeCase
  | StopTimeSnakeCase;
