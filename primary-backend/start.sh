#!/bin/bash

echo "🚀 Starting Artisan Connect Backend..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp env.example .env
    echo "⚠️  Please update .env file with your actual configuration values"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start Docker containers
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Push database schema
echo "🗄️  Setting up database schema..."
npm run db:push

# Start the development server
echo "🎯 Starting development server..."
npm run dev
