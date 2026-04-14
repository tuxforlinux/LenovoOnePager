const titleEl = document.getElementById('sectionTitle');
const descEl = document.getElementById('sectionDescription');
const bodyEl = document.getElementById('sectionBody');
const navButtons = Array.from(document.querySelectorAll('.nav-button'));
const chips = Array.from(document.querySelectorAll('.chip'));
const metricLabelEl = document.getElementById('sectionMetricLabel');
const metricValueEl = document.getElementById('sectionMetricValue');
const searchInput = document.getElementById('globalSearch');
const clearSearchBtn = document.getElementById('clearSearch');

const modal = document.getElementById('docModal');
const modalTitle = document.getElementById('modalTitle');
const docFrame = document.getElementById('docFrame');
const directOpen = document.getElementById('directOpen');
const closeModalBtn = document.getElementById('closeModal');

let currentSection = 'Welcome';
let currentQuery = '';

function setActive(name){
  currentSection = name;
  navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.section === name));
  chips.forEach(chip => chip.classList.toggle('active', chip.dataset.jump === name));
}

function updateMetric(label, value){
  metricLabelEl.textContent = label;
  metricValueEl.textContent = value;
}

function sectionItems(name){
  switch(name){
    case 'Lenovo URLs':
    case 'Learning and Development':
    case 'J2W URLs':
    case 'Our Community':
      return (window.portalData[name] || []).map(item => ({ type:'link', title:item[0], value:(item[1] || '') + ' ' + (item[2] || '') }));
    case 'Process Documents':
      return (window.processDocs || []).map(item => ({ type:'doc', title:item[0], value:item[1] || '' }));
    case 'Policy Documents':
      return (window.policyDocs || []).map(item => ({ type:'doc', title:item[0], value:item[1] || '' }));
    case 'Toll Free Numbers & Transfer Extensions':
      return (window.portalData[name] || []).map(item => ({ type:'phone', title:item[0], value:(item[1] || '') + ' ' + (item[2] || '') }));
    case 'Help Us Improve Together':
      return (window.portalData[name] || []).map(item => ({ type:'feedback', title:item[0], value:(item[1] || '') + ' ' + (item[2] || '') }));
    default:
      return [];
  }
}

function matchesQuery(...parts){
  if(!currentQuery) return true;
  return parts.join(' ').toLowerCase().includes(currentQuery);
}

function filterSectionNav(){
  navButtons.forEach(btn => {
    const sectionName = btn.dataset.section;
    const items = sectionItems(sectionName);
    const visible = !currentQuery || matchesQuery(sectionName, ...items.flatMap(i => [i.title, i.value]));
    btn.classList.toggle('hidden', !visible);
  });
}

function openModal(title, previewPath){
  modalTitle.textContent = title;
  docFrame.src = previewPath;
  directOpen.href = previewPath;
  modal.classList.add('show');
}

function closeModal(){
  modal.classList.remove('show');
  docFrame.src = 'about:blank';
}

closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if(e.target === modal) closeModal(); });
document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeModal(); });

function renderWelcome(){
  titleEl.textContent = 'Welcome';
  descEl.textContent = currentQuery
    ? `Showing results matching “${searchInput.value.trim()}”. Use the left menu or cards below to jump into the most relevant area.`
    : 'A polished central workspace for frequently used Lenovo tools, learning platforms, documents, support numbers, and internal updates.';
  updateMetric('Mode', currentQuery ? 'Search View' : 'Overview');

  const sections = [
    ['Lenovo URLs', 'Jump into core Lenovo tools, portals, ticketing apps, and support utilities.'],
    ['Learning and Development', 'Open LEAP and UKM quickly for training content and knowledge resources.'],
    ['Process Documents', 'Access uploaded process files, templates, and operational guides in-page.'],
    ['Policy Documents', 'Review policy and warranty documents directly within the portal.'],
    ['Toll Free Numbers & Transfer Extensions', 'Keep support numbers and transfer extensions available for quick reference.'],
    ['J2W URLs', 'Open transport and HR-related links in one place.']
  ].filter(([title, text]) => matchesQuery(title, text));

  bodyEl.innerHTML = `
    <div class="welcome">
      <div>
        <div class="quick-card">
          <h3>Everything in one premium dashboard</h3>
          <p>This portal is designed to reduce switching time between links, documents, and support references. It now includes live search, smoother animations, richer cards, and cleaner visual hierarchy for daily use.</p>
        </div>
        <div class="feature-grid" id="welcomeGrid"></div>
      </div>
      <div>
        <div class="summary-card">
          <h3>What’s inside</h3>
          <p>Core tools, learning platforms, policy documents, process files, support numbers, community links, and an editable updates rail.</p>
        </div>
        <div class="summary-card" style="margin-top:16px;">
          <h3>How to use it</h3>
          <p>Use the left navigation to expand a section, search from the top bar, or open document previews directly inside the page.</p>
        </div>
        <div class="summary-card" style="margin-top:16px;">
          <h3>Share Feedback</h3>
          <p>Please navigate to the "Help Us Improve Together" section and complete the MS Form to share your valuable feedback and suggestions.</p>
        </div>
      </div>
    </div>
  `;

  const welcomeGrid = document.getElementById('welcomeGrid');
  if(!sections.length){
    welcomeGrid.innerHTML = `<div class="search-empty">No overview cards matched your search. Try another term like policy, warranty, process, IWS, LEAP, or support.</div>`;
    return;
  }
  sections.forEach(([title, text]) => {
    const box = document.createElement('button');
    box.className = 'feature-box';
    box.type = 'button';
    box.style.textAlign = 'left';
    box.style.cursor = 'pointer';
    box.innerHTML = `<h3>${title}</h3><p>${text}</p>`;
    box.addEventListener('click', () => showSection(title));
    welcomeGrid.appendChild(box);
  });
}

function renderLinks(sectionName){
  const items = (window.portalData[sectionName] || []).filter(([title,url,desc]) => matchesQuery(sectionName, title, url, desc || ''));
  titleEl.textContent = sectionName;
  descEl.textContent = currentQuery
    ? `Filtered results for “${searchInput.value.trim()}”.`
    : `Click any card below to open ${sectionName.toLowerCase()} in a new tab.`;
  updateMetric('Items', String(items.length));
  bodyEl.innerHTML = `<div class="link-grid"></div>`;
  const grid = bodyEl.querySelector('.link-grid');
  if(!items.length){
    grid.innerHTML = `<div class="search-empty">No matching links found in this section.</div>`;
    return;
  }
  items.forEach(([title, url, desc]) => {
    const a = document.createElement('a');
    a.className = 'link-card';
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.innerHTML = `
      <div class="title">${title}</div>
      <div class="meta">${url}</div>
      ${desc ? `<div class="meta">${desc}</div>` : ''}
    `;
    grid.appendChild(a);
  });
}

function renderDocs(title, docs, description){
  const filteredDocs = docs.filter(([name, previewPath]) => matchesQuery(title, name, previewPath));
  titleEl.textContent = title;
  descEl.textContent = currentQuery ? `Filtered documents for “${searchInput.value.trim()}”.` : description;
  updateMetric('Documents', String(filteredDocs.length));
  bodyEl.innerHTML = `<div class="doc-grid"></div>`;
  const grid = bodyEl.querySelector('.doc-grid');
  if(!filteredDocs.length){
    grid.innerHTML = `<div class="search-empty">No matching documents found in this section.</div>`;
    return;
  }
  filteredDocs.forEach(([name, previewPath]) => {
    const originalPath = `docs_original/${name}`;
    const card = document.createElement('div');
    card.className = 'doc-card';
    card.innerHTML = `
      <h3>${name}</h3>
      <p>Preview inside the webpage or open the original file directly.</p>
      <div class="actions">
        <button class="btn btn-primary preview-btn">Preview</button>
        <a class="btn btn-soft" href="${originalPath}" target="_blank" rel="noopener noreferrer">Open Original</a>
      </div>
    `;
    card.querySelector('.preview-btn').addEventListener('click', ()=>openModal(name, previewPath));
    grid.appendChild(card);
  });
}

function renderNumbers(){
  const items = (window.portalData['Toll Free Numbers & Transfer Extensions'] || []).filter(([label, phone, ext]) => matchesQuery(label, phone, ext || ''));
  titleEl.textContent = 'Toll Free Numbers & Transfer Extensions';
  descEl.textContent = currentQuery
    ? `Filtered support numbers for “${searchInput.value.trim()}”.`
    : 'Support contact numbers and internal transfer extensions grouped for quick reference.';
  updateMetric('Contacts', String(items.length));
  bodyEl.innerHTML = `<div class="phone-grid"></div>`;
  const grid = bodyEl.querySelector('.phone-grid');
  if(!items.length){
    grid.innerHTML = `<div class="search-empty">No matching numbers found.</div>`;
    return;
  }
  items.forEach(([label, phone, ext]) => {
    const card = document.createElement('div');
    card.className = 'contact-card';
    card.innerHTML = `
      <strong>${label}</strong>
      <p>${phone}</p>
      ${ext ? `<p>${ext}</p>` : ''}
    `;
    grid.appendChild(card);
  });
}

function renderCommunity(){
  const items = (window.portalData['Our Community'] || []).filter(([title,url]) => matchesQuery(title, url));
  titleEl.textContent = 'Our Community';
  descEl.textContent = currentQuery
    ? `Filtered community links for “${searchInput.value.trim()}”.`
    : 'Official Lenovo India community and social channels.';
  updateMetric('Channels', String(items.length));
  bodyEl.innerHTML = `<div class="link-grid"></div>`;
  const grid = bodyEl.querySelector('.link-grid');
  if(!items.length){
    grid.innerHTML = `<div class="search-empty">No matching community channels found.</div>`;
    return;
  }
  items.forEach(([title,url]) => {
    const card = document.createElement('a');
    card.className = 'community-card link-card';
    card.href = url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.innerHTML = `<div class="title">${title}</div><div class="meta">${url}</div>`;
    grid.appendChild(card);
  });
}

function renderFeedback(){
  const item = (window.portalData['Help Us Improve Together'] || []).find(([title,url,desc]) => matchesQuery(title,url,desc || ''));
  titleEl.textContent = 'Help Us Improve Together';
  descEl.textContent = item ? item[2] : 'No matching feedback item found.';
  updateMetric('Action', item ? 'Open Form' : 'No Match');
  if(!item){
    bodyEl.innerHTML = `<div class="search-empty">No matching feedback result found.</div>`;
    return;
  }
  const [title,url,desc] = item;
  bodyEl.innerHTML = `
    <div class="quick-card">
      <h3>Your insights matter</h3>
      <p>${desc}</p>
      <div class="actions" style="margin-top:16px;">
        <a class="btn btn-primary" href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>
      </div>
    </div>
  `;
}

function showSection(name){
  setActive(name);
  switch(name){
    case 'Welcome':
      renderWelcome();
      break;
    case 'Lenovo URLs':
    case 'Learning and Development':
    case 'J2W URLs':
      renderLinks(name);
      break;
    case 'Process Documents':
      renderDocs('Process Documents', window.processDocs, 'Uploaded .xlsx and .txt files are listed here. Click Preview to open them in the same webpage.');
      break;
    case 'Policy Documents':
      renderDocs('Policy Documents', window.policyDocs, 'Uploaded .docx files are listed here. Click Preview to open them in the same webpage.');
      break;
    case 'Toll Free Numbers & Transfer Extensions':
      renderNumbers();
      break;
    case 'Our Community':
      renderCommunity();
      break;
    case 'Help Us Improve Together':
      renderFeedback();
      break;
    default:
      renderWelcome();
  }
}

function handleSearch(){
  currentQuery = searchInput.value.trim().toLowerCase();
  filterSectionNav();
  showSection(currentSection);
}

navButtons.forEach(btn => btn.addEventListener('click', ()=>showSection(btn.dataset.section)));
chips.forEach(chip => chip.addEventListener('click', ()=>showSection(chip.dataset.jump)));
searchInput.addEventListener('input', handleSearch);
clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  currentQuery = '';
  filterSectionNav();
  showSection(currentSection);
  searchInput.focus();
});

filterSectionNav();
showSection('Welcome');
