const DB_KEYS = {
  CHATS: 'bbai_chats',
  PROFILE: 'bbai_profile',
  GALLERY: 'bbai_gallery'
};

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function writeJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function getChats() { return readJson(DB_KEYS.CHATS, []); }
function saveChats(chats) { writeJson(DB_KEYS.CHATS, chats); }
function createChat() {
  const chats = getChats();
  const id = Date.now();
  chats.unshift({ id, title: `Chat ${chats.length + 1}`, messages: [], createdAt: new Date().toISOString() });
  saveChats(chats);
  return id;
}
function getChatById(id) { return getChats().find(c => c.id === id); }
function updateChat(chat) {
  const chats = getChats().map(c => (c.id === chat.id ? chat : c));
  saveChats(chats);
}
function clearChatMessages(id) {
  const chats = getChats().map(c => c.id === id ? { ...c, messages: [] } : c);
  saveChats(chats);
}

function getProfile() { return readJson(DB_KEYS.PROFILE, { name: '', business: '' }); }
function setProfile(profile) { writeJson(DB_KEYS.PROFILE, profile); }

function getGalleryItems() { return readJson(DB_KEYS.GALLERY, []); }
function addGalleryItem(item) {
  const items = getGalleryItems();
  items.unshift({ id: Date.now(), createdAt: new Date().toISOString(), ...item });
  writeJson(DB_KEYS.GALLERY, items);
}

function aiAssistantReply(text) {
  const p = getProfile();
  const prefix = p.name && p.business ? `What about your business, ${p.name}? Since you run ${p.business}, ` : '';
  return `${prefix}Here is a focused plan:\n1) Define audience + goal\n2) Create offer and hook\n3) Publish post/reel with CTA\n4) Track leads/sales\n5) Optimize weekly.`;
}
