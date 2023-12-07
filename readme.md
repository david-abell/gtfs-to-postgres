# Data import testing of Transport for Ireland GTFS CSV files into SQlite

## Table of Contents

- [Overview](#overview)
  - [Project description](#project-description)
  - [Features](#features)
- [Process](#process)
  - [csv-parse](#csv-parse)
  - [PapaParse](#papaparse)
  - [Pipeline and for await](#pipeline-and-for-await)
  - [Logging suprises](#logging-suprises)
  - [Useful resources](#useful-resources)
- [Data](#data)
- [Instructions](#instructions)
  - [Setup](#setup)
  - [Usage](#usage)
- [Acknowledgements](#acknowledgements)
- [Author](#Author)

## Overview

### Project Description

This is a script testbed for importing GTFS CSV files from Transport for Ireland into a SQLite database.

### Features

Performance was compared for push based stream event parsing with popular CSV parsing libraries [PapaParse](https://www.papaparse.com) and [csv-parse for Node.js](https://csv.js.org/parse/) as well as pull based processing with `pipeline`, and `for await (...)` using PapaParse.

## Process

### csv-parse

Parsing with csv-parse [link-to-file](importFileCsvEvents.ts) followed excellent stream documentation example method [here](https://csv.js.org/parse/api/stream/). Lines are formatted during each event and pushed to an array for batch database insertion. Passing the parser `cast` option a separate castValues function proved more than twice as slow as performing type converion as part of the formatLine call.

### PapaParse

PapaParse also supports file streams and documents setup options but does not provide complete code examples for their use. Current verion `5.4.0` of PapaParse also proved broken for stream inputs when using the `header` option needed to return parsed lines as an object. Rolling back to version `5.3.0` proved successful.

PapaParse [link-to-file](importFile.ts) performed around 50% faster compared to csv-parse when processing 13M records. (65 seconds vs. 117 seconds when skipping database insertion).

### Pipeline and for await

Pipeline with a for await loop greatly simplifies code complexity when working with streams by not requiring direct management of event listeners. I had high hopes, but `pipeline` `for await (const record of stream) {...}` proved not up to the task. PapaParse w/ pipeline [link-to-file](importPipeline.ts) took 467 seconds compared to just 65 when compared to the event based code above. And this still doesn't include database inserts! This article by Dan Vanderkam [here](https://medium.com/netscape/async-iterators-these-promises-are-killing-my-performance-4767df03d85b) goes into the problem in more detail. Discussion is still active, such as this issue [Performance of for await of (async iteration)](https://github.com/nodejs/node/issues/31979).

### Logging suprises

Visible feedback is important for long running tasks such as this project. Don't, however, take the naive approach of updating progress on every event record. Logging itself has a significant impact on performance.

PapaParse takes 54 seconds to parse 13M records when only logging the completion of each csv file. Adding a real time progress count when a SQL batch size limit is reached increases parse time to 65 seconds. Logging every event took 2446 seconds...40.76 minutes of wasted time.

## Data

### Partial dataset 330k records

Inserted in batches of 9_000 records

| **Parser** | **Notes**                 | **Average runtime** |
| ---------- | ------------------------- | ------------------- |
| PapaParse  | events                    | 4.70                |
| PapaParse  | pipeline & for await(...) | 7.24                |
| csv-parse  | events                    | 5.56                |
| csv-parse  | w/cast values function    | 13.74               |
| csv-parse  | node-gtfs                 | 5.10                |

<!-- - PapaParse events - 4.61, 4.92, 4.58
- PapaParse pipeline - 13.36, 13.47
- csv-parse events - 5.61, 5.58, 5.5
- csv-parse w/cast values function - 13.74
- node-gtfs version of csv-parse events - 5.15, 5.10, 5.06 -->

### Complete dataset GTFS_ALL.ZIP 13M records

| **Parser** | **Notes**                    | **Average Runtime** | **in Minutes** |
| ---------- | ---------------------------- | ------------------- | -------------- |
| PapaParse  | w/ SQL PRAGMA                | 300                 | 5.05           |
| PapaParse  | w/ SQL PRAGMA & transactions | 287                 | 4.78           |
| node-gtfs  | Batch limit: 800             | 1087                | 18.11          |
| node-gtfs  | Batch limit: 8_000           | 510                 | 8.65           |
| node-gtfs  | Batch limit: 20_000          | 397                 | 6.61           |
| node-gtfs  | Batch limit: 30_000          | 406.5               | 6.78           |

<!-- - PapaParse w/ pragma - 296.86, 302.57 seconds ( 5.05 minutes )
- PapaParse wrap w/ pragma & transactions - 277.438, 297.76 seconds
- node-gtfs insert at 800 record default - 1087.14 seconds ( 18.11 minutes )
- node-gtfs insert at 8_000 records - 519.09 seconds, 501 ( 8.65 minutes )
- node-gtfs insert at 20_000 records - 382.40 seconds, 411 ( 6.37 minutes )
- node-gtfs insert at 30_000 records - 402 seconds, 411 ( 6.37 minutes ) -->

### Complete dataset 13M records, skip database insert

| **Parser** | **Notes**                 | **Runtime seconds**             |
| ---------- | ------------------------- | ------------------------------- |
| PapaParse  |                           | 65                              |
| csv-parse  |                           | 118                             |
| PapaParse  | pipeline & for await(...) | 467 :cry:                       |
| PapaParse  | log all 13M events        | 2446 :dizzy_face: 40.76 minutes |
| node-gtfs  | Batch limit: 800          | 213                             |
| node-gtfs  | Batch limit: 8_000        | 171                             |
| node-gtfs  | Batch limit: 20_000       | 162                             |

<!-- - PapaParse - 65.447 seconds
- csv-parse - 117.69 seconds
- PapaParse pipeline for await loop - 466.9 seconds :(
- PapaParse log all 13M events - 2446 seconds :(
- node-gtfs 800 records - 213.34 seconds
- node-gtfs 8_000 records - 170.78 seconds
- node-gtfs 20_000 records - 161.99 seconds -->

### 330k record dataset

| **Parser** | **Notes**                      | **Runtime seconds** |
| ---------- | ------------------------------ | ------------------- |
| PapaParse  | w/ PRAGMA & global transaction | 4.64                |
| PapaParse  | w/ PRAGMA transaction BATCH    | 4.79                |
| PapaParse  | w/ global transaction          | 4.718               |
| PapaParse  | no pragma or transactions      | 4.72                |

<!--
- PapaParse - 4.73, 4.78, 4.66 seconds
- PapaParse w/ pragma - 4.43, 4.789, 4.713 seconds
- PapaParse w/ transaction queries - 4.66, 4.91, 4.8 seconds
- PapaParse w/ global transaction - 4.76, 4.699, 4.695 seconds
- PapaParse w/ prepared values but skip insert - 1.553 seconds -->

## Instructions

### Setup

`npm install`

### Usage

- `npm run build`
- `npm run import`

## Useful resources

- [node-gtfs](https://github.com/blinktaginc/node-gtfs) - Import and Export GTFS transit data into SQLite. Query or change routes, stops, times, fares and more.
<!--

## Author

- Website - [Add your name here](https://www.your-site.com)
- Twitter - [@yourusername](https://www.twitter.com/yourusername)
- LinkedIn Etc - [Add your name here](https://www.your-site.com)

## Acknowledgements -->
