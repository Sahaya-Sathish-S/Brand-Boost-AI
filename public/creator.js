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
    companyName: v('companyName'), category: v('category'), productService: v('productService'), offer: v('offer'),
    address: v('address'), contact: v('contact'), topic: v('topic'), animationType: v('animationType'),
    videoTone: v('videoTone'), platform: v('platform'), budget: v('budget'), audience: v('audience'),
    cta: v('cta'), postType: v('postType'), keyword: v('keyword'), aboutTopic: v('aboutTopic')
  };

  const mediaUrl = type === 'video'
    ? 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
    : `https://picsum.photos/seed/${Date.now()}/960/540`;

  const title = `${labelMap[type] || 'Creator'} Output`;
  const text = `Generated ${type} concept for ${details.companyName || 'your brand'} with ${selectedTheme} theme.`;

  addGalleryItem({ type, title, theme: selectedTheme, content: text, media_url: mediaUrl });

  const extras = [];
  if (type === 'video') extras.push(`Animation: ${details.animationType || 'Slide Animation'}`, `Tone: ${details.videoTone || 'Professional'}`);
  if (type === 'ad') extras.push(`Platform: ${details.platform}`, `Audience: ${details.audience}`, `CTA: ${details.cta}`);
  if (type === 'caption') extras.push(`Post Type: ${details.postType}`, `Keyword: ${details.keyword}`);

  const result = document.getElementById('result');
  result.classList.remove('hidden');
  result.innerHTML = `
    <h3>${title}</h3>
    <p>${text}</p>
    <p class='small'>Theme: ${selectedTheme} ${extras.length ? `| ${extras.join(' | ')}` : ''}</p>
    ${type === 'video' ? `<video class='media' controls src='${mediaUrl}'></video>` : `<img class='media' src='${mediaUrl}' alt='generated'/>`}
    <div style='display:flex; gap:10px; flex-wrap:wrap; margin-top:10px'>
      <a class='start-btn' href='${mediaUrl}' download target='_blank' style='max-width:200px;text-decoration:none;text-align:center'>Download</a>
      <button class='icon-btn' onclick="navigator.share ? navigator.share({title:'BrandBoost AI Output', url:'${mediaUrl}'}) : alert('Sharing is not supported')">🔗</button>
    </div>
  `;
};
