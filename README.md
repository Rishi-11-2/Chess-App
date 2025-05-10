# Chess-App

A real-time multiplayer chess application with time controls and match history tracking.

## Overview

Chess-App is a full-stack web application that allows users to play chess against each other in real-time. It features user authentication, customizable time controls, game rooms, move validation, and match history tracking.

## Features

- **User Authentication**: Secure login and registration via Firebase
- **Real-time Gameplay**: Instant move synchronization using Socket.IO
- **Custom Time Controls**: Choose between 1, 5, or 10 minute games
- **Room System**: Create or join game rooms with unique IDs
- **Match History**: Track and review your past games
- **Responsive UI**: Clean, modern interface with dark/light theme support
- **Game Rules**: Full implementation of chess rules including castling, en passant, and promotion

## Tech Stack

### Client
- React.js + Vite
- chess.js - Chess logic and move validation
- react-chessboard - Chessboard UI component
- Firebase Authentication - User management
- Firebase Firestore - Match history storage
- Socket.IO Client - Real-time communication

### Server
- Node.js + Express
- Socket.IO - WebSocket implementation for real-time gameplay
- UUID - Generating unique room IDs

## Project Structure

```
Chess-App/
├── api/                 # Backend server
│   ├── controllers/     # API controllers
│   ├── routes/          # API routes
│   ├── services/        # Socket.IO and game services
│   ├── config.js        # Server configuration
│   ├── index.js         # WebSocket implementation
│   └── server.js        # Express server setup
│
├── client/              # Frontend React application
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # React components (Chess board, rooms, etc.)
│   │   ├── context/     # React context (Auth, Theme)
│   │   ├── pages/       # Application pages
│   │   ├── App.jsx      # Main application component
│   │   ├── main.jsx     # Application entry point
│   │   ├── socket.js    # Socket.IO client configuration
│   │   └── firebase.js  # Firebase configuration
```

## Setup and Installation

### Prerequisites
- Node.js and npm
- Firebase account

### Backend Setup
1. Navigate to the `api` directory: `cd api`
2. Install dependencies: `npm install`
3. Create a `.env` file based on the example and set your PORT and CLIENT_URL
4. Start the server: `npm run dev`

### Frontend Setup
1. Navigate to the `client` directory: `cd client`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local`
4. Populate all `VITE_FIREBASE_*` values with your Firebase project credentials
5. Start the development server: `npm run dev`

## Using the Application

1. **Register or Log in** to access the application
2. From the home screen, you can:
   - **Create a Game**: Select your preferred time control and create a new room
   - **Join a Game**: Enter a room ID to join an existing game
3. Share the room ID with your opponent
4. Make your moves! The game follows standard chess rules
5. Review your match history in the History section

## Deployment

- The backend can be deployed to any Node.js hosting platform (Heroku, Render, etc.)
- The frontend can be deployed using Firebase Hosting or other static site hosts

## License

This project is open source.
