const socket = io();

const chattingarea = document.getElementById("chattingarea");
const form = document.getElementById("confessionForm");
const messageInput = document.getElementById("message");

// Scroll to bottom on load
chattingarea.scrollTop = chattingarea.scrollHeight;

// Submit confession
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;

  messageInput.value = "";

  try {
    const res = await fetch("/anyonomousChat/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    if (data.success) {
      // Emit via socket
      socket.emit("anonymous_message", {
        id: data.id,
        message: text,
        timestamp: new Date().toISOString(),
        upvotes: 0,
      });
    }
  } catch (err) {
    console.error("Confession post error:", err);
  }
});

// Real-time new confession received
socket.on("new_anonymous_message", (data) => {
  const card = document.createElement("div");
  card.className = "confession-card bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-start justify-between gap-3";
  card.innerHTML = `
    <div class="flex items-start gap-3 flex-1">
      <div class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-base">
        🕵️
      </div>
      <div class="flex flex-col flex-1">
        <span class="text-sm text-gray-800 leading-relaxed font-normal">${escapeHtml(data.message)}</span>
        <span class="text-[10px] text-gray-400 mt-1">Just now</span>
      </div>
    </div>
    <button onclick="upvoteMessage('${data.id}', this)" 
      class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 hover:bg-[#f4ff26] text-xs font-semibold text-gray-700 transition-colors flex-shrink-0">
      <span>▲</span>
      <span class="upvote-count">${data.upvotes || 0}</span>
    </button>
  `;
  chattingarea.appendChild(card);
  chattingarea.scrollTop = chattingarea.scrollHeight;
});

// Upvote handler
async function upvoteMessage(id, btn) {
  try {
    const res = await fetch(`/anyonomousChat/upvote/${id}`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      btn.querySelector(".upvote-count").textContent = data.upvotes;
      btn.classList.add("bg-[#f4ff26]", "text-gray-900");
    }
  } catch (err) {
    console.error("Upvote error:", err);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.innerText = str;
  return div.innerHTML;
}