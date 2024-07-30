# GENESIS LINK BACKEND

### SETUP LOCAL SQLITE

1. create a folder where you save the db file for persistency (example for db file `local.db`)
2. under that folder run `turso dev --db-file local.db`

### SETUP REMOTE SQLITE

1. create a turso account
2. create a turso database `turso db create [database-name]`
3. get connection url by running `turso db show [database-name]`
4. get auth token by running `turso db tokens create [database-name]`

### CREATING MIGRATIONS

1. set DB_URL env
   - for local http://127.0.0.1:8080
   - for tursoDB libsql://db-name.turso.io?authToken=tokenValue
2. run goose create {file-name} sql
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
