# Ark Point

- This project represent a new beginning and journey for me as a freelance software developer and I have resolve myself to do a 10 app challenge and this will be the first.
- This project's main goal is to allow users to post jobs and volunteering opportunities and to create a culture where young people in my local area start finding part time work.

## Prerequisite

- turso account
- turso cli installed
- cloudflare account
- aws account
- aws cli installed

## Local development Guide

1. run `pnpm i` to install all dependencies within the project
2. run `pnpm dev` to run sst to create the necessary resources for local development
3. setup backend project (refer to readme file under `packages/backend/README.md` section `### LOCAL DEVELOPMENT SETUP`)
4. setup frontend project (refer to readme file under `packages/frontend/README.md` section `## LOCAL DEVELOPMENT SETUP`)

## Production Deployment Guide

1.  create a turso database (refer to turso documentation for this)
2.  run db migrations on that database (refer to `packages/backend/README.md ### CREATE MIGRATIONS`)
3.  run `pnpm i` to install all deps for the project
4.  create `.env` file refer to `.env.examples` for the variables needed
5.  run `pnpm prod` for production stage deployment or run `pnpm preview` for preview stage deployment
