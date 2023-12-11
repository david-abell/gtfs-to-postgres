import pg from "pg";

const config = {
  user: "postgres",
  host: "localhost",
  database: "gtfs",
  password: process.env.PG_PASSWORD,
  port: 5432,
};

export const pgClientPool = new pg.Pool(config);

export default pgClientPool;
