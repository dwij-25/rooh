const socket = io();

// Elements
const therapistBtn = document.getElementById("therapist-btn");
const studentBtn = document.getElementById("student-btn");
const therapistInterface = document.getElementById("therapist-interface");
const studentInterface = document.getElementById("student-interface");
const chatInterface = document.getElementById("chat-interface");

const therapistForm = document.getElementById("therapist-form");
const therapistList = document.getElementById("therapist-list");
const refreshBtn = document.getElementById("refresh-btn");

const chatDisplay = document.querySelector(".chat-display");
const msgForm = document.getElementById("msg-form");
const msgInput = document.getElementById("message");
const chatRoomTitle = document.getElementById("chat-room-title");

let currentRoom = null;
let role = null;

// Role selection
therapistBtn.onclick = () => {
  role = "therapist";
  therapistInterface.classList.remove("hidden");
  studentInterface.classList.add("hidden");
};

studentBtn.onclick = () => {
  role = "student";
  studentInterface.classList.remove("hidden");
  therapistInterface.classList.add("hidden");
  socket.emit("getTherapists");
};

// Therapist creates room
therapistForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("therapist-name").value;
  const room = document.getElementById("therapist-room").value;
  const time = document.getElementById("therapist-time").value;

  socket.emit("createRoom", { name, room, time });
  currentRoom = room;

  chatRoomTitle.textContent = `Room: ${room}`;
  chatInterface.classList.remove("hidden");
});

// Student refreshes therapist list
refreshBtn.onclick = () => socket.emit("getTherapists");

// Display therapists
socket.on("therapistList", (therapists) => {
  therapistList.innerHTML = "";
  therapists.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = `${t.name} | Room: ${t.room} | Available at: ${t.time}`;

    const now = new Date();
    const availableTime = new Date();
    const [hours, minutes] = t.time.split(":");
    availableTime.setHours(hours, minutes);

    if (availableTime > now) {
      const bookBtn = document.createElement("button");
      bookBtn.textContent = "Book";
      bookBtn.onclick = () => {
        const student = prompt("Enter your name to book:");
        if (student) {
          socket.emit("bookTherapist", { student, room: t.room });
        }
      };
      li.appendChild(bookBtn);
    } else {
      const joinBtn = document.createElement("button");
      joinBtn.textContent = "Join";
      joinBtn.onclick = () => joinRoom(t.room);
      li.appendChild(joinBtn);
    }

    therapistList.appendChild(li);
  });
});

// Booking confirmation
socket.on("bookingConfirmed", ({ student, room }) => {
  alert(`✅ ${student}, your session in room "${room}" has been booked!`);
});

// Join room
function joinRoom(room) {
  currentRoom = room;
  chatRoomTitle.textContent = `Room: ${room}`;
  chatInterface.classList.remove("hidden");
  socket.emit("joinRoom", { room, role });
}

// Send message
msgForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (msgInput.value && currentRoom) {
    socket.emit("chatMessage", { room: currentRoom, msg: msgInput.value });
    msgInput.value = "";
  }
});

// Display messages
socket.on("message", ({ user, msg }) => {
  const li = document.createElement("li");
  li.textContent = `${user}: ${msg}`;
  chatDisplay.appendChild(li);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
});
