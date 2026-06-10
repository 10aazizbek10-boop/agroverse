/* pages/catalog.js — раздел "Рынок" (для фермера и покупателя) */

const CATEGORY_OPTIONS = [
  { value: '',          label: 'Все категории' },
  { value: 'Овощи',     label: '🥦 Овощи' },
  { value: 'Фрукты',    label: '🍎 Фрукты' },
  { value: 'Зелень',    label: '🌿 Зелень' },
  { value: 'Зерновые',  label: '🌾 Зерновые' },
  { value: 'Молочные',  label: '🥛 Молочные' },
  { value: 'Мёд',       label: '🍯 Мёд' },
];

const CAT_EMOJI = { 'Овощи': '🥦', 'Фрукты': '🍎', 'Зелень': '🌿', 'Зерновые': '🌾', 'Молочные': '🥛', 'Мёд': '🍯' };

function starsHtml(rating) {
  const r = Math.round(rating || 0);
  return '⭐'.repeat(r) + '☆'.repeat(5 - r);
}

function productCardHtml(p) {
  const isBuyer = Auth.isBuyer();
  const pending = p.status === 'pending';
  const img = p.images?.length
    ? `<img class="pc-img" src="${p.images[0]}" alt="${p.name}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'pc-img ph',textContent:'${CAT_EMOJI[p.category] || '🥬'}'}))" />`
    : `<div class="pc-img ph">${CAT_EMOJI[p.category] || '🥬'}</div>`;
  const action = isBuyer
    ? `<button class="btn btn-primary btn-sm pc-btn" onclick="event.stopPropagation(); quickAddToCart(${p.id})">В корзину</button>`
    : `<button class="btn btn-ghost btn-sm pc-btn" onclick="event.stopPropagation(); router.go('/product/${p.id}')">Подробнее</button>`;
  return `
    <div class="product-card" onclick="router.go('/product/${p.id}')">
      <div class="pc-media">
        ${img}
        ${pending ? '<span class="pc-badge">на модерации</span>' : ''}
        <span class="pc-cat">${CAT_EMOJI[p.category] || ''} ${p.category || ''}</span>
      </div>
      <div class="pc-body">
        <div class="pc-name">${p.name}</div>
        <div class="pc-rating">${starsHtml(p.rating)}</div>
        <div class="pc-row">
          <div class="pc-price">${Number(p.price).toLocaleString('ru')} <small>сум/${p.unit || 'кг'}</small></div>
        </div>
        <div class="pc-farmer">🌱 ${p.fermer_name || 'Фермер'}</div>
        ${action}
      </div>
    </div>
  `;
}

async function quickAddToCart(id) {
  try {
    const p = await API.getProduct(id);
    addToCart(p, 1);
    showToast(`«${p.name}» в корзине`);
    // обновим бейдж в навбаре
    document.querySelector('.app')?.dispatchEvent(new Event('cart'));
    const link = document.querySelector('.nav-link[onclick*="/cart"] .nav-badge');
    const count = getCartCount();
    if (link) link.textContent = count;
  } catch (e) { showToast(e.message, 'error'); }
}

let debounceTimer;

async function renderCatalog() {
  const app = document.getElementById('app');
  const presetCat = new URLSearchParams((location.hash.split('?')[1] || '')).get('cat') || '';

  app.innerHTML = pageShell(`
    <div class="page-head">
      <h1 class="page-title">🛒 Рынок</h1>
      <p class="page-desc">Все фермерские товары в одном месте</p>
    </div>

    <div class="filters-bar">
      <div class="filter-group grow">
        <input type="text" id="search-input" placeholder="🔍 Поиск товара…" />
      </div>
      <div class="filter-group">
        <select id="cat-filter">
          ${CATEGORY_OPTIONS.map(o => `<option value="${o.value}" ${o.value === presetCat ? 'selected' : ''}>${o.label}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group price-range">
        <input type="number" id="min-price" placeholder="от" min="0" />
        <span>—</span>
        <input type="number" id="max-price" placeholder="до" min="0" />
      </div>
    </div>

    <div id="products-grid" class="products-grid"><div class="spinner"></div></div>
  `);

  async function loadProducts() {
    const search    = document.getElementById('search-input')?.value || '';
    const category  = document.getElementById('cat-filter')?.value || '';
    const min_price = document.getElementById('min-price')?.value || '';
    const max_price = document.getElementById('max-price')?.value || '';
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    grid.innerHTML = '<div class="spinner"></div>';
    try {
      const products = await API.getProducts({ search, category, min_price, max_price });
      if (!products?.length) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="icon">🌱</div><p>Товары не найдены. Попробуйте изменить фильтры.</p></div>`;
        return;
      }
      grid.innerHTML = products.map(productCardHtml).join('');
    } catch (e) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>⚠️ ${e.message}</p></div>`;
    }
  }

  loadProducts();

  const onChange = () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(loadProducts, 300); };
  document.getElementById('search-input')?.addEventListener('input', onChange);
  document.getElementById('cat-filter')?.addEventListener('change', loadProducts);
  document.getElementById('min-price')?.addEventListener('input', onChange);
  document.getElementById('max-price')?.addEventListener('input', onChange);
}

window.renderCatalog = renderCatalog;
window.productCardHtml = productCardHtml;
window.quickAddToCart = quickAddToCart;
window.starsHtml = starsHtml;
window.CAT_EMOJI = CAT_EMOJI;
