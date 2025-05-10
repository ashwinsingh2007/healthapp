#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Creating .env file..."
  echo "DEEPGRAM_API_KEY=your_deepgram_api_key" > .env
  echo "OPENAI_API_KEY=your_openai_api_key" >> .env
  echo "Please update the .env file with your actual API keys"
fi

# Build and run the application
echo "Building and starting the application..."
docker-compose up --build 