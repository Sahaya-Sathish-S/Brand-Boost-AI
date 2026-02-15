const loader = document.getElementById('loader');
setTimeout(() => loader.classList.add('hidden'), 800);

const themes = ['Modern', 'Elegant', 'Vibrant'];
let selectedTheme = themes[0];
const themeSelector = document.getElementById('themeSelector');

document.getElementById('toThemeBtn').onclick = () => {
  document.getElementById('themeBlock').classList.remove('hidden');
};

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

function val(id){return document.getElementById(id).value || '';}

document.getElementById('generatePosterBtn').onclick = () => {
  const details = {
    companyName: val('companyName'), category: val('category'), productService: val('product'), offer: val('offer'),
    address: val('address'), contact: val('contact'), topic: val('brief')
  };
  const mediaUrl = `https://picsum.photos/seed/${Date.now()}/960/540`;
  addGalleryItem({ type: 'photo', title: 'Social Poster Output', theme: selectedTheme, content: details.topic, media_url: mediaUrl });

  const out = document.getElementById('posterOutput');
  out.classList.remove('hidden');
  out.innerHTML = `
    <h3>Your Generated Poster</h3>
    <img class='media' src='${mediaUrl}' alt='generated poster'/>
    <p><b>${details.companyName || 'BrandBoost AI'}</b> • ${details.category || 'Business'}</p>
    <p class='small'>Theme: ${selectedTheme} • Social media optimized poster output.</p>
    <div style='display:flex;gap:10px;flex-wrap:wrap;'>
      <a class='start-btn' style='max-width:220px;text-align:center;text-decoration:none' href='${mediaUrl}' download target='_blank'>Download Poster</a>
      <button class='icon-btn' onclick="navigator.share ? navigator.share({title:'Poster', url:'${mediaUrl}'}) : alert('Share not supported')">🔗</button>
    </div>
  `;
};
