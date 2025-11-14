/* -------------------------
                  Background: animated particles
                ---------------------------*/
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");
let w = (canvas.width = innerWidth),
  h = (canvas.height = innerHeight);
window.addEventListener("resize", () => {
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;
  initParticles();
});

let particles = [];

function initParticles(count = 80) {
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1 + Math.random() * 3,
      hue: 230 + Math.random() * 80,
    });
  }
}

function drawBG() {
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "rgba(120,50,200,0.06)");
  g.addColorStop(1, "rgba(40,20,120,0.03)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = w;
    if (p.x > w) p.x = 0;
    if (p.y < 0) p.y = h;
    if (p.y > h) p.y = 0;
    ctx.beginPath();
    ctx.fillStyle = `hsla(${p.hue},80%,65%,0.12)`;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i],
        b = particles[j];
      const dx = a.x - b.x,
        dy = a.y - b.y,
        d = dx * dx + dy * dy;
      if (d < 9000) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(120,80,220,0.04)";
        ctx.lineWidth = 1;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawBG);
}
initParticles();
drawBG();

/* -------------------------
          Chat system + storage
        ---------------------------*/
const chatListEl = document.getElementById("chatList");
const chatWindow = document.getElementById("chatWindow");
const sessionTitle = document.getElementById("sessionTitle");
const sessionSub = document.getElementById("sessionSub");
const emptyView = document.getElementById("emptyView");
const statusInfo = document.getElementById("statusInfo");
const sendBtn = document.getElementById("sendBtn");
const textInput = document.getElementById("textInput");

let state = {
  chats: [],
  activeId: null,
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function nowTS() {
  return new Date().toISOString();
}

function save() {
  localStorage.setItem("neonai_chats_v3", JSON.stringify(state.chats));
}

function load() {
  const raw = localStorage.getItem("neonai_chats_v3");
  state.chats = raw ? JSON.parse(raw) : [];
  if (state.chats.length) state.activeId = state.chats[0].id;
}
load();

function renderChatList(filter = "") {
  chatListEl.innerHTML = "";
  const filtered = state.chats.filter((c) =>
    c.title.toLowerCase().includes(filter.toLowerCase())
  );
  filtered.forEach((c) => {
    const el = document.createElement("div");
    el.className = "chat-item" + (c.id === state.activeId ? " active" : "");
    el.dataset.id = c.id;
    // show title + small preview only (no timestamps)
    el.innerHTML = `<div style="display:flex;flex-direction:column"><div class="title">${escapeHtml(
      c.title
    )}</div><div class="preview">${
      c.messages.length
        ? escapeHtml(c.messages[c.messages.length - 1].text.slice(0, 60))
        : "No messages yet"
    }</div></div>`;
    el.onclick = () => openChat(c.id);
    chatListEl.appendChild(el);
  });
  if (!filtered.length)
    chatListEl.innerHTML =
      '<div style="color:rgba(232,240,255,0.5);padding:14px">No chats yet — click New Chat</div>';
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function openChat(id) {
  state.activeId = id;
  renderChatList();
  renderActive();
  save();
}

function createChat(title = "New chat") {
  const c = {
    id: uid(),
    title,
    messages: [],
    unread: 0,
  };
  state.chats.unshift(c);
  state.activeId = c.id;
  renderChatList();
  renderActive();
  save();
}

function deleteChat(id) {
  const idx = state.chats.findIndex((c) => c.id === id);
  if (idx > -1) state.chats.splice(idx, 1);
  state.activeId = state.chats[0]?.id ?? null;
  renderChatList();
  renderActive();
  save();
}

function renameChat(id, newTitle) {
  const c = state.chats.find((x) => x.id === id);
  if (c) {
    c.title = newTitle;
    renderChatList();
    renderActive();
    save();
  }
}

function renderActive() {
  const c = state.chats.find((x) => x.id === state.activeId);
  if (!c) {
    sessionTitle.textContent = "Welcome";
    sessionSub.textContent = "Select or create a chat";
    chatWindow.innerHTML =
      '<div class="empty">No messages yet. Use the mic or type to start.</div>';
    return;
  }
  sessionTitle.textContent = c.title;
  sessionSub.textContent = c.messages.length
    ? `${c.messages.length} messages`
    : "No messages yet";
  renderMessages(c.messages);
}

function renderMessages(messages) {
  chatWindow.innerHTML = "";
  if (!messages.length) {
    chatWindow.appendChild(emptyView);
    return;
  }
  messages.forEach((m) => {
    const el = document.createElement("div");
    el.className = "msg " + (m.role === "user" ? "user" : "bot");
    el.innerHTML = `<div>${escapeHtml(m.text)}</div>`; // removed timestamp/meta
    chatWindow.appendChild(el);
  });
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* UI wiring */
document
  .getElementById("newChatBtn")
  .addEventListener("click", () =>
    createChat("Chat " + (state.chats.length + 1))
  );
document.getElementById("renameBtn").addEventListener("click", () => {
  const c = state.chats.find((x) => x.id === state.activeId);
  if (!c) return alert("No active chat");
  const t = prompt("Rename chat", c.title);
  if (t) renameChat(c.id, t);
});
document.getElementById("delChatBtn").addEventListener("click", () => {
  if (!state.activeId) return;
  if (confirm("Delete this chat?")) deleteChat(state.activeId);
});
document
  .getElementById("searchInput")
  .addEventListener("input", (e) => renderChatList(e.target.value));
sendBtn.addEventListener("click", onSend);
textInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    onSend();
  }
});

/* Append messages & AI logic */
function appendMessageToActive(role, text) {
  let chat = state.chats.find((x) => x.id === state.activeId);
  if (!chat) {
    createChat("Chat " + (state.chats.length + 1));
    chat = state.chats.find((x) => x.id === state.activeId);
  }
  chat.messages.push({
    role,
    text,
    ts: nowTS(),
  });
  renderActive();
  save();
}

/* Typing indicator */
let typingEl = null;

function showTyping() {
  const el = document.createElement("div");
  el.className = "typing";
  el.innerHTML =
    '<div style="font-weight:700">AI is typing</div><div style="display:flex"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
  chatWindow.appendChild(el);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  typingEl = el;
}

function hideTyping() {
  if (typingEl) {
    typingEl.remove();
    typingEl = null;
  }
}

/* Simulated fetchAIReply - replace for production */
async function fetchAIReply(userText) {
  try {
    const response = await fetch("http://127.0.0.1:5000/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok: " + response.status);
    }
    const data = await response.json();
    // Expect backend to return { reply: "..." }
    return data && data.reply ? data.reply : String(data);
  } catch (error) {
    console.error("fetchAIReply error:", error);
    // propagate error so caller can handle it
    throw error;
  }
}

/* Send flow: send user message, show typing, get reply, stream it */
async function onSend() {
  const text = textInput.value.trim();
  if (!text) return;
  textInput.value = "";
  appendMessageToActive("user", text);
  statusInfo.textContent = "AI is thinking...";
  showTyping();

  try {
    const reply = await fetchAIReply(text); // replace this with your backend call
    hideTyping();
    statusInfo.textContent = "Responded";
    // streaming reveal
    await streamAppendBot(reply);
    // If voice conversation is ON, speak and then auto-listen (two-way)
    if (document.getElementById("voiceToggle").checked) {
      await speakAsync(reply);
      startRecognitionAuto();
    }
  } catch (e) {
    hideTyping();
    statusInfo.textContent = "Error";
    appendMessageToActive("bot", "Error: " + (e.message || e));
  }
}

/* Streaming typewriter append */
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
async function streamAppendBot(fullText) {
  const chat = state.chats.find((x) => x.id === state.activeId);
  if (!chat) return;
  chat.messages.push({
    role: "bot",
    text: "",
    ts: nowTS(),
  });
  renderActive();
  const idx = chat.messages.length - 1;

  let current = "";
  for (let i = 0; i < fullText.length; i++) {
    current += fullText[i];
    chat.messages[idx].text = current;
    renderActive();
    await sleep(8 + Math.random() * 12);
  }
  chat.messages[idx].text = fullText;
  chat.messages[idx].ts = nowTS();
  renderActive();
  save();
}

/* -------------------------
          STT & TTS (two-way voice)
        ---------------------------*/
const micBtn = document.getElementById("micBtn");
const wave = document.getElementById("waveSvg");
let recognizing = false;
let recognition = null;

function makeWavePath(amplitude = 12, points = 32) {
  let d = "",
    step = 120 / (points - 1);
  for (let i = 0; i < points; i++) {
    const x = i * step - 60;
    const theta = (i / points) * Math.PI * 2;
    const y =
      Math.sin(theta) * (Math.random() * amplitude * 0.6 + amplitude * 0.4);
    d += (i === 0 ? "M" : "L") + x + " " + y + " ";
  }
  return d;
}

function updateWave() {
  const path = document.getElementById("wavePath");
  if (!path) return;
  path.setAttribute("d", makeWavePath(12 + Math.random() * 8, 50));
  if (recognizing) requestAnimationFrame(updateWave);
}

/* start recognition */
function startRecognition() {
  if (
    !("webkitSpeechRecognition" in window) &&
    !("SpeechRecognition" in window)
  ) {
    alert("Speech recognition not supported in this browser. Use Chrome.");
    return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    recognizing = true;
    wave.classList.add("active");
    updateWave();
    statusInfo.textContent = "Listening...";
    micBtn.style.boxShadow = "0 8px 30px rgba(123,97,255,0.12)";
  };
  recognition.onend = () => {
    recognizing = false;
    wave.classList.remove("active");
    statusInfo.textContent = "Idle";
    micBtn.style.boxShadow = "";
  };
  recognition.onerror = (e) => {
    recognizing = false;
    wave.classList.remove("active");
    statusInfo.textContent = "Recognition error";
    console.error(e);
  };

  recognition.onresult = (ev) => {
    const txt = ev.results[0][0].transcript;
    textInput.value = txt;
    onSend();
  };
  recognition.start();
}

/* stop recognition */
function stopRecognition() {
  if (recognition)
    try {
      recognition.stop();
    } catch (e) {}
}

/* Two-way auto recognition: after TTS ends, start recognition again */
function startRecognitionAuto() {
  if (!document.getElementById("voiceToggle").checked) return;
  setTimeout(() => {
    startRecognition();
  }, 350);
}

/* mic button toggles manual recognition */
micBtn.addEventListener("click", () => {
  if (recognizing) {
    stopRecognition();
    return;
  }
  startRecognition();
});

/* TTS — returns a promise resolved when speech finished */
function speakAsync(text) {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      resolve();
      return;
    }
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.pitch = 1.0;
      u.rate = 1.0;
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length) {
        const v = voices.find((v) => v.lang.startsWith("en")) || voices[0];
        if (v) u.voice = v;
      }
      u.onend = () => resolve();
      u.onerror = () => resolve();
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (e) {
      resolve();
    }
  });
}

/* Voice toggle behavior */
document.getElementById("voiceToggle").addEventListener("change", () => {
  if (document.getElementById("voiceToggle").checked) {
    statusInfo.textContent = "Voice conversation ON";
    startRecognition();
  } else {
    statusInfo.textContent = "Voice conversation OFF";
    stopRecognition();
  }
});
window.speechSynthesis &&
  (window.speechSynthesis.onvoiceschanged = () => {
    /* refresh voices if needed */
  });
/* -------------------------
          Initialize
        ---------------------------*/
if (!state.chats.length) {
  createChat("Getting started");
  appendMessageToActive(
    "bot",
    "Hello! NeonAI ready. Use the mic or type. Toggle Voice Conversation for hands-free two-way voice."
  );
}
renderChatList();
renderActive();
