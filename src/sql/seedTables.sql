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
CREATE TABLE agency (
    agency_id       TEXT NOT NULL
                         PRIMARY KEY,
    agency_name     TEXT NOT NULL,
    agency_url      TEXT NOT NULL,
    agency_timezone TEXT NOT NULL
);


-- Table: calendar
CREATE TABLE calendar (
    service_id INTEGER    NOT NULL
                       PRIMARY KEY,
    monday     TEXT NOT NULL,
    tuesday    TEXT NOT NULL,
    wednesday  TEXT NOT NULL,
    thursday   TEXT NOT NULL,
    friday     TEXT NOT NULL,
    saturday   TEXT NOT NULL,
    sunday     TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date   DATE NOT NULL
);


-- Table: calendar_date
CREATE TABLE calendar_date (
    service_id     INTEGER    NOT NULL,
    date           DATE NOT NULL,
    exception_type SMALLINT NOT NULL,
    id             SERIAL NOT NULL
                           PRIMARY KEY,
    CONSTRAINT calendar_date_service_id_fkey FOREIGN KEY (
        service_id
    )
    REFERENCES calendar (service_id) ON DELETE NO ACTION
                                     ON UPDATE NO ACTION
);


-- Table: route
CREATE TABLE route (
    route_id         TEXT    NOT NULL
                             PRIMARY KEY,
    agency_id        TEXT,
    route_short_name TEXT,
    route_long_name  TEXT,
    route_type       SMALLINT NOT NULL,
    CONSTRAINT route_agency_id_fkey FOREIGN KEY (
        agency_id
    )
    REFERENCES agency (agency_id) ON DELETE NO ACTION
                                  ON UPDATE NO ACTION
);


-- Table: trip
CREATE TABLE trip (
    route_id        TEXT    NOT NULL,
    service_id      SMALLINT    NOT NULL,
    trip_id         TEXT    NOT NULL
                            PRIMARY KEY,
    trip_headsign   TEXT,
    trip_short_name TEXT,
    direction_id    SMALLINT,
    block_id        TEXT,
    shape_id        TEXT,
    CONSTRAINT trip_service_id_fkey FOREIGN KEY (
        service_id
    )
    REFERENCES calendar (service_id) ON DELETE NO ACTION
                                     ON UPDATE NO ACTION,
    CONSTRAINT trip_route_id_fkey FOREIGN KEY (
        route_id
    )
    REFERENCES route (route_id) ON DELETE NO ACTION
                                ON UPDATE NO ACTION
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
    arrival_time        TIME,
    -- arrival_timestamp   INTEGER,
    departure_time      TIME,
    -- departure_timestamp INTEGER,
    stop_id             TEXT    NOT NULL,
    stop_sequence       SMALLINT NOT NULL,
    stop_headsign       TEXT,
    pickup_type         SMALLINT,
    drop_off_type       SMALLINT,
    timepoint           SMALLINT,
    id                  SERIAL NOT NULL
                                PRIMARY KEY ,
    CONSTRAINT stop_time_stop_id_fkey FOREIGN KEY (
        stop_id
    )
    REFERENCES stop (stop_id) ON DELETE NO ACTION
                              ON UPDATE NO ACTION,
    CONSTRAINT stop_time_trip_id_fkey FOREIGN KEY (
        trip_id
    )
    REFERENCES trip (trip_id) ON DELETE NO ACTION
                              ON UPDATE NO ACTION
);


COMMIT TRANSACTION;