# PS2 - StackIt – A Minimal Q&A Forum Platform

A full-stack Q&A forum platform built with Node.js, Express, SQLite, and React.

## Features

- User registration and authentication
- Ask questions with title and description
- Answer questions
- View all questions and individual question details
- Responsive design

## Tech Stack

**Backend:**
- Node.js with Express
- SQLite database
- JWT authentication
- bcryptjs for password hashing

**Frontend:**
- React with React Router
- Axios for API calls
- Modern CSS styling

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/Varshith-JV-1410/Oodo-Hackathon-25-PS2.git
cd Oodo-Hackathon-25-PS2
```

2. Install backend dependencies
```bash
npm install
```

3. Install frontend dependencies
```bash
cd client
npm install
cd ..
```

### Running the Application

1. Start the backend server (from root directory):
```bash
node server/server.js
```
The backend will run on http://localhost:5000

2. Start the frontend development server (in a new terminal):
```bash
cd client
npm start
```
The frontend will run on http://localhost:3000

### Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **View Questions**: Browse all questions on the home page
3. **Ask Question**: Click "Ask Question" to create a new question (requires login)
4. **Answer Questions**: Click on any question to view details and post answers (requires login)

## Project Structure

```
├── server/
│   └── server.js          # Backend server with API routes
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # Authentication context
│   │   └── App.js         # Main App component
│   └── package.json
├── package.json           # Backend dependencies
├── .env                   # Environment variables
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Questions
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get single question with answers
- `POST /api/questions` - Create new question (requires auth)

### Answers
- `POST /api/questions/:id/answers` - Post answer to question (requires auth)

## Development

The application uses:
- SQLite for database (automatically created on first run)
- JWT tokens for authentication
- React Router for navigation
- Responsive CSS for mobile-friendly design

## Demo Video

After deployment, record a demo showing:
1. User registration
2. Asking a question
3. Answering a question

