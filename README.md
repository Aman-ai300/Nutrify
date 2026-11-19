# 🥗 Nutrify

Nutrify is a full-stack nutrition tracking application that allows users to search for food items, track their daily food consumption, and monitor nutritional intake.

## Features

- User registration and login.
- Search for food items.
- View nutritional information.
- Track food consumption and quantity.
- Calculate daily nutrition totals.

## Tech Stack

- **Frontend:** React.js, Vite, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT, bcryptjs

## Project Structure

```text
Nutrify/
├── frontend/
├── backend/
└── README.md
```

## Setup

**1. Clone the repository**

```bash
git clone https://github.com/Aman-ai300/Nutrify.git
cd Nutrify
```

**2. Start the backend**

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and configure your JWT secret.

```bash
npm start
```

**3. Start the frontend** 

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Database

- Database: `nutrify`
- Collections: `users`, `foods`, `trackings`
- Requires MongoDB running locally at `mongodb://localhost:27017`.

## Author

**Aman**

GitHub: [https://github.com/Aman-ai300](https://github.com/Aman-ai300)
