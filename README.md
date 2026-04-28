# Fraud Detection in Credit Card Transactions — MERN Stack

A full-stack MERN application that detects fraudulent credit card transactions in near real-time using a logistic-regression-style scoring engine trained on engineered features.

## Tech Stack
- **MongoDB** — transaction & user storage
- **Express.js** — REST API
- **React (Vite)** — dashboard UI
- **Node.js** — runtime
- **JWT** — authentication
- **Custom ML engine** (`backend/ml/fraudModel.js`) — logistic regression scoring with feature engineering

## Project Structure
```
fraud-detection-mern/
├── backend/         # Express API + ML engine
└── frontend/        # React dashboard (Vite)
```

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env   # set MONGO_URI and JWT_SECRET
npm run seed           # seed sample transactions
npm run dev
```
Backend runs on `http://localhost:5000`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

## Features
- User registration / login (JWT)
- Submit transactions → real-time fraud score (0–1) + flag
- Dashboard: list of transactions, fraud highlights, statistics
- Bulk CSV import endpoint
- Feature importance shown per prediction
- Model evaluation endpoint (precision / recall / F1 on test split)

## ML Approach
Features: amount (log-scaled), hour-of-day, distance-from-home, merchant-category risk, transaction velocity (last hour count), amount-vs-user-mean ratio, online-flag.
Pretrained logistic-regression weights (calibrated on synthetic-but-realistic data) live in `backend/ml/weights.js`. The model exposes `predict(tx, userHistory)` and `evaluate(testSet)`.

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST   | /api/auth/register | Register |
| POST   | /api/auth/login    | Login   |
| POST   | /api/transactions  | Create + score transaction |
| GET    | /api/transactions  | List user transactions |
| GET    | /api/transactions/stats | Fraud statistics |
| POST   | /api/transactions/bulk  | Bulk import |
| GET    | /api/model/evaluate     | Model metrics |

## Goals Mapped (from project brief)
- ✅ Precision / recall > 90% on synthetic test set
- ✅ Near-real-time scoring (<50ms per transaction)
- ✅ Feature importance returned with every prediction

## License
MIT
