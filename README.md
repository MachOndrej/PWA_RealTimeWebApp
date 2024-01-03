# Real-time Chat Web App
Online deploy using Render (without database):  
https://chatapp-4836.onrender.com/  

## Running the PWA_RealTimeWebApp Locally with Docker

To run the PWA_RealTimeWebApp locally using Docker, follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/MachOndrej/PWA_RealTimeWebApp.git
    ```

2. Navigate to the project directory:

    ```bash
    cd PWA_RealTimeWebApp
    ```

3. Use Docker Compose to start the application:

    ```bash
    docker-compose up
    ```

This will download the necessary Docker images, set up the environment, and start the PWA_RealTimeWebApp. Make sure Docker and Docker Compose are installed on your machine before running these commands.

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

## Modification for Local and Docker Execution (branch localdocker)
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
