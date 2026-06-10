/* pages/admin.js — Админ-панель: статистика, пользователи, модерация */

async function renderAdmin() {
  const app = document.getElementById('app');

  if (!Auth.isAdmin || !Auth.isAdmin()) {
    router.go('/login');
    return;
  }

  app.innerHTML = pageShell(`
    <div class="admin-page">
      <div class="page-head"><h1>📊 ${t('admin_title')}</h1></div>

      <div class="admin-stats" id="admin-stats">
        <div class="stat-card"><div class="stat-ic">👥</div><div class="stat-num" id="st-users">—</div><div class="stat-lbl">${t('stat_users')}</div></div>
        <div class="stat-card"><div class="stat-ic">📦</div><div class="stat-num" id="st-products">—</div><div class="stat-lbl">${t('stat_products')}</div></div>
        <div class="stat-card"><div class="stat-ic">🧾</div><div class="stat-num" id="st-orders">—</div><div class="stat-lbl">${t('stat_orders')}</div></div>
      </div>

      <div class="admin-tabs">
        <button class="admin-tab active" data-tab="moderation" onclick="adminSwitchTab('moderation')">🛂 ${t('admin_moderation')}</button>
        <button class="admin-tab" data-tab="users" onclick="adminSwitchTab('users')">👥 ${t('admin_users')}</button>
      </div>

      <div id="admin-content"><div class="spinner"></div></div>
    </div>
  `);

  loadAdminStats();
  adminSwitchTab('moderation');
}

async function loadAdminStats() {
  try {
    const [users, pending, orders] = await Promise.all([
      API.adminGetUsers({ limit: 1000 }).catch(() => []),
      API.adminPendingProducts().catch(() => []),
      API.adminOrdersReport().catch(() => null),
    ]);
    const elU = document.getElementById('st-users');
    const elP = document.getElementById('st-products');
    const elO = document.getElementById('st-orders');
    if (elU) elU.textContent = Array.isArray(users) ? users.length : '0';
    // товаров всего узнаём через products list
    try {
      const prods = await API.getProducts({ limit: 1000 });
      if (elP) elP.textContent = Array.isArray(prods) ? prods.length : '0';
    } catch { if (elP) elP.textContent = '0'; }
    if (elO) {
      const cnt = orders && (orders.total_orders ?? orders.count ?? (Array.isArray(orders) ? orders.length : null));
      elO.textContent = cnt != null ? cnt : '0';
    }
  } catch (e) { /* тихо */ }
}

async function adminSwitchTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  const box = document.getElementById('admin-content');
  box.innerHTML = '<div class="spinner"></div>';

  if (tab === 'moderation') {
    try {
      const pending = await API.adminPendingProducts();
      if (!pending || pending.length === 0) {
        box.innerHTML = `<div class="empty-state">✅ ${t('no_pending')}</div>`;
        return;
      }
      box.innerHTML = `
        <h3 style="margin-bottom:16px;">${t('pending_products')}</h3>
        <div class="admin-list">
          ${pending.map(p => `
            <div class="admin-row" id="prow-${p.id}">
              <div class="ar-main">
                <div class="ar-title">${p.title}</div>
                <div class="ar-sub">${p.category} · ${p.price} ${t('currency')} · 🌱 ${p.fermer_name || ''}</div>
              </div>
              <div class="ar-actions">
                <button class="btn-sm btn-approve" onclick="adminApprove(${p.id})">✓ ${t('approve')}</button>
                <button class="btn-sm btn-reject" onclick="adminReject(${p.id})">✕ ${t('reject')}</button>
              </div>
            </div>
          `).join('')}
        </div>`;
    } catch (e) {
      box.innerHTML = `<div class="empty-state">${e.message}</div>`;
    }
  } else if (tab === 'users') {
    try {
      const users = await API.adminGetUsers({ limit: 1000 });
      box.innerHTML = `
        <div class="admin-list">
          ${users.map(u => `
            <div class="admin-row ${u.is_active ? '' : 'blocked'}" id="urow-${u.id}">
              <div class="ar-main">
                <div class="ar-title">${roleIcon(u.role)} ${u.name} ${u.is_active ? '' : '<span class="blocked-tag">⛔ заблокирован</span>'}</div>
                <div class="ar-sub">${u.phone} · ${u.role} · ${u.tariff} · ${u.bonus_points} 🎁</div>
                ${!u.is_active && u.block_reason ? `<div class="ar-reason">📩 Причина: ${u.block_reason}</div>` : ''}
              </div>
              <div class="ar-actions">
                ${u.role === 'admin' ? '' : (u.is_active
                  ? `<button class="btn-sm btn-reject" onclick="adminBlock(${u.id})">⛔ ${t('block')}</button>`
                  : `<button class="btn-sm btn-approve" onclick="adminUnblock(${u.id})">✓ ${t('unblock')}</button>`)}
              </div>
            </div>
          `).join('')}
        </div>`;
    } catch (e) {
      box.innerHTML = `<div class="empty-state">${e.message}</div>`;
    }
  }
}

function roleIcon(r) { return r === 'fermer' ? '🌱' : r === 'admin' ? '👑' : '🛍️'; }

async function adminApprove(id) {
  try { await API.adminApproveProduct(id); document.getElementById('prow-' + id)?.remove(); showToast(t('approve') + ' ✓', 'success'); loadAdminStats(); }
  catch (e) { showToast(e.message, 'error'); }
}
async function adminReject(id) {
  try { await API.adminRejectProduct(id); document.getElementById('prow-' + id)?.remove(); showToast(t('reject') + ' ✓', 'success'); loadAdminStats(); }
  catch (e) { showToast(e.message, 'error'); }
}
function adminBlock(id) {
  // модалка для ввода причины блокировки
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-ic">⛔</div>
      <h3 class="modal-title">Блокировка пользователя</h3>
      <p class="modal-desc">Укажите причину — пользователь увидит её при попытке входа.</p>
      <textarea id="block-reason" class="modal-textarea" placeholder="Например: Нарушение правил публикации товаров, спам, мошенничество…"></textarea>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="block-cancel">Отмена</button>
        <button class="btn btn-danger" id="block-confirm">⛔ Заблокировать</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('#block-cancel').addEventListener('click', close);
  overlay.querySelector('#block-confirm').addEventListener('click', async () => {
    const reason = overlay.querySelector('#block-reason').value.trim();
    const btn = overlay.querySelector('#block-confirm');
    btn.disabled = true; btn.textContent = 'Блокируем…';
    try {
      await API.adminBlockUser(id, reason);
      close();
      showToast('Пользователь заблокирован ⛔', 'success');
      adminSwitchTab('users');
    } catch (e) {
      btn.disabled = false; btn.textContent = '⛔ Заблокировать';
      showToast(e.message, 'error');
    }
  });
  setTimeout(() => overlay.querySelector('#block-reason')?.focus(), 50);
}
async function adminUnblock(id) {
  try { await API.adminUnblockUser(id); showToast(t('unblock') + ' ✓', 'success'); adminSwitchTab('users'); }
  catch (e) { showToast(e.message, 'error'); }
}

window.renderAdmin = renderAdmin;
window.adminSwitchTab = adminSwitchTab;
window.adminApprove = adminApprove;
window.adminReject = adminReject;
window.adminBlock = adminBlock;
window.adminUnblock = adminUnblock;
