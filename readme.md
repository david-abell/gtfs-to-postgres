# Local PostgreSQL docker and GTFS data import

This is a companion repo for the [Irish public transport tracker](https://github.com/david-abell/transit-tracker).

## Table of Contents

- [Overview](#overview)
  - [Project description](#project-description)
  - [Features](#features)
  - [Useful resources](#useful-resources)
- [Instructions](#instructions)
  - [Setup](#setup)
  - [Usage](#usage)

## Overview

### Project Description

This project includes a docker compose file for hosting a local schedule database and an automated github workflow for streaming updates to a hosted PostgreSQL instance.

## Instructions

### Setup

`npm install`

### Usage

- rename example.env to `.env` DATABASE_URL=postgresql://<user>:<password>@<hostname>/gtfs?sslmode=require
- run `docker compose up --build` to ensure local container is running
- `npm run build`
- `npm run import`
