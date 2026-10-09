const socket = io();

const sessionUsername = document.body.dataset.sessionUser;
let activeContactId = null;
let activeContactUsername = null;
let currentRoom = null;

const chatProfile = document.getElementById("chatprofile");
const chatbox = document.getElementById("chatbox");
const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const mobileBack = document.getElementById("mobileBackToContacts");

// Contact Selection
document.querySelectorAll(".contact-item").forEach((item) => {
  item.addEventListener("click", async () => {
    document.querySelectorAll(".contact-item").forEach((c) => c.classList.remove("bg-[#f4ff26]/20"));
    item.classList.add("bg-[#f4ff26]/20");

    activeContactId = item.dataset.id;
    activeContactUsername = item.dataset.username;

    // Header info
    document.getElementById("activeUserName").textContent = item.dataset.name;
    document.getElementById("activeUserUsername").textContent = `@${item.dataset.username}`;
    document.getElementById("activeUserImg").src = item.dataset.img;

    // Switch view on mobile
    chatProfile.classList.add("hidden", "sm:flex");
    chatbox.classList.remove("hidden");
    chatbox.classList.add("flex");

    // Establish Socket.io room (alphabetical sort of the 2 usernames ensures consistent room name)
    const room = [sessionUsername, activeContactUsername].sort().join("-");
    if (currentRoom) {
      // room switch
    }
    currentRoom = room;
    socket.emit("join_room", room);

    // Load message history from DB
    await loadMessages(activeContactId);
  });
});

if (mobileBack) {
  mobileBack.addEventListener("click", () => {
    chatbox.classList.add("hidden");
    chatProfile.classList.remove("hidden");
  });
}

// Load message history
async function loadMessages(contactId) {
  chatMessages.innerHTML = '<div class="text-center py-6 text-xs text-gray-400">Loading conversation...</div>';
  try {
    const res = await fetch("/message/load", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: contactId }),
    });
    const data = await res.json();
    chatMessages.innerHTML = "";

    if (data.success && data.messagesList && data.messagesList.length > 0) {
      data.messagesList.forEach((m) => {
        appendMessage(m.message, m.senderID === sessionUsername);
      });
      scrollToBottom();
    } else {
      chatMessages.innerHTML = '<div class="text-center py-12 text-xs text-gray-400">No messages yet. Say hello! 👋</div>';
    }
  } catch (err) {
    console.error(err);
    chatMessages.innerHTML = '<div class="text-center py-6 text-xs text-rose-500">Error loading messages.</div>';
  }
}

// Append message bubble
function appendMessage(text, isMe) {
  const emptyState = document.getElementById("chatEmptyState");
  if (emptyState) emptyState.remove();

  const wrap = document.createElement("div");
  wrap.className = `flex w-full ${isMe ? "justify-end" : "justify-start"}`;

  const bubble = document.createElement("div");
  bubble.className = `max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
    isMe ? "bubble-me rounded-br-sm font-medium" : "bubble-them rounded-bl-sm"
  }`;
  bubble.textContent = text;

  wrap.appendChild(bubble);
  chatMessages.appendChild(wrap);
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send Message
async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !activeContactId) return;

  messageInput.value = "";
  appendMessage(text, true);
  scrollToBottom();

  // 1. Emit live via Socket.io
  if (currentRoom) {
    socket.emit("send_message", {
      room: currentRoom,
      sender: sessionUsername,
      message: text,
    });
  }

  // 2. Persist to MongoDB
  try {
    await fetch("/message/m", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiverID: activeContactId,
        message: text,
      }),
    });
  } catch (err) {
    console.error("Failed to save message:", err);
  }
}

if (sendBtn) {
  sendBtn.addEventListener("click", sendMessage);
}

if (messageInput) {
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });
}

// Receive Real-time Socket Message
socket.on("receive_message", (data) => {
  if (data.sender === activeContactUsername) {
    appendMessage(data.message, false);
    scrollToBottom();
  }
});