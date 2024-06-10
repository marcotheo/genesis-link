#!/bin/bash

# Step 1: Build with SAM
sam build

# Step 2: Test locally with SAM
sam local start-api
