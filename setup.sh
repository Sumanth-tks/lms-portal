#!/bin/bash

set -e

echo ""
echo "========================================"
echo "LMS Portal - Setup Script (Mac/Linux)"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Download from https://nodejs.org (LTS version)"
    exit 1
fi

echo "✓ Node.js found:"
node --version

echo ""
echo "Step 1: Creating server .env file..."
echo ""

# Create server .env file if it doesn't exist
if [ ! -f "server/.env" ]; then
    cat > server/.env << 'EOF'
DATABASE_URL="postgresql://replace-with-your-neon-connection-string"
JWT_SECRET="your-super-secret-random-key-make-it-long-123456789abcdef"
JWT_REFRESH_SECRET="another-different-secret-key-987654321fedcba"
PORT=5001
CLIENT_URL="http://localhost:3000"
EOF
    echo "✓ Created server/.env"
    echo ""
    echo "IMPORTANT! Edit server/.env and replace:"
    echo "  - DATABASE_URL with your PostgreSQL connection string"
    echo ""
    read -p "Press Enter when you've updated server/.env..."
else
    echo "✓ server/.env already exists (skipping)"
fi

echo ""
echo "Step 2: Creating client .env.local file..."
echo ""

# Create client .env.local file if it doesn't exist
if [ ! -f "client/.env.local" ]; then
    cat > client/.env.local << 'EOF'
NEXT_PUBLIC_API_URL="http://localhost:5001/api"
EOF
    echo "✓ Created client/.env.local"
else
    echo "✓ client/.env.local already exists (skipping)"
fi

echo ""
echo "Step 3: Installing server dependencies..."
cd server
npm install
echo "✓ Server dependencies installed"
cd ..

echo ""
echo "Step 4: Setting up database..."
cd server
echo "Running: npx prisma generate"
npx prisma generate

echo "Running: npx prisma migrate deploy"
npx prisma migrate deploy || npx prisma db push

echo "Running: npm run db:seed"
npm run db:seed
cd ..
echo "✓ Database set up complete"

echo ""
echo "Step 5: Installing client dependencies..."
cd client
npm install
echo "✓ Client dependencies installed"
cd ..

echo ""
echo "========================================"
echo "✓ Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Open server/.env and update DATABASE_URL with your PostgreSQL connection"
echo "   (Get one free from https://neon.com)"
echo ""
echo "2. Start the backend (in this terminal or a new one):"
echo "   cd server"
echo "   npm run dev"
echo ""
echo "3. Start the frontend (in another terminal):"
echo "   cd client"
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "5. Login with:"
echo "   Email: admin@lms.com"
echo "   Password: Admin@123"
echo ""
echo "6. CHANGE THE PASSWORD IMMEDIATELY!"
echo ""
