/* pages/cart.js — корзина покупателя */

function renderCart() {
  const app = document.getElementById('app');
  const cart = getCart();

  if (!cart.length) {
    app.innerHTML = pageShell(`
      <div class="page-head"><h1 class="page-title">🛍️ Корзина</h1></div>
      <div class="empty-state big">
        <div class="icon">🛒</div>
        <p>Корзина пуста</p>
        <button class="btn btn-primary" onclick="router.go('/market')">Перейти в Рынок</button>
      </div>
    `);
    return;
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  app.innerHTML = pageShell(`
    <div class="page-head"><h1 class="page-title">🛍️ Корзина</h1><p class="page-desc">${cart.length} позиц.</p></div>
    <div class="cart-layout">
      <div class="cart-items">
        ${cart.map(i => `
          <div class="cart-item" data-id="${i.id}">
            <div class="ci-img">${i.image ? `<img src="${i.image}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'ci-ph',textContent:'🥬'}))"/>` : '<div class="ci-ph">🥬</div>'}</div>
            <div class="ci-info">
              <div class="ci-name">${i.name}</div>
              <div class="ci-price">${Number(i.price).toLocaleString('ru')} сум/${i.unit || 'кг'}</div>
            </div>
            <div class="ci-qty">
              <button onclick="cartQty(${i.id}, -1)">−</button>
              <span>${i.qty}</span>
              <button onclick="cartQty(${i.id}, 1)">+</button>
            </div>
            <div class="ci-sum">${Number(i.price * i.qty).toLocaleString('ru')} сум</div>
            <button class="ci-del" onclick="cartRemove(${i.id})">🗑️</button>
          </div>
        `).join('')}
      </div>
      <div class="cart-summary card">
        <h3>Итого</h3>
        <div class="cs-row"><span>Товары</span><b>${Number(total).toLocaleString('ru')} сум</b></div>
        <div class="cs-row"><span>Доставка</span><b>самовывоз</b></div>
        <div class="cs-total"><span>К оплате</span><b>${Number(total).toLocaleString('ru')} сум</b></div>
        <button class="btn btn-primary btn-lg" onclick="cartCheckout()">Оформить заказ</button>
        <button class="btn btn-ghost btn-sm" onclick="clearCart(); renderCart();">Очистить корзину</button>
      </div>
    </div>
  `);
}

function cartQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  setCart(cart);
  renderCart();
}

function cartRemove(id) {
  removeFromCart(id);
  renderCart();
}

async function cartCheckout() {
  const cart = getCart();
  if (!cart.length) return;
  showToast('Оформляем заказ…', 'info');
  let ok = 0, fail = 0;
  for (const item of cart) {
    try {
      await API.createOrder({ product_id: item.id, quantity: item.qty, pickup_method: 'self' });
      ok++;
    } catch (e) { fail++; }
  }
  if (ok) {
    clearCart();
    showToast(`Заказ оформлен (${ok} поз.)`);
    router.go('/orders');
  } else {
    showToast('Не удалось оформить заказ', 'error');
  }
}

window.renderCart = renderCart;
window.cartQty = cartQty;
window.cartRemove = cartRemove;
window.cartCheckout = cartCheckout;
