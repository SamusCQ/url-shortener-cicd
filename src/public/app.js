// Frontend del acortador: crear enlaces y listar los existentes con su conteo de clics.
const form = document.getElementById('form');
const urlInput = document.getElementById('url');
const submitBtn = document.getElementById('submit');
const errorEl = document.getElementById('error');
const resultEl = document.getElementById('result');
const shortUrlEl = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copy');
const metaEl = document.getElementById('meta');

const tabs = document.querySelectorAll('.tab');
const panels = {
  'panel-create': document.getElementById('panel-create'),
  'panel-links': document.getElementById('panel-links'),
};
const refreshBtn = document.getElementById('refresh');
const linksList = document.getElementById('links-list');
const linksEmpty = document.getElementById('links-empty');

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
  resultEl.hidden = true;
}

function showResult({ shortUrl, shortCode }) {
  errorEl.hidden = true;
  shortUrlEl.textContent = shortUrl;
  shortUrlEl.href = shortUrl;
  metaEl.textContent = `Código: ${shortCode} · cada visita queda registrada.`;
  resultEl.hidden = false;
  copyBtn.querySelector('.copy-text').textContent = 'Copiar';
  copyBtn.classList.remove('copied');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const url = urlInput.value.trim();
  if (!url) {
    return;
  }

  submitBtn.disabled = true;
  submitBtn.querySelector('.btn-label').textContent = 'Acortando…';

  try {
    const res = await fetch('/api/urls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'No se pudo acortar la URL.');
      return;
    }
    showResult(data);
    urlInput.value = '';
  } catch (err) {
    showError('Error de conexión con el servidor.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-label').textContent = 'Acortar';
  }
});

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(shortUrlEl.textContent);
    copyBtn.querySelector('.copy-text').textContent = '¡Copiado!';
    copyBtn.classList.add('copied');
  } catch (err) {
    const range = document.createRange();
    range.selectNodeContents(shortUrlEl);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  }
});

// ---------- Pestañas ----------
function activateTab(tab) {
  tabs.forEach((t) => {
    const selected = t === tab;
    t.classList.toggle('active', selected);
    t.setAttribute('aria-selected', String(selected));
    panels[t.dataset.panel].hidden = !selected;
  });
  if (tab.dataset.panel === 'panel-links') {
    loadLinks();
  }
}

tabs.forEach((tab) => tab.addEventListener('click', () => activateTab(tab)));

// ---------- Lista de enlaces ----------
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderLinks(items) {
  linksList.innerHTML = '';
  linksEmpty.hidden = items.length > 0;

  items.forEach((item) => {
    const shortPath = `${window.location.origin}/${item.shortCode}`;
    const li = document.createElement('li');
    li.className = 'link-row';
    li.innerHTML = `
      <div class="link-info">
        <a class="link-short" href="/${item.shortCode}" target="_blank" rel="noopener">/${escapeHtml(item.shortCode)}</a>
        <span class="link-original">${escapeHtml(item.originalUrl)}</span>
      </div>
      <span class="link-clicks" title="Visitas">👁 ${item.clicks}</span>
    `;
    li.querySelector('.link-short').addEventListener('click', (e) => {
      e.preventDefault();
      window.open(shortPath, '_blank', 'noopener');
    });
    linksList.appendChild(li);
  });
}

async function loadLinks() {
  try {
    const res = await fetch('/api/urls');
    const items = await res.json();
    renderLinks(Array.isArray(items) ? items : []);
  } catch (err) {
    linksList.innerHTML = '';
    linksEmpty.hidden = false;
    linksEmpty.textContent = 'No se pudieron cargar los enlaces.';
  }
}

refreshBtn.addEventListener('click', loadLinks);
