/* pages/orders.js — Мои заказы (покупатель) */

function badgeOrderHtml(status) {
  const map = {
    created:           ['badge-created',    'Создан'],
    paid:              ['badge-paid',        'Оплачен'],
    ready_for_pickup:  ['badge-ready',       'Готов к выдаче'],
    completed:         ['badge-completed',   'Завершён'],
    cancelled:         ['badge-cancelled',   'Отменён'],
  };
  const [cls, label] = map[status] || ['badge-created', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

async function renderOrders() {
  const app = document.getElementById('app');
  app.innerHTML = pageShell(`
    <div class="page-head"><h1 class="page-title">📦 Мои заказы</h1><p class="page-desc">История ваших покупок</p></div>
    <div id="orders-wrap"><div class="spinner"></div></div>
  `);
  loadOrdersList();
}

async function loadOrdersList() {
  const wrap = document.getElementById('orders-wrap');
  if (!wrap) return;
  try {
    const orders = await API.getMyOrders();
    if (!orders?.length) {
      wrap.innerHTML = `
        <div class="empty-state big">
          <div class="icon">📦</div>
          <p>Заказов пока нет.</p>
          <button class="btn btn-primary" onclick="router.go('/market')">Перейти в Рынок</button>
        </div>`;
      return;
    }
    wrap.innerHTML = `<div class="orders-list">${orders.map(orderCardHtml).join('')}</div>`;
  } catch (e) {
    wrap.innerHTML = `<div class="empty-state"><p>⚠️ ${e.message}</p></div>`;
  }
}

function orderCardHtml(o) {
  const date  = o.created_at ? new Date(o.created_at).toLocaleDateString('ru') : '—';
  const total = o.total_price != null ? `${Number(o.total_price).toLocaleString('ru')} сум` : '—';
  const canCancel   = ['created', 'paid'].includes(o.status);
  const canComplete = o.status === 'ready_for_pickup';
  const img = o.product_photo ? `<img src="${API_PHOTO(o.product_photo)}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'oc-ph',textContent:'🥬'}))"/>` : '<div class="oc-ph">🥬</div>';
  return `
    <div class="order-card" id="buyer-order-${o.id}">
      <div class="oc-img">${img}</div>
      <div class="oc-main">
        <div class="oc-top">
          <span class="oc-name">${o.product_title || ('Товар #' + o.product_id)}</span>
          ${badgeOrderHtml(o.status)}
        </div>
        <div class="oc-meta">🌱 ${o.fermer_name || 'Фермер'} · ${o.quantity} шт · ${date}</div>
        <div class="oc-total">${total}</div>
      </div>
      <div class="oc-actions">
        ${canCancel   ? `<button class="btn btn-danger btn-sm"  onclick="cancelOrder(${o.id})">Отменить</button>` : ''}
        ${canComplete ? `<button class="btn btn-primary btn-sm" onclick="confirmReceived(${o.id})">Получил</button>` : ''}
      </div>
    </div>
  `;
}

function API_PHOTO(u) {
  if (!u) return '';
  return u.startsWith('http') ? u : (`http://${location.hostname}:8000` + u);
}

async function cancelOrder(id) {
  if (!confirm('Отменить этот заказ?')) return;
  try { await API.cancelOrder(id); showToast('Заказ отменён'); loadOrdersList(); }
  catch (e) { showToast(e.message, 'error'); }
}

async function confirmReceived(id) {
  try { await API.completeOrder(id); showToast('✅ Получение подтверждено!'); loadOrdersList(); }
  catch (e) { showToast(e.message, 'error'); }
}

window.renderOrders = renderOrders;
window.cancelOrder  = cancelOrder;
window.confirmReceived = confirmReceived;
