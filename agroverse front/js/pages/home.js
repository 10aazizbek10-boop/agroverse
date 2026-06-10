/* pages/home.js — стильная главная для обоих ролей */

const HOME_CATEGORIES = [
  { value: 'Овощи',     icon: '🥦', key: 'cat_vegetables', tint: '#10B981' },
  { value: 'Фрукты',    icon: '🍎', key: 'cat_fruits',     tint: '#F59E0B' },
  { value: 'Зелень',    icon: '🌿', key: 'cat_greens',     tint: '#22C55E' },
  { value: 'Зерновые',  icon: '🌾', key: 'cat_grains',     tint: '#D97706' },
  { value: 'Молочные',  icon: '🥛', key: 'cat_dairy',      tint: '#3B82F6' },
  { value: 'Мёд',       icon: '🍯', key: 'cat_honey',      tint: '#EAB308' },
];

async function renderHome() {
  const app  = document.getElementById('app');
  const user = Auth.getUser();
  const isFarmer = Auth.isFarmer();
  const firstName = (user?.name || '').split(' ')[0] || (isFarmer ? t('farmer_word') : t('friend_word'));

  const heroCta = isFarmer
    ? `<button class="btn btn-primary btn-lg" onclick="router.go('/product/new')">➕ ${t('add_product_btn')}</button>
       <button class="btn btn-ghost btn-lg" onclick="router.go('/market')">${t('view_market')}</button>`
    : `<button class="btn btn-primary btn-lg" onclick="router.go('/market')">🛒 ${t('go_market')}</button>
       <button class="btn btn-ghost btn-lg" onclick="router.go('/ai')">🤖 ${t('ask_ai')}</button>`;

  app.innerHTML = pageShell(`
    <section class="hero">
      <div class="hero-glow"></div>
      <div class="hero-content">
        <div class="hero-badge">🌱 ${t('fresh_with_field')}</div>
        <h1 class="hero-title">${t('hi')}, ${firstName}!<br><span class="grad-text">${isFarmer ? t('sell_farm') : t('buy_farm')}</span> ${t('no_middlemen')}</h1>
        <p class="hero-sub">${isFarmer ? t('hero_farmer_sub') : t('hero_buyer_sub')}</p>
        <div class="hero-actions">${heroCta}</div>
        <div class="hero-stats">
          <div class="stat"><b id="stat-products">—</b><span>${t('products_on_market')}</span></div>
          <div class="stat"><b>100%</b><span>${t('all_farm')}</span></div>
          <div class="stat"><b>0%</b><span>${t('middlemen0')}</span></div>
        </div>
      </div>
      <div class="hero-art">
        <div class="art-blob art-1">🍅</div>
        <div class="art-blob art-2">🥕</div>
        <div class="art-blob art-3">🌽</div>
        <div class="art-blob art-4">🍇</div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2>${t('categories')}</h2>
        <a class="link-more" onclick="router.go('/market')">${t('all_market')} →</a>
      </div>
      <div class="cat-grid">
        ${HOME_CATEGORIES.map(c => `
          <div class="cat-card" onclick="router.go('/market?cat=${encodeURIComponent(c.value)}')" style="--tint:${c.tint}">
            <div class="cat-ic">${c.icon}</div>
            <div class="cat-name">${t(c.key)}</div>
          </div>`).join('')}
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2>${isFarmer ? t('fresh_on_market') : t('popular_now')}</h2>
        <a class="link-more" onclick="router.go('/market')">${t('all_products')} →</a>
      </div>
      <div id="home-products" class="products-grid"><div class="spinner"></div></div>
    </section>

    <section class="section">
      <div class="promo">
        <div class="promo-ic">🤖</div>
        <div>
          <h3>${t('ai_promo_title')}</h3>
          <p>${isFarmer ? t('ai_promo_farmer') : t('ai_promo_buyer')}</p>
        </div>
        <button class="btn btn-primary" onclick="router.go('/ai')">${t('open_chat')}</button>
      </div>
    </section>
  `);

  try {
    const products = await API.getProducts({ limit: 8 });
    document.getElementById('stat-products').textContent = products.length;
    const grid = document.getElementById('home-products');
    if (!products.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="icon">🌱</div><p>${t('no_products_yet')} ${isFarmer ? t('add_first') : t('come_later')}</p></div>`;
      return;
    }
    grid.innerHTML = products.slice(0, 8).map(productCardHtml).join('');
  } catch (e) {
    if (e.message === 'BLOCKED') return;
    const grid = document.getElementById('home-products');
    if (grid) grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>⚠️ ${e.message}</p></div>`;
  }
}

window.renderHome = renderHome;
