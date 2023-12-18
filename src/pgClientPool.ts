import pg from "pg";

const config = {
  connectionString: process.env.DATABASE_URL,
};

export const pgClientPool = new pg.Pool(config);

export default pgClientPool;
