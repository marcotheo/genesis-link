# ARK-POINT FRONTEND

This the frontend project of ark-point using qwik

## LOCAL DEVELOPMENT SETUP

1. make sure from the `root level` to run `pnpm dev` to run sst to create the resources that are gonna be used
2. make sure `backend project` is already done with setup and is running to make sure no errors when running this frontend app
3. run `pnpm i` to install dependencies if not yet done from root
4. add `.env` and `.dev.vars` files with same values and refer to .env.examples for the variables
5. run `pnpm start` to run this frontend app

## Running Cloudflare pages locally for testing

1. run `pnpm serve` to build and run this frontend app locally.
2. log will produce the url like `http://localhost:8787`
3. visit the url to make sure it is working
4. done.

## Production deployment

refer to root readme
