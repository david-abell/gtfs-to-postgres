--
-- File generated with SQLiteStudio v3.4.4 on Wed Dec 6 15:10:30 2023
--
-- Text encoding used: System
--
BEGIN TRANSACTION;

DROP TABLE IF EXISTS agency,
    calendar,
    calendar_date,
    route,
    shape,
    stop,
    stop_time,
    trip;

-- Index: idx_calendar_dates_exception_type
DROP INDEX IF EXISTS idx_calendar_dates_exception_type;

-- Index: idx_calendar_dates_service_id
DROP INDEX IF EXISTS idx_calendar_dates_service_id;

-- Index: idx_calendar_end_date
DROP INDEX IF EXISTS idx_calendar_end_date;

-- Index: idx_calendar_start_date
DROP INDEX IF EXISTS idx_calendar_start_date;

-- Index: idx_shapes_shape_id
DROP INDEX IF EXISTS idx_shapes_shape_id;

-- Index: idx_stop_times_arrival_timestamp
DROP INDEX IF EXISTS idx_stop_times_arrival_timestamp;

-- Index: idx_stop_times_departure_timestamp
DROP INDEX IF EXISTS idx_stop_times_departure_timestamp;

-- Index: idx_stop_times_stop_id
DROP INDEX IF EXISTS idx_stop_times_stop_id;

-- Index: idx_stop_times_stop_id_arrival_timestamp_trip
DROP INDEX IF EXISTS idx_stop_times_stop_id_arrival_timestamp_trip;

-- Index: idx_stop_times_trip_id
DROP INDEX IF EXISTS idx_stop_times_trip_id;

-- Index: idx_trips_block_id
DROP INDEX IF EXISTS idx_trips_block_id;

-- Index: idx_trips_direction_id
DROP INDEX IF EXISTS idx_trips_direction_id;

-- Index: idx_trips_route_id
DROP INDEX IF EXISTS idx_trips_route_id;

-- Index: idx_trips_service_id
DROP INDEX IF EXISTS idx_trips_service_id;

-- Index: idx_trips_shape_id
DROP INDEX IF EXISTS idx_trips_shape_id;


-- Table: agency
CREATE TABLE IF NOT EXISTS api_update_log (
    last_modified_date  TIMESTAMPTZ,
    expires             TIMESTAMPTZ,
    id                  SERIAL  NOT NULL
                                PRIMARY KEY

);

-- Table: agency
CREATE TABLE agency (
    agency_id       TEXT NOT NULL
                         PRIMARY KEY,
    agency_name     TEXT NOT NULL,
    agency_url      TEXT NOT NULL,
    agency_timezone TEXT NOT NULL
);


-- Table: calendar
CREATE TABLE calendar (
    service_id TEXT    NOT NULL
                       PRIMARY KEY,
    monday     SMALLINT NOT NULL,
    tuesday    SMALLINT NOT NULL,
    wednesday  SMALLINT NOT NULL,
    thursday   SMALLINT NOT NULL,
    friday     SMALLINT NOT NULL,
    saturday   SMALLINT NOT NULL,
    sunday     SMALLINT NOT NULL,
    start_date INTEGER NOT NULL,
    end_date   INTEGER NOT NULL
);


-- Table: calendar_date
CREATE TABLE calendar_date (
    service_id     TEXT    NOT NULL,
    date           INTEGER NOT NULL,
    exception_type SMALLINT NOT NULL,
    id             SERIAL NOT NULL
                           PRIMARY KEY
);


-- Table: route
CREATE TABLE route (
    route_id         TEXT    NOT NULL
                             PRIMARY KEY,
    agency_id        TEXT,
    route_short_name TEXT,
    route_long_name  TEXT,
    route_type       SMALLINT NOT NULL
);


-- Table: trip
CREATE TABLE trip (
    route_id        TEXT    NOT NULL,
    service_id      TEXT    NOT NULL,
    trip_id         TEXT    NOT NULL
                            PRIMARY KEY,
    trip_headsign   TEXT,
    trip_short_name TEXT,
    direction_id    SMALLINT,
    block_id        TEXT,
    shape_id        TEXT
);


-- Table: shape
CREATE TABLE shape (
    shape_id            TEXT    NOT NULL,
    shape_pt_lat        DECIMAL    NOT NULL,
    shape_pt_lon        DECIMAL    NOT NULL,
    shape_pt_sequence   INTEGER NOT NULL,
    shape_dist_traveled REAL,
    id                  SERIAL NOT NULL
                                PRIMARY KEY 
);


-- Table: stop
CREATE TABLE stop (
    stop_id   TEXT NOT NULL
                   PRIMARY KEY,
    stop_code TEXT,
    stop_name TEXT,
    stop_lat  DECIMAL,
    stop_lon  DECIMAL
);


-- Table: stop_time
CREATE TABLE stop_time (
    trip_id             TEXT    NOT NULL,
    arrival_time        TEXT,
    arrival_timestamp   INTEGER,
    departure_time      TEXT,
    departure_timestamp INTEGER,
    stop_id             TEXT    NOT NULL,
    stop_sequence       SMALLINT NOT NULL,
    stop_headsign       TEXT,
    pickup_type         SMALLINT,
    drop_off_type       SMALLINT,
    timepoint           SMALLINT,
    id                  SERIAL NOT NULL
                                PRIMARY KEY
);


COMMIT TRANSACTION;