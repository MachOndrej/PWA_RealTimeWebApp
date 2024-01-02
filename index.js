// SERVER FILE
import express from 'express'
import { Server } from "socket.io"
import path, { resolve } from 'path'
import { fileURLToPath } from 'url'
import postgresql from 'pg'

const { Pool } = postgresql;

// dirname setup
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3500
// for admin msgs
const ADMIN = "Admin"

// app is our server
const app = express()

// NOTE: PostgreSQL creates a superuser by default on localhost using the OS username.
const pool = new Pool({
  user: 'postgres',
  database: 'chatapp',
  password: '1234',
  host: '127.0.0.1',      // FOR LOCAL
  //host: 'postgres',       // FOR DOCKER
  port: 5432,
});

// redirected to static public dir
app.use(express.static(path.join(__dirname, "public")))

const expressServer = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})

// state for users
const UsersState = {
  users: [],
  setUsers: function(newUsersArray) {
    this.users = newUsersArray
  }
} 

const io = new Server(expressServer, {
  cors: {
      origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500"]
  }
})

// listen for connection
io.on('connection', socket => {
  console.log(`User ${socket.id} connected`)

  //Upon connection - only to user
  socket.emit('message', buildMsg(ADMIN, "Welcome to chat!"))

  socket.on('enterRoom', async ({name, room}) => {
    // leave previos room
    const prevRoom = getUser(socket.id)?.room

    if (prevRoom) {
      // Leave previous room
      socket.leave(prevRoom)
      io.to(prevRoom).emit('message', buildMsg(ADMIN, `${name} has left the room.`))
      
    }

    // Check if the username is already in use
    const isUsernameTaken = UsersState.users.some(
    user => user.name === name && user.room !== prevRoom
    );
    
    if (isUsernameTaken) {
      // Emit an alert to the specific client
      socket.emit('duplicateUsername', {
        type: 'error',
        alert_message: `Username "${name}" is already in use. Choose a different username.`,
      });
  
      // Returning early to prevent further actions in case of an error
      return;
    }    

    // activate user
    const user = activateUser(socket.id, name, room)

    // Cannot update previous room users list until the state update in activate user
    if (prevRoom) {
      io.to(prevRoom).emit('userList', {
        users: getUsersInRoom(prevRoom)
      })
      
    }
    // join new room
    socket.join(user.room)

    // To user who joined
    socket.emit('message', buildMsg(ADMIN, `You have joined the ${user.room}.`))
    // Display old messages from the database
    try {
      const result = await pool.query(`SELECT name, text, time FROM ${user.room} ORDER BY time`);
      const oldMessages = result.rows;
      oldMessages.forEach(msg => {
        socket.emit('message', buildMsg(msg.name, msg.text, msg.time));
      });
    } catch (error) {
      console.error('Error fetching old messages from database', error);
    }

    // To everyone else
    socket.broadcast.to(user.room).emit('message', buildMsg(ADMIN, `${user.name} has joined the room.`))
    // Update user list for room
    io.to(user.room).emit('userList', {
      users: getUsersInRoom(user.room)
    })
    // Update rooms list for everyone
    io.emit('roomList', {
      rooms: getAllActiveRooms()
    })
    
  })

  
  // when user disconnects - to all others
  socket.on('disconnect', () => {
    const user = getUser(socket.id)
    userLeavesApp(socket.id)

    if (user) {
      io.to(user.room).emit('message', buildMsg(ADMIN, `${user.name} has left the room`))

      io.to(user.room).emit('userList', {
        users: getUsersInRoom(user.room)
      })
      io.emit('roomList', {
        rooms: getAllActiveRooms()
      })
    }

    console.log(`User ${socket.id} disconnected`)

  })

  // Upon connection - to all others (broadcast)
  //socket.broadcast.emit('message', `User ${socket.id.substring(0, 5)} connected`)

  // Listening for a message event
  socket.on('message', async ({ name, text }) => {
    const room = getUser(socket.id)?.room
    const time = new Date();
   
    // vraci jmeno a text zpravy
    if (room) {
      io.to(room).emit('message', buildMsg(name, text));
      //console.log(`Name: ${name}, Text: ${text}, Room: ${room}`);
      // Save the message to the database
      try {
        const result = await pool.query(
          `INSERT INTO ${room} (name, text, time) VALUES ($1, $2, $3)`,
          [name, text, time]
        );
      } catch (error) {
        console.error('Error saving message to database', error);
      }
    }
  })

  // Listen for activity
  socket.on('activity', (name) => {
    const room = getUser(socket.id)?.room
    if (room) {
      socket.broadcast.to(room).emit('activity', name)
    }
  })
})


// FUNCTIONS
function buildMsg(name, text, customTime = null) {
  //const time = new Date().toISOString();
  const time = customTime || new Date().toISOString();

  return {
    name,
    text,
    time
  }
}

// User functions
function activateUser(id, name, room) {
  // If the username is not in use, proceed to activate the user
  const user = {id, name, room}
  UsersState.setUsers([
    ...UsersState.users.filter(user => user.id !== id),   // triple dot wtf???
    user
  ])
  return user
}

// func for leaving app
function userLeavesApp(id) {
  UsersState.setUsers(
    UsersState.users.filter(user => user.id !== id)
  )
}

function getUser(id) {
  return UsersState.users.find(user => user.id === id)
}

function getUsersInRoom(room) {
  return UsersState.users.filter(user => user.room === room)
}

function getAllActiveRooms() {
  return Array.from(new Set(UsersState.users.map(user => user.room)))
}
