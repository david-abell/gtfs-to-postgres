import { consola } from "consola";
import { writeFile } from "fs/promises";
import AdmZip from "adm-zip";

const AGENCY_URL =
  "https://www.transportforireland.ie/transitData/Data/GTFS_All.zip";

export async function downloadFiles(dirName: string) {
  consola.start(`Downloading GTFS from ${AGENCY_URL}`);

  try {
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
