#!/bin/bash
set -e

APP_DIR="/app/cavree"
REPO_URL="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}.git"
BRANCH="main"

echo "=== Cavree Deployment Script ==="

# Update code
cd "$APP_DIR"
if [ -d ".git" ]; then
  git fetch origin
  git reset --hard origin/$BRANCH
else
  git clone "$REPO_URL" "$APP_DIR"
fi

# Create .env from environment variables
if [ -f ".env" ]; then
  cp .env .env.backup.$(date +%s)
fi

# Write env file
cat > .env <<EOF
NODE_ENV=production
DATABASE_URL=${DATABASE_URL}
NEXTAUTH_URL=${NEXTAUTH_URL}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
AWS_REGION=${AWS_REGION}
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
S3_BUCKET_NAME=${S3_BUCKET_NAME}
CLOUDFRONT_URL=${CLOUDFRONT_URL}
MAIN_DOMAIN=${MAIN_DOMAIN}
NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
FROM_EMAIL=${FROM_EMAIL}
ADMIN_EMAIL=${ADMIN_EMAIL}
EOF

# Build and restart
export COMPOSE_FILE=docker-compose.prod.yml
docker compose down --remove-orphans
docker compose build --no-cache
docker compose up -d

# Cleanup old images
docker image prune -af --filter "until=24h" || true

echo "=== Deployment complete ==="
