const themes = ['Brand Gold', 'Royal Purple', 'Clean White', 'Festival Glow'];
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

function val(id){return document.getElementById(id).value || '';}

document.getElementById('generatePosterBtn').onclick = async () => {
  const details = {
    companyName: val('companyName'),
    category: val('industry'),
    productService: val('product'),
    offer: val('offer'),
    audience: val('audience'),
    contact: val('contact'),
    topic: val('brief'),
    sourceTool: val('sourceTool'),
    aiStyle: val('aiStyle')
  };

  const data = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'photo', theme: selectedTheme, details })
  }).then(r => r.json());

  const out = document.getElementById('posterOutput');
  out.classList.remove('hidden');
  out.innerHTML = `
    <h3>${data.title}</h3>
    <p>${data.text}</p>
    <p class='small'>Source Tool: ${details.sourceTool} | AI Style: ${details.aiStyle} | Theme: ${selectedTheme}</p>
    <img class='media' src='${data.mediaUrl}' alt='poster output'/>
    <p class='small'>${data.footer}</p>
    <div style='display:flex;gap:10px;flex-wrap:wrap;'>
      <a class='glow-btn' style='max-width:180px' href='${data.mediaUrl}' download target='_blank'>Download</a>
      <button class='icon-btn' onclick="navigator.share ? navigator.share({title:'BrandBoost Poster', url:'${data.mediaUrl}'}) : alert('Share not supported')">🔗</button>
    </div>
  `;
};
