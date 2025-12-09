# Subscription Status Viewer

A full-stack web application for managing and viewing Stripe subscription statuses with AWS Amplify Gen 2 backend.

## 🚀 Features
- **User Authentication**: Secure login with AWS Cognito and protected routes

- **Subscription Management**: View current subscription status and plan details

- **Billing Portal**: Direct integration with Stripe Customer Portal for managing payments

- **Responsive UI**: Modern Material-UI design with custom theming

- **Real-time Data**: Fetch subscription information directly from the Stripe API

- **Type-Safe**: Full TypeScript implementation across frontend and backend

## 🛠 Tech Stack
### Frontend

- **React 19** - UI framework

- **TypeScript** - Type safety

- **Material-UI (MUI) v7** - Component library

- **React Router v7** - Client-side routing

- **React Query** - Data fetching and caching

- **Vite** - Build tool and dev server

### Backend

- **AWS Amplify Gen 2** - Backend infrastructure

- **AWS Lambda** - Serverless functions (Node.js 20)

- **AWS Cognito** - User authentication

- **Stripe API** - Payment and subscription management

## 📁 Project Structure

 

```

subscription-status-viewer/

├── src/
│   ├── pages/                    # Route components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── SubscriptionPage.tsx
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── CposButton.tsx           # Button with loading state
│   │   │   ├── CposCard.tsx             # Standardized card container
│   │   │   ├── CposContainer.tsx        # Page container wrapper
│   │   │   ├── CposLoadingSpinner.tsx   # Loading indicator
│   │   │   ├── CposErrorMessage.tsx     # Error display with retry
│   │   │   ├── CposPageHeader.tsx       # Page title with actions
│   │   │   ├── CposBadge.tsx            # Status/category badges
│   │   │   ├── CposBox.tsx              # MUI Box wrapper
│   │   │   ├── CposText.tsx             # MUI Typography wrapper
│   │   │   ├── CposStack.tsx            # Vertical stack layout
│   │   │   ├── CposDivider.tsx          # Horizontal divider
│   │   │   ├── CposInfoRow.tsx          # Label-value pair display
│   │   │   ├── CposCardHeader.tsx       # Card header with action
│   │   │   ├── CposFlexBetween.tsx      # Flex space-between layout 
│   │   │   └── index.ts                 # Barrel exports
│   │   ├── views/             # Feature-specific components
│   │   │   └── SubscriptionStatus.tsx
│   │   └── ProtectedRoute.tsx    # Authentication guard
│   ├── types/                    # TypeScript definitions
│   │   ├── subscription.ts
│   │   ├── apiTpyes.ts
│   │   └── amplify.d.ts
│   ├── utils/                    # Helper functions
│   │   └── api.ts
│   ├── config/                   # Configuration
│   │   └── amplify.ts
│   ├── App.tsx                   # Root component
│   ├── main.tsx                  # Entry point
│   └── theme.ts                  # MUI theme configuration
│
├── amplify/
│   ├── auth/                     # Cognito configuration
│   │   └── resource.ts
│   ├── functions/
│   │   ├── get-subscription-status/
│   │   │   ├── handler.ts        # Fetch subscription from Stripe
│   │   │   ├── resource.ts
│   │   │   └── package.json
│   │   ├── create-billing-portal/
│   │   │   ├── handler.ts        # Generate Stripe portal URL
│   │   │   ├── resource.ts       # Lambda configuration
│   │   │   └── package.json
│   │   └── shared/               # Shared utilities
│   │       ├── auth-utils.ts     # JWT validation
│   │       ├── stripe-client.ts  # Stripe SDK singleton
│   │       ├── response-utils.ts # API response helpers
│   │       └── load-env.ts       # Environment loader
│   ├── backend.ts                # Main backend configuration
│   └── package.json
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md

```

## 🏗 Architecture

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   React App     │
│  - Login Page   │
│  - Dashboard    │
│  - Subscription │
└────────┬────────┘
         │
         ▼
┌────────────────────────────────┐
│      AWS Services              │
│                                │
│  ┌──────────────────────────┐  │
│  │    AWS Cognito           │  │
│  │    (Authentication)      │  │
│  └──────────────────────────┘  │
│               │                │
│               ▼                │
│  ┌──────────────────────────┐  │
│  │   Amplify Functions      │  │
│  │  - getSubscriptionStatus │  │
│  │  - createBillingPortal   │  │
│  └──────────────────────────┘  │
└──────────────┬─────────────────┘
               │
               ▼
        ┌──────────────┐
        │  Stripe API  │
        │  (Test Mode) │
        └──────────────┘
```

## 🚦 Getting Started

 

### Prerequisites

 

- Node.js 20+ and npm

- AWS Account

- Stripe Account (Test mode)

- AWS Amplify CLI

 

### Installation

 

1. **Clone the repository**

   ```bash

   git clone <repository-url>

   cd Subscription-Status-Viewer

   ```

 

2. **Install dependencies**

   ```bash

   npm install

   ```
3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Stripe API Keys (Required)
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_TEST_CUSTOMER_ID=cus_...
   # CORS Configuration (Optional)
   # For development: Leave commented out to allow all origins
   # For production: Set to your frontend domain
   # ALLOWED_ORIGIN=https://yourdomain.com
   ```
4. **Deploy Amplify backend**

   ```bash

   npx ampx sandbox

   ```
5. **Start development server**

   ```bash

   npm run dev

   ```
6. **Open browser**

   Navigate to `http://localhost:5173`
## 🔌 API Endpoints

### GET Subscription Status

Fetches the current subscription status for the authenticated user.
**Response:**
```typescript
{

  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'none',

  planName?: string,

  renewalDate?: string,

  renewalPeriod?: 'month' | 'year'
}

```
### POST Create Billing Portal

Creates a Stripe Billing Portal session for the user.

**Request:**

```typescript

{

  returnUrl: string

}

```
**Response:**

```typescript

{

  url: string  // Stripe portal URL

}

```
## 🔑 Key Design Decisions
### 1. Hardcoded Customer Mapping
Currently uses environment variables to map Cognito user IDs to Stripe customer IDs:
```typescript

const CUSTOMER_MAP = {

  "cognito-user-id": process.env.STRIPE_TEST_CUSTOMER_ID

};

```
**Rationale**: Meets MVP requirements quickly without database overhead.
**Future**: Migrate to DynamoDB for production scalability.
### 2. Serverless Architecture

Two separate Lambda functions for subscription operations:

- **Separation of concerns**: Each function has a single responsibility

- **Security**: Stripe secret keys remain server-side only

- **Scalability**: Independent scaling per function

### 3. No Webhook Handlers

Currently polling the Stripe API on demand rather than real-time webhooks.

**Rationale**: Faster MVP development and simpler architecture.

**Future**: Add webhook handlers for real-time subscription updates.

## 🔒 Security
- ✅ **Protected Routes**: ProtectedRoute component prevents unauthorized access to dashboard and subscription pages
- ✅ **Environment Variables**: Stripe secret keys stored server-side with runtime validation
- ✅ **CORS Configuration**: Configurable allowed origins via `ALLOWED_ORIGIN` environment variable
- ✅ **JWT Authentication**: All API calls authenticated via Cognito JWT tokens
- ✅ **User Isolation**: Users can only access their own subscription data (validated server-side)
- ✅ **IAM Permissions**: Lambda functions restricted to authenticated Cognito users only
- ✅ **HTTPS Enforced**: All communications encrypted in transit
- ✅ **No Client Secrets**: Stripe secret keys never exposed to frontend

## 🧪 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```
### Code Style
- TypeScript for type safety
- ESLint for code quality
- Functional components with hooks
- Consistent file naming (PascalCase for components, camelCase for utilities)

## 📦 Build and Deploy

### Build for Production

```bash
npm run build
```
### Deploy to AWS
```bash
npx ampx sandbox delete  # Clean up sandbox
npx ampx pipeline-deploy --branch main  # Deploy to production
```
## 🔮 Future Enhancements
- [ ] **Real-time Updates**: Stripe webhook handlers for instant status changes
- [ ] **Database Integration**: DynamoDB for user-customer mapping
- [ ] **Billing History**: Table view of past invoices and payments
- [ ] **Analytics**: Amplitude or similar for user behaviour tracking
- [ ] **Testing**: Unit and integration tests with Vitest/Jest
- [ ] **Multiple Plans**: Support for tiered subscription management
- [ ] **Usage Metrics**: Track and display usage limits per plan
- [ ] **Email Notifications**: Automated alerts for payment issues
---
## 👤 Author
**Chaohao Zhu**
Built with ❤️ using TypeScript, React, AWS Amplify, and Stripe
