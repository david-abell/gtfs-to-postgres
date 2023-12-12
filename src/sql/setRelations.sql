--
-- File generated with SQLiteStudio v3.4.4 on Wed Dec 6 15:10:30 2023
--
-- Text encoding used: System
--
BEGIN TRANSACTION;

-- Table: agency


-- Table: calendar


-- Table: calendar_date
ALTER TABLE calendar_date 
    ADD CONSTRAINT calendar_date_service_id_fkey FOREIGN KEY (
        service_id
    )
    REFERENCES calendar (service_id) ON DELETE NO ACTION
                                     ON UPDATE NO ACTION;


-- Table: route
ALTER TABLE route 
    ADD CONSTRAINT route_agency_id_fkey FOREIGN KEY (
        agency_id
    )
    REFERENCES agency (agency_id) ON DELETE NO ACTION
                                  ON UPDATE NO ACTION;


-- Table: trip
ALTER TABLE trip 
    ADD CONSTRAINT trip_service_id_fkey FOREIGN KEY (
        service_id
    )
    REFERENCES calendar (service_id) ON DELETE NO ACTION
                                     ON UPDATE NO ACTION,
    ADD CONSTRAINT trip_route_id_fkey FOREIGN KEY (
        route_id
    )
    REFERENCES route (route_id) ON DELETE NO ACTION
                                ON UPDATE NO ACTION;


-- Table: shape


-- Table: stop


-- Table: stop_time
ALTER TABLE stop_time 
    ADD CONSTRAINT stop_time_stop_id_fkey FOREIGN KEY (
        stop_id
    )
    REFERENCES stop (stop_id) ON DELETE NO ACTION
                              ON UPDATE NO ACTION,
    ADD CONSTRAINT stop_time_trip_id_fkey FOREIGN KEY (
        trip_id
    )
    REFERENCES trip (trip_id) ON DELETE NO ACTION
                              ON UPDATE NO ACTION
;


COMMIT TRANSACTION;