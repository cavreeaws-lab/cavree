# Cavree - Luxury Fashion Marketplace

A full-stack Next.js 14 eCommerce platform with multi-role support (Customer, Franchisee, Super Admin), multi-step checkout with Razorpay integration, and AWS deployment infrastructure.

## Features

- **Multi-Role Authentication**: Customer, Franchisee, and Super Admin roles
- **Product Catalog**: Categories, variants, images, and inventory management
- **Shopping Cart**: Zustand-powered cart with persistent state
- **Multi-Step Checkout**: Shipping address, payment method (Razorpay/COD), order review
- **Order Management**: Real-time status tracking for all roles
- **Franchise Panel**: Dashboard, products, orders, customers, reports
- **Super Admin Panel**: Platform-wide analytics, franchise management, user control
- **Responsive Design**: Mobile-first with Tailwind CSS and Cavree design tokens

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with bcrypt
- **State Management**: Zustand
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: shadcn/ui + Lucide icons
- **Payments**: Razorpay
- **Deployment**: Docker + AWS ECS Fargate + RDS + S3 + CloudFront

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- npm or yarn

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your values:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/cavree?schema=public"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
RAZORPAY_KEY_ID="your-razorpay-key"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
AWS_REGION="ap-south-1"
AWS_S3_BUCKET_NAME="cavree-images"
```

4. Initialize the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Seed the database:
```bash
npx prisma db seed
```

6. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Default Login Credentials

- **Super Admin**: `superadmin@cavree.com` / `SuperAdmin123!`
- **Franchise**: `franchise@cavree.com` / `Franchise123!`
- **Customer**: `customer@example.com` / `Customer123!`

## Project Structure

```
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── page.tsx       # Homepage
│   │   ├── shop/          # Product listing
│   │   ├── product/       # Product detail
│   │   ├── cart/          # Shopping cart
│   │   ├── checkout/      # Multi-step checkout
│   │   ├── auth/          # Login/register
│   │   ├── account/       # Customer account pages
│   │   ├── admin/         # Franchise admin panel
│   │   ├── super-admin/   # Super admin panel
│   │   └── api/           # API routes
│   ├── components/        # Reusable components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and configs
│   └── store/             # Zustand stores
├── terraform/             # AWS infrastructure
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── .github/workflows/      # CI/CD pipeline
│   └── deploy.yml
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Local development stack
└── next.config.js          # Next.js configuration
```

## Docker Deployment

### Local Development with Docker Compose

```bash
docker-compose up --build
```

This will start both the Next.js app and PostgreSQL database.

### Production Build

```bash
docker build -t cavree-app .
```

## AWS Deployment

### Prerequisites

- AWS CLI configured
- Terraform installed
- GitHub repository with Actions enabled

### Setup Steps

1. **Create Terraform state bucket**:
```bash
aws s3 mb s3://cavree-terraform-state --region ap-south-1
```

2. **Initialize and apply Terraform**:
```bash
cd terraform
terraform init
terraform apply
```

3. **Configure GitHub Actions secrets**:
   - `AWS_ACCOUNT_ID`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

4. **Push to main branch** to trigger automatic deployment.

## Payment Integration

The platform supports:
- **Razorpay**: Online card/UPI/wallet payments
- **Cash on Delivery (COD)**: Available for eligible orders

Configure your Razorpay keys in environment variables.

## License

Copyright (c) 2024 Cavree. All rights reserved.
