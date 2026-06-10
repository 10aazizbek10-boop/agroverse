/* auth.js — управление токеном, ролями, уведомлениями */

const Auth = {
  setToken(token) { localStorage.setItem('access_token', token); },
  getToken()      { return localStorage.getItem('access_token'); },
  removeToken()   { localStorage.removeItem('access_token'); },

  setUser(user)   { localStorage.setItem('av_user', JSON.stringify(user)); },
  getUser()       {
    try { return JSON.parse(localStorage.getItem('av_user')); }
    catch { return null; }
  },
  removeUser()    { localStorage.removeItem('av_user'); },

  isLoggedIn()    { return !!this.getToken(); },
  getRole()       { return this.getUser()?.role || null; },
  isFarmer()      { return this.getRole() === 'fermer'; },
  isBuyer()       { return this.getRole() === 'xaridor'; },
  isAdmin()       { return this.getRole() === 'admin'; },

  logout() {
    this.removeToken();
    this.removeUser();
    window.router.go('/login');
  },
};

/* ============================
   Toast notifications
   ============================ */
function showToast(message, type = 'success', duration = 3500) {
  const container = document.getElementById('toast-container');
  const icons = { success: '✅', error: '❌', warn: '⚠️', info: 'ℹ️' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity .3s, transform .3s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(60px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ============================
   Pending success message
   ============================ */
function setPendingMessage(msg) { sessionStorage.setItem('av_pending_msg', msg); }
function popPendingMessage() {
  const m = sessionStorage.getItem('av_pending_msg');
  sessionStorage.removeItem('av_pending_msg');
  return m;
}

/* ============================
   Spinner helpers
   ============================ */
function showSpinner(container) {
  container.innerHTML = '<div class="spinner"></div>';
}

const NAV_FARMER = [
  { path: '/home',        icon: '🏠', key: 'nav_home' },
  { path: '/market',      icon: '🛒', key: 'nav_market' },
  { path: '/product/new', icon: '➕', key: 'nav_add_product' },
  { path: '/ai',          icon: '🤖', key: 'nav_ai' },
  { path: '/tariffs',     icon: '⭐', key: 'nav_tariffs' },
  { path: '/profile',     icon: '👤', key: 'nav_profile' },
  { path: '/wallet',      icon: '💰', key: 'nav_wallet' },
];

const NAV_BUYER = [
  { path: '/home',    icon: '🏠', key: 'nav_home' },
  { path: '/market',  icon: '🛒', key: 'nav_market' },
  { path: '/ai',      icon: '🤖', key: 'nav_ai' },
  { path: '/tariffs', icon: '⭐', key: 'nav_tariffs' },
  { path: '/orders',  icon: '📦', key: 'nav_orders' },
  { path: '/cart',    icon: '🛍️', key: 'nav_cart' },
  { path: '/profile', icon: '👤', key: 'nav_profile' },
  { path: '/wallet',  icon: '💰', key: 'nav_wallet' },
];

const NAV_ADMIN = [
  { path: '/admin',   icon: '📊', key: 'nav_admin' },
  { path: '/market',  icon: '🛒', key: 'nav_market' },
  { path: '/tariffs', icon: '⭐', key: 'nav_tariffs' },
];

function getNavItems() {
  if (Auth.isAdmin && Auth.isAdmin()) return NAV_ADMIN;
  return Auth.isFarmer() ? NAV_FARMER : NAV_BUYER;
}

function currentPath() {
  return (window.location.hash || '#/home').replace(/^#/, '') || '/home';
}

/* Главный layout-обёртка с навбаром. content — HTML строки страницы. */
function buildHeader() {
  const user = Auth.getUser();
  const path = currentPath();
  const items = getNavItems();
  const cartCount = getCartCount();

  const links = items.map(it => {
    const active = path === it.path || (it.path === '/market' && path.startsWith('/product') && path !== '/product/new');
    const badge = (it.path === '/cart' && cartCount > 0)
      ? `<span class="nav-badge">${cartCount}</span>` : '';
    return `<a class="nav-link ${active ? 'active' : ''}" onclick="router.go('${it.path}')">
      <span class="nav-ic">${it.icon}</span><span class="nav-tx">${t(it.key)}</span>${badge}
    </a>`;
  }).join('');

  const cur = (window.I18nManager && I18nManager.current) || 'uz';
  const langOpts = (window.I18nManager ? I18nManager.langs() : [])
    .map(l => `<option value="${l.code}" ${l.code === cur ? 'selected' : ''}>${l.flag} ${l.label}</option>`)
    .join('');
  const chipIcon = (Auth.isAdmin && Auth.isAdmin()) ? '👑' : (Auth.isFarmer() ? '🌱' : '🛍️');

  return `
    <header class="navbar">
      <div class="nav-inner">
        <div class="nav-logo" onclick="router.go('${(Auth.isAdmin && Auth.isAdmin()) ? '/admin' : '/home'}')">
          <span class="logo-leaf">🌾</span><span class="logo-text"><b>Agro</b>Verse</span>
        </div>
        <nav class="nav-links">${links}</nav>
        <div class="nav-right">
          <select class="lang-select" onchange="I18nManager.set(this.value)">${langOpts}</select>
          <span class="user-chip">${chipIcon} ${user?.name || user?.phone || ''}</span>
          <button class="btn-logout" onclick="Auth.logout()" title="${t('nav_logout')}">⏻</button>
        </div>
        <button class="nav-burger" onclick="document.querySelector('.nav-links').classList.toggle('open')">☰</button>
      </div>
    </header>
  `;
}

/* Обёртка страницы: navbar + контейнер */
function pageShell(contentHtml, opts = {}) {
  return `
    ${buildHeader()}
    <main class="app-main ${opts.wide ? 'wide' : ''}">
      ${contentHtml}
    </main>
  `;
}

/* ============ Корзина (localStorage) ============ */
function getCart()      { try { return JSON.parse(localStorage.getItem('av_cart') || '[]'); } catch { return []; } }
function setCart(items)  { localStorage.setItem('av_cart', JSON.stringify(items)); }
function getCartCount()  { return getCart().reduce((s, i) => s + (i.qty || 1), 0); }
function addToCart(product, qty = 1) {
  const cart = getCart();
  const ex = cart.find(i => i.id === product.id);
  if (ex) ex.qty += qty;
  else cart.push({ id: product.id, name: product.name, price: product.price, unit: product.unit, image: product.images?.[0] || '', qty });
  setCart(cart);
}
function removeFromCart(id) { setCart(getCart().filter(i => i.id !== id)); }
function clearCart() { setCart([]); }

/* ============================
   Экран блокировки аккаунта
   ============================ */
function showBlockedScreen(reason) {
  // остановить heartbeat
  if (window.__blockHeartbeat) { clearInterval(window.__blockHeartbeat); window.__blockHeartbeat = null; }
  const r = reason || 'Причина не указана';
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    <div class="blocked-screen">
      <div class="blocked-box">
        <div class="blocked-ic">🚫</div>
        <h1 class="blocked-title">Ваш аккаунт заблокирован</h1>
        <p class="blocked-lead">Доступ к AgroVerse временно ограничен администрацией платформы.</p>
        <div class="blocked-letter">
          <div class="bl-head">📩 Сообщение от администрации</div>
          <div class="bl-reason-label">Причина блокировки:</div>
          <div class="bl-reason">${r}</div>
          <div class="bl-foot">Если вы считаете, что произошла ошибка, свяжитесь с поддержкой AgroVerse.<br>Аккаунт будет восстановлен после снятия блокировки администратором.</div>
        </div>
        <button class="btn btn-primary btn-lg" onclick="Auth.logout()">Вернуться ко входу</button>
      </div>
    </div>`;
  window.scrollTo(0, 0);
}

/* Периодическая проверка: если админ заблокировал — моментально выгоняем */
function startBlockHeartbeat() {
  if (window.__blockHeartbeat) clearInterval(window.__blockHeartbeat);
  window.__blockHeartbeat = setInterval(() => {
    if (!Auth.isLoggedIn()) return;
    // getMe вернёт 403 blocked → api.js сам покажет экран блокировки
    API.getMe().catch(() => {});
  }, 15000);
}

window.showBlockedScreen = showBlockedScreen;
window.startBlockHeartbeat = startBlockHeartbeat;

window.Auth = Auth;
window.showToast = showToast;
window.setPendingMessage = setPendingMessage;
window.popPendingMessage = popPendingMessage;
window.showSpinner = showSpinner;
window.buildHeader = buildHeader;
window.pageShell = pageShell;
window.getCart = getCart;
window.setCart = setCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.getNavItems = getNavItems;
