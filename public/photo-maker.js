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

document.getElementById('generatePosterBtn').onclick = async () => {
  const details = {
    companyName: val('companyName'), category: val('category'), productService: val('product'),
    offer: val('offer'), address: val('address'), contact: val('contact'), topic: val('brief'),
    sourceTool: 'Google Images', aiStyle: selectedTheme
  };

  const data = await fetch('/api/generate', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'photo', theme: selectedTheme, details })
  }).then(r => r.json());

  const out = document.getElementById('posterOutput');
  out.classList.remove('hidden');
  out.innerHTML = `
    <h3>Your Generated Poster</h3>
    <img class='media' src='${data.mediaUrl}' alt='generated poster'/>
    <p><b>${details.companyName || 'BrandBoost AI'}</b> • ${details.category || 'Business'}</p>
    <p class='small'>Theme: ${selectedTheme} • Social media optimized poster output.</p>
    <div style='display:flex;gap:10px;flex-wrap:wrap;'>
      <a class='start-btn' style='max-width:220px;text-align:center;text-decoration:none' href='${data.mediaUrl}' download target='_blank'>Download Poster</a>
      <button class='icon-btn' onclick="navigator.share ? navigator.share({title:'Poster', url:'${data.mediaUrl}'}) : alert('Share not supported')">🔗</button>
    </div>
  `;
};
