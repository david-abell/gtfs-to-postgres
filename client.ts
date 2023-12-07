import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
  ],
  // log: ["query", "info", "warn", "error"],
  // log: ["warn", "error"],
});

export default prisma;
