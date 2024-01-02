# Real-time Chat Web App
Available online at Render (database not working ... yet):
https://chatapp-4836.onrender.com/

This repository contains a real-time chat web application built with the following technologies:

## Backend
- Node.js
- Express
- PostgreSQL

## Frontend
- Vanilla JavaScript

## Real-time Communication
Real-time communication is facilitated through Socket.io, a library built on WebSocket.

## Docker Integration
The project includes a Dockerfile and Docker Compose for easy project composition.

### Docker Usage
To run the project locally or with Docker, make a minor modification in `index.js` (see code section below).

## Database Setup
The basic database configuration is outlined in `init.sql`.

## Modification for Local and Docker Execution
For local and Docker execution, make the following change in `index.js`:

```javascript
const pool = new Pool({
  user: 'postgres',
  database: 'chatapp',
  password: '1234',
  host: '127.0.0.1',      // FOR LOCAL
  //host: 'postgres',       // FOR DOCKER
  port: 5432,
});
