#!/bin/bash
echo "Installing server dependencies..."
cd server
npm ci --omit=dev
echo "Build completed successfully!"