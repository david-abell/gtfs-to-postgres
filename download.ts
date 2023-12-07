import { consola } from "consola";
import { writeFile, appendFile } from "fs/promises";
import AdmZip from "adm-zip";
import { readLastLine } from "./utils";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const AGENCY_URL =
  "https://www.transportforireland.ie/transitData/Data/GTFS_All.zip";

const GTFS_DATA_LOG = "prisma/GTFSDataLog.txt";

const LOG_PATH = join(__dirname, GTFS_DATA_LOG);

export async function downloadFiles(dirName: string) {
  consola.start(`Downloading GTFS from ${AGENCY_URL}`);

  try {
    let lastLogLine, prevLastModified, prevExpires;

    if (existsSync(LOG_PATH)) {
      lastLogLine = await readLastLine(LOG_PATH);
      [prevLastModified, prevExpires] = lastLogLine.split("-");
    } else {
      consola.info("no file found, creating new file");
      await writeFile(LOG_PATH, "");
    }

    const response = await fetch(AGENCY_URL, {
      method: "GET",
    });

    if (response.status !== 200) {
      throw new Error("Couldn’t download files");
    }

    const lastModified = response.headers.get("last-modified");
    const contentLength = response.headers.get("content-length");
    const expires = response.headers.get("expires");

    consola.success(`Download successfull:
    Last modified: ${lastModified}
    Content Length: ${(Number(contentLength) / (1024 * 1024)).toFixed(2)} MB
    Expires: ${expires}`);

    if (prevLastModified === lastModified) {
      consola.warn(`Files have not changed since ${lastModified}`);
      if (expires && prevExpires !== expires) {
        consola.warn(`Expire date has changed, new expire date is: ${expires}`);
        await appendFile(LOG_PATH, `${lastModified}-${expires}\n`);
      }
      process.exit(0);
    }

    if (lastModified && lastModified.length && expires && expires.length) {
      await appendFile(LOG_PATH, `${lastModified}-${expires}\n`);
    }

    const buffer = await response.arrayBuffer();

    const zipped = new AdmZip(Buffer.from(buffer));

    let fileCount = 0;

    for (const file of zipped.getEntries()) {
      const { entryName } = file;

      consola.info(`Extracting ${entryName} to ${dirName}/${entryName}`);

      await writeFile(`${dirName}/${entryName}`, file.getData());

      fileCount += 1;
    }

    consola.success(`Finished writing ${fileCount} files.`);
  } catch (error) {
    if (error instanceof Error) {
      consola.error(new Error(error.message));
      process.exit(1);
    }
  }
}
