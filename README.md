# Unicorn Web Services (UWS) - Cloud Platform

A comprehensive cloud services platform built with Next.js 14, TypeScript, and modern web technologies. UWS provides a complete multi-tenant cloud management experience with enterprise-grade authentication and company management.

## ✨ Features

### 🔐 Authentication & Multi-Tenancy

- **Firebase Authentication** with email/password and Google OAuth
- **Multi-tenant architecture** with company-based resource organization
- **Role-based access control** (Owner, Admin, Developer, Viewer)
- **Company management** with user invitations and permissions
- **Secure user profiles** with company switching capabilities

### ☁️ Cloud Services (10 Complete Services)

- **Compute**: Virtual machines and container management
- **Storage**: Object and block storage solutions
- **Lambda**: Serverless function deployment
- **Database**: Managed SQL database services
- **Queue**: Message queuing and processing
- **Secrets**: Secure secret and configuration management
- **NoSQL**: Managed NoSQL database services
- **IAM**: Identity and access management
- **Monitoring**: Application performance monitoring
- **Billing**: Usage tracking and billing management

### 🎨 User Experience

- **Modern UI** with shadcn/ui components and Tailwind CSS
- **Dark/Light themes** with CSS custom properties
- **Responsive design** optimized for all devices
- **Smooth animations** with Framer Motion
- **Real-time dashboard** with live statistics and metrics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Firebase project with Authentication and Firestore enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd uws
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Firebase configuration**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase config values
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password and Google providers
3. Create a Firestore database in production mode
4. Copy your Firebase config to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Company members can read/write company data
    match /companies/{companyId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in resource.data.members;
    }
  }
}
```

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: Firebase Auth with multi-provider support
- **Database**: Firestore for user and company data
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React icon library

### Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── login/          # Authentication pages
│   ├── setup/          # Company onboarding
│   ├── company/        # Company management
│   └── [services]/     # Individual service pages
├── components/         # Reusable React components
│   ├── ui/            # shadcn/ui base components
│   └── dashboard-layout.tsx
├── lib/               # Core utilities and contexts
│   ├── firebase.ts    # Firebase configuration
│   └── auth-context.tsx # Authentication context
```

### Authentication Flow

1. **Login/Register**: Users authenticate via Firebase Auth
2. **Profile Creation**: User profile stored in Firestore
3. **Company Setup**: New users create or join companies
4. **Role Assignment**: Users get roles within companies
5. **Dashboard Access**: Role-based access to services

## 🔒 Security Features

- **Authentication**: Secure Firebase Authentication
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Firestore security rules
- **Session Management**: Automatic token refresh
- **Multi-tenancy**: Company-isolated data access

## 📱 User Roles & Permissions

| Role          | Permissions                                        |
| ------------- | -------------------------------------------------- |
| **Owner**     | Full company access, billing, user management      |
| **Admin**     | Manage resources, invite users, configure services |
| **Developer** | Create and manage resources, limited user access   |
| **Viewer**    | Read-only access to company resources              |

## 🎯 Getting Started Guide

### First-Time Setup

1. **Register/Login** with email or Google account
2. **Create Company** with name and unique slug
3. **Choose Plan** (Starter/Professional/Enterprise)
4. **Invite Team** members with appropriate roles
5. **Explore Services** and start managing resources

### Company Management

- **Dashboard**: Overview of company metrics and activity
- **Team**: Manage members, roles, and invitations
- **Billing**: Track usage and manage subscriptions
- **Settings**: Configure company information and preferences

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Services

1. Create service page in `src/app/[service]/page.tsx`
2. Add service configuration to navigation
3. Implement CRUD operations with company context
4. Add role-based access controls

## 🌟 Contributing

We welcome contributions! Please read our contributing guidelines and code of conduct.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Unicorn Web Services** - _Driven by Passion, Not Profit_ 🦄
