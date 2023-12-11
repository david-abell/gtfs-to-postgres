import { createReadStream, existsSync, createWriteStream } from "fs";
import consola from "consola";
import { parse } from "csv-parse";
import { transform } from "stream-transform";
import { stringify } from "csv-stringify";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { pipeline } from "stream/promises";
import { from } from "pg-copy-streams";

import { basename, extname } from "path";
import { formatLine } from "./utils";
import { PoolClient } from "pg";

export async function parseFile(sourcePath: string, dbClient: PoolClient) {
  const currentFilePath = fileURLToPath(import.meta.url);
  const __dirname = dirname(currentFilePath);
  const extension = extname(sourcePath);
  const fileName = basename(sourcePath, extension);
  const filePath = `../tmp_parsed/${fileName}.csv`;

  const destinationPath = join(__dirname, filePath);

  if (!existsSync(sourcePath)) {
    return;
  }

  if (extension !== ".txt") {
    throw new Error(
      `Expected .txt file extension for file ${sourcePath}, found extension ${extension}`
    );
  }

  // testing agency file
  if (fileName !== "agency") return;

  consola.start(`Importing ${fileName}${extension}`);

  const parser = parse({
    bom: true,
    columns: true,
    relax_quotes: true,
    trim: true,
    skip_empty_lines: true,
  });

  const transformer = transform((record) => {
    return formatLine(record);
  });

  const stringifier = stringify({
    bom: true,
    header: true,
  });

  const resetTableQuery = `BEGIN TRANSACTION;
    DROP TABLE IF EXISTS agency;
    
    CREATE TABLE agency (
      agency_id       TEXT NOT NULL
                           PRIMARY KEY,
      agency_name     TEXT NOT NULL,
      agency_url      TEXT NOT NULL,
      agency_timezone TEXT NOT NULL
    );

    COMMIT TRANSACTION;
  `;

  try {
    await dbClient.query(resetTableQuery);
    const readStream = createReadStream(sourcePath, "utf-8");
    // const writeStream = createWriteStream(destinationPath);
    const ingestStream = dbClient.query(from(`COPY agency FROM STDIN`));

    await pipeline(readStream, parser, transformer, stringifier, ingestStream);
  } catch (error) {
    consola.error(error);
  }

  consola.success(`Finished writing records.`);
}
