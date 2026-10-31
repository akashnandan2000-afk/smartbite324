# SmartBite Canteen 🍔🥤

SmartBite Canteen is a modern, responsive web application designed for campus dining halls and cafeterias. It enables students and staff to browse menus, order food ahead of time, pay seamlessly using **Razorpay Test Mode**, track order status in real time, and pick up orders using generated **QR tokens**.

---

## 🛠️ Tech Stack

### Frontend
- **React.js (v19)** with **Vite** build tooling
- **Tailwind CSS (v4)** for modern responsive UI styling
- **React Router (v7)** for client-side routing
- **Lucide React** for icons
- **Recharts** for sales & peak hour canteen analytics
- **qrcode.react** for instant pickup token generation
- **React Toastify** for real-time notification alerts

### Backend & Cloud Services
- **Firebase Authentication**: User accounts and role management
- **Cloud Firestore**: Real-time database for menu items, customer carts, and placed orders
- **Firebase Cloud Functions**: Serverless backend for Razorpay order generation & webhook verification
- **Razorpay (Test Mode)**: Sandbox payment checkout integration

### Hosting
- **Firebase Hosting** (configuration included in `firebase.json`)
- **Netlify** ready (SPA redirect support)

---

## 📁 Project Structure

```text
smartbite-canteen/
├── public/
│   ├── images/              # Food and hero images
│   ├── logo/                # Canteen logos & brand assets
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/              # Static SVG and image assets
│   ├── components/          # Reusable UI components (MenuCard, etc.)
│   ├── pages/               # Application views
│   │   ├── MenuPage.jsx           # Interactive menu with categories and search
│   │   ├── CartPage.jsx           # Order summary and Razorpay checkout
│   │   ├── OrdersPage.jsx         # Pickup tokens with QR code verification
│   │   └── AdminAnalyticsPage.jsx # Canteen metrics and Recharts graphs
│   ├── layouts/             # Layout templates (Navbar, Footer, MainLayout)
│   ├── styles/              # Global CSS & Tailwind configuration
│   ├── services/            # Firebase SDK & Razorpay checkout services
│   ├── context/             # React Contexts (AuthContext, CartContext)
│   ├── hooks/               # Custom hooks (useOrders, etc.)
│   └── utils/               # Currency & date formatters, mock menu data
├── functions/               # Firebase Cloud Functions (Razorpay backend)
│   ├── index.js
│   └── package.json
├── .env.example             # Environment variable template
├── .env                     # Local environment variables
├── firebase.json            # Firebase Hosting and Functions configuration
├── firestore.rules          # Security rules for Cloud Firestore
├── package.json             # NPM project scripts & dependencies
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18 or higher (v20+ recommended)
- **npm** or **pnpm**

### 2. Installation
Navigate to the project root directory and install dependencies:

```bash
cd smartbite-canteen
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and fill in your Firebase and Razorpay credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Firebase Client SDK Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Razorpay Test Mode Key
VITE_RAZORPAY_KEY_ID=rzp_test_yourKeyHere
```

### 4. Running the Development Server
Start the Vite local development server:

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 💳 Razorpay Test Mode Setup

1. Sign up or log into [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Toggle to **Test Mode** in the dashboard header.
3. Go to **Account & Settings** &rarr; **API Keys** and generate a Test Key ID and Secret.
4. Paste the `rzp_test_...` key into `VITE_RAZORPAY_KEY_ID` in `.env`.
5. Test payments can be executed using any standard Razorpay test card credentials / UPI simulation.

---

## ☁️ Deployment

### Firebase Hosting
```bash
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login to your Firebase account
firebase login

# Build the production bundle
npm run build

# Deploy to Firebase Hosting and Functions
firebase deploy
```

### Netlify
1. Connect your repository to Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in Netlify Site Settings matching `.env.example`.
