# Genesis Link

- This project represent a new beginning and journey for me as a freelance software developer and I have resolve myself to do a 10 app challenge and this will be the first.

- This project's main goal is to allow users to post jobs and volunteering opportunities and to create a culture where young people in my local area start finding part time work.

## ENV VARIABLES

- refer to .env.examples

## Local development Guide

- Prereq

  - install turso cli (https://docs.turso.tech/cli/installation)

1. Running tursodb locally

   - Run this command `turso dev --db-file local.db`
   - Under `packages/backend` add the env variable `DB_URL=http://127.0.0.1:8080` which connect to the local turso db you started

2. Make sure to read the .env.examples for each project under packages folder which will tell you what env variables are required for the project to run

## PRODUCTION DEPLOYMENT

1. build all golang project code (run `make build`) (can be automated later if have a pipeline)

   - packages/backend

   - packages/events

2. run sst dev
