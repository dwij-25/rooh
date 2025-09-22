const socket = io(); // Connects automatically

// DOM Elements
const joinForm = document.querySelector('.form-join');
const msgForm = document.querySelector('.form-msg');
const msgInput = document.querySelector('#message');
const nameInput = document.querySelector('#name');
const roomInput = document.querySelector('#room');

const joinSection = document.querySelector('.join-section') || document.querySelector('main'); 
const chatSection = document.querySelector('.chat-section');
const chatDisplay = document.querySelector('.chat-display');
const activity = document.querySelector('.activity');
const usersList = document.querySelector('.user-list');
const roomList = document.querySelector('.room-list');
const roomTitle = document.getElementById('roomTitle');

let currentName = '';
let currentRoom = '';

// ------------------- JOIN ROOM -------------------
joinForm.addEventListener('submit', e => {
  e.preventDefault();

  currentName = nameInput.value.trim();
  currentRoom = roomInput.value.trim();

  if (!currentName || !currentRoom) return;

  socket.emit('enterRoom', { name: currentName, room: currentRoom });

  // Switch UI: hide join, show chat
  if (joinSection) joinSection.classList.add('hidden');
  chatSection.classList.remove('hidden');
  roomTitle.textContent = `Room: ${currentRoom}`;
});

// ------------------- SEND MESSAGE -------------------
msgForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!msgInput.value.trim()) return;

  socket.emit('message', {
    name: currentName,
    text: msgInput.value
  });

  msgInput.value = '';
  msgInput.focus();
});

// Typing activity
msgInput.addEventListener('keypress', () => {
  socket.emit('activity', currentName);
});

// ------------------- SOCKET EVENTS -------------------
socket.on('message', ({ name, text, time }) => {
  activity.textContent = '';

  const li = document.createElement('li');
  li.classList.add('message');

  if (name === currentName) {
    li.classList.add('self');
  } else if (name !== 'Admin') {
    li.classList.add('other');
  } else {
    li.classList.add('admin');
  }

  li.innerHTML =
    name === 'Admin'
      ? `<div class="post__text">${text}</div>`
      : `
        <div><strong>${name}</strong></div>
        <div>${text}</div>
        <div class="meta">${time}</div>
      `;

  chatDisplay.appendChild(li);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
});

// Activity indicator
let activityTimer;
socket.on('activity', name => {
  activity.textContent = `${name} is typing...`;

  clearTimeout(activityTimer);
  activityTimer = setTimeout(() => {
    activity.textContent = '';
  }, 2000);
});

// User list
socket.on('userList', ({ users }) => {
  usersList.textContent = '';
  if (users && users.length > 0) {
    usersList.innerHTML = `<em>Users in ${currentRoom}:</em> ${users.map(u => u.name).join(', ')}`;
  }
});

// Room list
socket.on('roomList', ({ rooms }) => {
  roomList.textContent = '';
  if (rooms && rooms.length > 0) {
    roomList.innerHTML = `<em>Active Rooms:</em> ${rooms.join(', ')}`;
  }
});

