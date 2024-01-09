import { consola } from "consola";
import { writeFile } from "fs/promises";
import AdmZip from "adm-zip";

const AGENCY_URL =
  "https://www.transportforireland.ie/transitData/Data/GTFS_All.zip";

export async function downloadFiles(dirName: string) {
  consola.start(`Downloading GTFS from ${AGENCY_URL}`);

  const response = await fetch(AGENCY_URL, {
    method: "GET",
  });

  if (response.status !== 200) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  const lastModified = response.headers.get("last-modified");
  const contentLength = response.headers.get("content-length");
  const expires = response.headers.get("expires");

  if (!lastModified || !expires) {
    throw new Error(
      `Error getting response headers: last-modified: ${lastModified}, expires: ${expires}`
    );
  }

  consola.success(`Download successful:
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
  return { lastModified, expires };
}
