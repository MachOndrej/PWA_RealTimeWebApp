// Establish a WebSocket connection to the server; assumes the server is running on ws://localhost:3500
//const socket = io('ws://localhost:3500')    //adresa deploymentu = definice socketu
const socket = io('https://chatapp-4836.onrender.com')    //adresa deploymentu = definice socketu

// User input
const msgInput = document.querySelector('#message')
const nameInput = document.querySelector('#name')
const chatRoom = document.querySelector('#room')
// Activity event
const activity = document.querySelector('.activity')
const usersList = document.querySelector('.user-list')
const roomList = document.querySelector('.room-list')
const chatDisplay = document.querySelector('.chat-display')

function sendMessage(e) {
    e.preventDefault()
    // check all input values
    if (nameInput.value && msgInput.value && chatRoom.value) {
        // object with input (sender and massage)
        socket.emit('message', {
            name: nameInput.value,
            text: msgInput.value,
        })
        msgInput.value = ""
    }
    msgInput.focus()
}


function enterRoom(e) {
    console.log('enter room');
    e.preventDefault()
    if (nameInput.value && chatRoom.value) {
    
        socket.emit('enterRoom', {
            name: nameInput.value,
            room: chatRoom.value
        })
    }
}

// SELECTORS
// message selector
document.querySelector('.form-msg')
    .addEventListener('submit', sendMessage)
// enter room selector
document.querySelector('.form-join')
    .addEventListener('submit', enterRoom)
//listener for keypress activity (shows typing user)
msgInput.addEventListener('keypress', () => {
    socket.emit('activity', nameInput.value)
})

// Listen for messages 
socket.on("message", (data) => {
    activity.textContent = ""
    const { name, text, time } = data
    const li = document.createElement('li')
    li.className = 'post'
    // post left side (current user)
    if (name === nameInput.value) li.className = 'post post--left'
    // post right side (other users)
    if (name !== nameInput.value && name !== 'Admin') li.className = 'post post--right'
    // HTML structure of message 
    if (name !== 'Admin') {
        li.innerHTML = `<div class="post__header ${name === nameInput.value
            ? 'post__header--user'
            : 'post__header--reply'
            }">
        <span class="post__header--name">${name}</span> 
        <span class="post__header--time">${time}</span> 
        </div>
        <div class="post__text">${text}</div>`
    } else {
    //handle admin post
        li.innerHTML = `<div class="post__text">${text}</div>`
    }
    // append li to ul (chat-display)
    document.querySelector('.chat-display').appendChild(li)

    chatDisplay.scrollTop = chatDisplay.scrollHeight
})


// Display user typing
let activityTimer
socket.on('activity', (name) => {
    activity.textContent = `${name} is typing...`
    // Clear after 1.5 seconds
    clearTimeout(activity)
    activityTimer = setTimeout(() => {
        activity.textContent = ""
    }, 1500)
})

socket.on('userList', ({ users }) => {
    showUsers(users)
})

socket.on('roomList', ({ rooms }) => {
    showRooms(rooms)
})

// On the client side 
socket.on('duplicateUsername', ({ type, alert_message }) => {
    // Alert using SweetAlert
    Swal.fire({
        icon: "warning",
        text: `${alert_message}`,
        confirmButtonText: 'OK ',
        customClass: {
            confirmButton: 'custom-swal-confirm-button'
        }
      });
  });
  

// Show users in room
function showUsers(users) {
    if (!Array.isArray(users)) {
        return;
    }
    // Extract the "name" property from each object
    const namesArray = users.map(obj => obj.name);
    
    // Concatenate names with commas
    const namesString = namesArray.join(', ');
    
    //console.log("Joined Names:", namesString);
    usersList.innerHTML = `<em><b>Users in chatroom "${chatRoom.value}":</b> ${namesString}</em>`
 
}

// Show rooms
function showRooms(rooms) {
    //roomList.textContent = ''
    // Extract the "name" property from each object
    const roomsArrayString = rooms.join(', ');
    
    //console.log("Joined Names:", namesString);
    roomList.innerHTML = `<em><b>Active Rooms:</b>  ${roomsArrayString}</em>`

}
