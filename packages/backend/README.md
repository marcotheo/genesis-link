# ARK-POINT BACKEND

### SETUP REMOTE SQLITE for production or preview environment

1. create a turso account
2. create a turso database `turso db create [database-name]`
3. get connection url by running `turso db show [database-name]`
4. get auth token by running `turso db tokens create [database-name]`

### CREATING MIGRATIONS

1. set DB_URL env
   - for local http://127.0.0.1:8080
   - for tursoDB libsql://db-name.turso.io?authToken=tokenValue
2. run `make migration name={nameOfMigrationFile}`
3. apply the migration details on the file
4. move the file to pkg/sqlc/migrations
5. run `make db-up` to run the db migrations

### GENERATING SQLC code

1. make sure to always apply the migrations first
2. after applying the migrations update the sqlc schema under pkg/sqlc/schema/schema.sql
3. you can add sql queries under pkg/sqlc/queries/queries.sql which will be converted to go code for type safety
4. RUN `sqlc generate` to convert the sqlc schema and queries to go code

### MAKE FILE

- `make build` will build the golang project for aws lambda deployment
- `make db-status` will check its db migration status
- `make db-up` will run the db migrations
- `make db-reset` will reset the migrations

### Docker command for local development

- docker run --rm --env-file ./.env -p 3000:8080 goapp

### LOCAL DEVELOPMENT SETUP

- Prereq

  - install turso cli (https://docs.turso.tech/cli/installation)
  - install `air` used for running golang server locally to have live reloads

1. Running tursodb locally

   - create a `tursolocal` folder anywhere on the project and run the command below
   - Run this command `turso dev --db-file local.db` to run an sqlite file as turso locally
   - add the env variable `DB_URL=http://127.0.0.1:8080` which connect to the local turso db you started

2. run command `make db-up` to run db migrations
3. create the .env file and refer to .env.examples
4. run `air` to start backend app

### PRODUCTION DEPLOYMENT

refer to root readme file
