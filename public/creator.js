const params = new URLSearchParams(location.search);
const type = params.get('type') || 'photo';
const pageTitle = document.getElementById('pageTitle');

const labelMap = {
  photo: 'Photo / Poster Maker',
  video: 'Video Maker for Reels / Shorts',
  ad: 'Ad Idea Maker',
  caption: 'Description + Title Maker'
};
pageTitle.textContent = labelMap[type] || 'Creator';

if (type === 'video') document.getElementById('videoOptions').classList.remove('hidden');
if (type === 'ad') document.getElementById('adOptions').classList.remove('hidden');
if (type === 'caption') document.getElementById('captionOptions').classList.remove('hidden');

const themes = ['Royal Purple', 'Neon Gradient', 'Brand Gold', 'Ocean Glow', 'Dark Luxury'];
let selectedTheme = themes[0];
const themeSelector = document.getElementById('themeSelector');

function renderThemes() {
  themeSelector.innerHTML = '';
  themes.forEach(theme => {
    const chip = document.createElement('button');
    chip.className = `theme-chip ${theme === selectedTheme ? 'active' : ''}`;
    chip.textContent = theme;
    chip.onclick = () => { selectedTheme = theme; renderThemes(); };
    themeSelector.appendChild(chip);
  });
}
renderThemes();

function v(id){ const el = document.getElementById(id); return el ? el.value : ''; }

document.getElementById('submitBtn').onclick = async () => {
  const details = {
    companyName: v('companyName'),
    category: v('category'),
    productService: v('productService'),
    offer: v('offer'),
    address: v('address'),
    contact: v('contact'),
    topic: v('topic'),
    animationType: v('animationType'),
    videoTone: v('videoTone'),
    platform: v('platform'),
    budget: v('budget'),
    audience: v('audience'),
    cta: v('cta'),
    postType: v('postType'),
    keyword: v('keyword'),
    aboutTopic: v('aboutTopic')
  };

  const data = await fetch('/api/generate', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, theme: selectedTheme, details })
  }).then(r => r.json());

  const extras = [];
  if (type === 'video') extras.push(`Animation: ${details.animationType || 'Slide Animation'}`, `Tone: ${details.videoTone || 'Professional'}`);
  if (type === 'ad') extras.push(`Platform: ${details.platform}`, `Audience: ${details.audience}`, `CTA: ${details.cta}`);
  if (type === 'caption') extras.push(`Post Type: ${details.postType}`, `Keyword: ${details.keyword}`);

  const result = document.getElementById('result');
  result.classList.remove('hidden');
  result.innerHTML = `
    <h3>${data.title}</h3>
    <p>${data.text}</p>
    <p class="small">Theme: ${selectedTheme} ${extras.length ? `| ${extras.join(' | ')}` : ''}</p>
    ${type === 'video' ? `<video class="media" controls src="${data.mediaUrl}"></video>` : `<img class="media" src="${data.mediaUrl}" alt="generated"/>`}
    <p class="small">${data.footer}</p>
    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      <a class="glow-btn" href="${data.mediaUrl}" download target="_blank" style="max-width:200px">Download</a>
      <button class="icon-btn" onclick="navigator.share ? navigator.share({title:'BrandBoost AI Output', url:'${data.mediaUrl}'}) : alert('Sharing is not supported in this browser')">🔗</button>
    </div>
  `;
};
