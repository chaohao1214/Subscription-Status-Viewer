# Subscription Status Viewer

A full-stack web application for managing and viewing Stripe subscription statuses with AWS Amplify Gen 2 backend.

## 🚀 Features
- **User Authentication**: Secure login with AWS Cognito

- **Subscription Management**: View current subscription status and plan details

- **Billing Portal**: Direct integration with Stripe Customer Portal for managing payments

- **Responsive UI**: Modern Material-UI design with custom theming

- **Real-time Data**: Fetch subscription information directly from Stripe API

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

│   │   │   ├── CposButton.tsx

│   │   │   ├── CposCard.tsx

│   │   │   ├── CposContainer.tsx

│   │   │   ├── CposLoadingSpinner.tsx

│   │   │   ├── CposErrorMessage.tsx

│   │   │   └── CposPageHeader.tsx

│   │   └── features/             # Feature-specific components

│   │       └── SubscriptionStatus.tsx

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

│   │   └── create-billing-portal/

│   │       ├── handler.ts        # Generate Stripe portal URL

│   │       ├── resource.ts

│   │       └── package.json

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

┌─────────────────────────────────┐

│      AWS Services               │

│                                 │

│  ┌──────────────────────────┐  │

│  │    AWS Cognito           │  │

│  │    (Authentication)      │  │

│  └──────────────────────────┘  │

│               │                 │

│               ▼                 │

│  ┌──────────────────────────┐  │

│  │   Amplify Functions      │  │

│  │  - getSubscriptionStatus │  │

│  │  - createBillingPortal   │  │

│  └──────────────────────────┘  │

└──────────────┬──────────────────┘

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

 

   Create a `.env.local` file in the root directory:

   ```env

   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

   STRIPE_SECRET_KEY=sk_test_...

   STRIPE_TEST_CUSTOMER_ID=cus_...

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

- ✅ Stripe secret keys stored in environment variables

- ✅ All API calls authenticated via Cognito JWT

- ✅ User isolation: users can only access their own subscription data

- ✅ HTTPS enforced for all communications

- ✅ No sensitive data stored in frontend

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

- [ ] **Analytics**: Amplitude or similar for user behavior tracking

- [ ] **Testing**: Unit and integration tests with Vitest/Jest

- [ ] **Multiple Plans**: Support for tiered subscription management

- [ ] **Usage Metrics**: Track and display usage limits per plan

- [ ] **Email Notifications**: Automated alerts for payment issues

---
## 👤 Author
**Chaohao Zhu**

Built with ❤️ using TypeScript, React, AWS Amplify, and Stripe
