#!/bin/bash

echo "Currently in $PWD"

# Checking if source code folder is present in the repository
DIR="./src"

if ls "$DIR"; then
   echo "$DIR is present"
else
   echo "$DIR not found or could not be accessed"
   echo "Exitting script, please add ./src folder"
   exit 1
fi

# Checking if node is installed

echo "Checking Node.js installation"

if command -v node; then
   echo "Node.js installation found"
   NODE_VER=$(node -v)
   echo "Node.js version: $NODE_VER"
else
   echo "Node.js not found"
   echo "Script exitted, fix Node.js installation"
   exit 1
fi

# Checking if npm is installed

echo "Checking npm installation"

if command -v npm; then
   echo "npm installation found"
   npm_ver=$(npm -v)
   echo "npm version: $npm_ver"
else
   echo "npm not found"
   echo "Script exitted, fix npm installation"
   exit 1
fi

# Creating logs file

echo "Creating logs file"

touch ./logs.txt

# Idempotency check: Kill existing npm start processes before starting new ones
echo "Stopping any existing application instances..."
pkill -f "npm start" || echo "No existing instances found. Proceeding."

# Running npm install and npm start in the background and logging into the logs.txt file

echo "Running commands and logging"

nohup sh -c "npm install && npm start" > ./logs.txt 2>&1 &

echo "Started application"