import { createReadStream, existsSync } from "fs";
import consola from "consola";
import { parse } from "csv-parse";
import { transform } from "stream-transform";
import { stringify } from "csv-stringify";
import { pipeline } from "stream/promises";
import { from } from "pg-copy-streams";

import { basename, extname } from "path";
import { formatLine, getTableNameAndColumns } from "./utils.js";
import { PoolClient } from "pg";

export async function parseAndStreamCSV(
  sourcePath: string,
  dbClient: PoolClient
) {
  const extension = extname(sourcePath);
  const fileName = basename(sourcePath, extension);

  if (!existsSync(sourcePath)) {
    return;
  }

  if (extension !== ".txt") {
    throw new Error(
      `Expected .txt file extension for file ${sourcePath}, found extension ${extension}`
    );
  }

  const tableNameAndColumns = getTableNameAndColumns(fileName);

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

  const readStream = createReadStream(sourcePath, "utf-8");
  const ingestStream = dbClient.query(
    from(`COPY ${tableNameAndColumns} FROM STDIN WITH (FORMAT CSV)`)
  );

  await pipeline(readStream, parser, transformer, stringify(), ingestStream);
  consola.success(`Finished writing records to table ${fileName}.`);
}
