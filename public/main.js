const loader = document.getElementById('loader');
setTimeout(() => loader.classList.add('hidden'), 900);

const chatBox = document.getElementById('chatBox');
const chatHistory = document.getElementById('chatHistory');
const messageInput = document.getElementById('messageInput');
const mediaInput = document.getElementById('mediaInput');
const uploadBtn = document.getElementById('uploadBtn');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');

let currentChatId = null;
let pendingMedia = null;

function addMsg(role, content) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.textContent = content;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addMediaPreview(file) {
  const wrapper = document.createElement('div');
  wrapper.className = 'message user';
  const caption = document.createElement('div');
  caption.textContent = `Uploaded: ${file.name}`;
  wrapper.appendChild(caption);

  if (file.type.startsWith('image/')) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.className = 'media';
    wrapper.appendChild(img);
  } else if (file.type.startsWith('video/')) {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.controls = true;
    video.className = 'media';
    wrapper.appendChild(video);
  }
  chatBox.appendChild(wrapper);
}

async function loadChats(selectFirst = true) {
  const chats = await fetch('/api/chats').then(r => r.json());
  chatHistory.innerHTML = '';
  chats.forEach(chat => {
    const btn = document.createElement('button');
    btn.className = 'glow-btn';
    btn.textContent = chat.title;
    btn.onclick = () => openChat(chat.id);
    chatHistory.appendChild(btn);
  });

  if (selectFirst && chats[0]) openChat(chats[0].id);
  if (!chats.length) await createNewChat();
}

async function openChat(chatId) {
  currentChatId = chatId;
  chatBox.innerHTML = '';
  const messages = await fetch(`/api/chats/${chatId}/messages`).then(r => r.json());
  messages.forEach(msg => addMsg(msg.role, msg.content));
}

async function createNewChat() {
  const chat = await fetch('/api/chats', { method: 'POST' }).then(r => r.json());
  await loadChats(false);
  await openChat(chat.id);
}

async function sendMessage() {
  const content = messageInput.value.trim();
  if (!content || !currentChatId) return;

  const finalContent = pendingMedia
    ? `${content}\n[Media attached: ${pendingMedia.name}]`
    : content;

  addMsg('user', finalContent);
  messageInput.value = '';

  const data = await fetch(`/api/chats/${currentChatId}/messages`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: finalContent })
  }).then(r => r.json());

  addMsg('assistant', data.assistant || 'Done.');
  pendingMedia = null;
  mediaInput.value = '';
}

newChatBtn.onclick = async () => createNewChat();

clearChatBtn.onclick = async () => {
  if (!currentChatId) return;
  await fetch(`/api/chats/${currentChatId}/messages`, { method: 'DELETE' });
  chatBox.innerHTML = '';
  pendingMedia = null;
  mediaInput.value = '';
};

saveProfileBtn.onclick = async () => {
  const name = prompt('Your name:') || '';
  const business = prompt('Your business name/type:') || '';
  await fetch('/api/profile', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, business })
  });
  alert('Profile saved.');
};

uploadBtn.onclick = () => mediaInput.click();
mediaInput.onchange = () => {
  const file = mediaInput.files[0];
  if (!file) return;
  pendingMedia = file;
  addMediaPreview(file);
  addMsg('assistant', 'Nice media upload. I can now suggest social marketing strategy, captions, ad hooks, and posting plan for this media.');
};

messageInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});
sendBtn.onclick = sendMessage;

loadChats();
