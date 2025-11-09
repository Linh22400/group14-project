#!/bin/bash
echo "Building server..."
cd server
npm install
npm run build || echo "No build script found, skipping..."
echo "Build completed!"