BEGIN TRANSACTION;


-- Index: idx_calendar_dates_exception_type
DROP INDEX IF EXISTS idx_calendar_dates_exception_type;

CREATE INDEX idx_calendar_dates_exception_type ON calendar_date (
    "exception_type"
);


-- Index: idx_calendar_dates_service_id
DROP INDEX IF EXISTS idx_calendar_dates_service_id;

CREATE INDEX idx_calendar_dates_service_id ON calendar_date (
    "service_id"
);


-- Index: idx_calendar_end_date
DROP INDEX IF EXISTS idx_calendar_end_date;

CREATE INDEX idx_calendar_end_date ON calendar (
    "end_date"
);


-- Index: idx_calendar_start_date
DROP INDEX IF EXISTS idx_calendar_start_date;

CREATE INDEX idx_calendar_start_date ON calendar (
    "start_date"
);


-- Index: idx_shapes_shape_id
DROP INDEX IF EXISTS idx_shapes_shape_id;

CREATE INDEX idx_shapes_shape_id ON shape (
    "shape_id"
);


-- Index: idx_stop_times_arrival_timestamp
DROP INDEX IF EXISTS idx_stop_times_arrival_timestamp;

CREATE INDEX idx_stop_times_arrival_timestamp ON stop_time (
    "arrival_timestamp"
);


-- Index: idx_stop_times_departure_timestamp
DROP INDEX IF EXISTS idx_stop_times_departure_timestamp;

CREATE INDEX idx_stop_times_departure_timestamp ON stop_time (
    "departure_timestamp"
);


-- Index: idx_stop_times_stop_id
DROP INDEX IF EXISTS idx_stop_times_stop_id;

CREATE INDEX idx_stop_times_stop_id ON stop_time (
    "stop_id"
);


-- Index: idx_stop_times_stop_id_arrival_timestamp_trip
DROP INDEX IF EXISTS idx_stop_times_stop_id_arrival_timestamp_trip;

CREATE INDEX idx_stop_times_stop_id_arrival_timestamp_trip ON stop_time (
    "arrival_timestamp",
    "stop_id",
    "trip_id"
);


-- Index: idx_stop_times_trip_id
DROP INDEX IF EXISTS idx_stop_times_trip_id;

CREATE INDEX idx_stop_times_trip_id ON stop_time (
    "trip_id"
);


-- Index: idx_trips_block_id
DROP INDEX IF EXISTS idx_trips_block_id;

CREATE INDEX idx_trips_block_id ON trip (
    "block_id"
);


-- Index: idx_trips_direction_id
DROP INDEX IF EXISTS idx_trips_direction_id;

CREATE INDEX idx_trips_direction_id ON trip (
    "direction_id"
);


-- Index: idx_trips_route_id
DROP INDEX IF EXISTS idx_trips_route_id;

CREATE INDEX idx_trips_route_id ON trip (
    "route_id"
);


-- Index: idx_trips_service_id
DROP INDEX IF EXISTS idx_trips_service_id;

CREATE INDEX idx_trips_service_id ON trip (
    "service_id"
);


-- Index: idx_trips_shape_id
DROP INDEX IF EXISTS idx_trips_shape_id;

CREATE INDEX idx_trips_shape_id ON trip (
    "shape_id"
);


COMMIT TRANSACTION;