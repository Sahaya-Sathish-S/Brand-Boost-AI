const loader = document.getElementById('loader');
setTimeout(() => loader.classList.add('hidden'), 900);

const chatBox = document.getElementById('chatBox');
const chatHistory = document.getElementById('chatHistory');
const showHistoryBtn = document.getElementById('showHistoryBtn');
const messageInput = document.getElementById('messageInput');
const mediaInput = document.getElementById('mediaInput');
const uploadBtn = document.getElementById('uploadBtn');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');

let currentChatId = null;
let pendingMedia = null;

function clearEmptyState() {
  const empty = chatBox.querySelector('.chat-empty');
  if (empty) empty.remove();
}
function addMsg(role, content) {
  clearEmptyState();
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.textContent = content;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}
function addMediaPreview(file) {
  clearEmptyState();
  const wrapper = document.createElement('div');
  wrapper.className = 'message user';
  wrapper.innerHTML = `<div>Uploaded: ${file.name}</div>`;
  if (file.type.startsWith('image/')) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file); img.className = 'media'; wrapper.appendChild(img);
  } else if (file.type.startsWith('video/')) {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file); video.controls = true; video.className = 'media'; wrapper.appendChild(video);
  }
  chatBox.appendChild(wrapper);
}

function renderHistory() {
  const chats = getChats();
  chatHistory.innerHTML = '';
  chats.forEach(chat => {
    const btn = document.createElement('button');
    btn.className = 'glow-btn'; btn.textContent = chat.title;
    btn.onclick = () => openChat(chat.id);
    chatHistory.appendChild(btn);
  });
}

function openChat(id) {
  currentChatId = id;
  chatBox.innerHTML = '';
  const chat = getChatById(id);
  if (!chat || !chat.messages.length) {
    chatBox.innerHTML = '<div class="chat-empty">No messages yet. Start the conversation!</div>';
    return;
  }
  chat.messages.forEach(m => addMsg(m.role, m.content));
}

function ensureChat() {
  const chats = getChats();
  if (!chats.length) {
    currentChatId = createChat();
    renderHistory();
    openChat(currentChatId);
  } else {
    currentChatId = chats[0].id;
    renderHistory();
    openChat(currentChatId);
  }
}

function sendMessage() {
  const content = messageInput.value.trim();
  if (!content || !currentChatId) return;
  const finalContent = pendingMedia ? `${content}\n[Media attached: ${pendingMedia.name}]` : content;

  addMsg('user', finalContent);
  const chat = getChatById(currentChatId);
  chat.messages.push({ role: 'user', content: finalContent });
  const reply = aiAssistantReply(content);
  chat.messages.push({ role: 'assistant', content: reply });
  updateChat(chat);
  addMsg('assistant', reply);

  messageInput.value = '';
  pendingMedia = null;
  mediaInput.value = '';
}

newChatBtn.onclick = () => {
  currentChatId = createChat();
  renderHistory();
  openChat(currentChatId);
};
clearChatBtn.onclick = () => {
  if (!currentChatId) return;
  clearChatMessages(currentChatId);
  openChat(currentChatId);
};
showHistoryBtn.onclick = () => chatHistory.classList.toggle('hidden');
saveProfileBtn.onclick = () => {
  const name = prompt('Your name:') || '';
  const business = prompt('Your business name/type:') || '';
  setProfile({ name, business });
  alert('Profile saved.');
};

uploadBtn.onclick = () => mediaInput.click();
mediaInput.onchange = () => {
  const file = mediaInput.files[0];
  if (!file) return;
  pendingMedia = file;
  addMediaPreview(file);
  addMsg('assistant', 'Great upload! I can now suggest poster/reel strategy and captions for this media.');
};
messageInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });
sendBtn.onclick = sendMessage;

ensureChat();
