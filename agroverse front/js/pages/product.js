/* pages/product.js — детальная страница товара */

async function renderProduct(id) {
  const app = document.getElementById('app');
  app.innerHTML = pageShell(`
    <div class="back-link" onclick="router.go('/market')">← Назад в Рынок</div>
    <div id="product-content"><div class="spinner"></div></div>
  `);

  const content = document.getElementById('product-content');
  const isBuyer = Auth.isBuyer();

  try {
    const p = await API.getProduct(id);
    const emoji = CAT_EMOJI[p.category] || '🥬';

    const orderPanel = isBuyer ? `
      <div class="order-panel card">
        <h3>Оформить заказ</h3>
        <div id="order-error" class="form-error hidden"></div>
        <div class="form-group">
          <label for="qty">Количество (${p.unit || 'кг'})</label>
          <input type="number" id="qty" value="1" min="1" max="${p.quantity || 9999}" />
        </div>
        <div class="form-group">
          <label>Способ получения</label>
          <div class="radio-col">
            <label class="radio-label"><input type="radio" name="pickup" value="self" checked /> 🚗 Самовывоз</label>
            <label class="radio-label"><input type="radio" name="pickup" value="farmer" /> 🚜 Доставка фермером</label>
            <label class="radio-label"><input type="radio" name="pickup" value="external" /> 📦 Внешняя доставка</label>
          </div>
        </div>
        <div class="order-total">
          <span>Итого</span>
          <b id="total-price">${Number(p.price).toLocaleString('ru')} сум</b>
        </div>
        <button class="btn btn-primary btn-full" id="order-btn">Заказать</button>
        <button class="btn btn-ghost btn-full" id="cart-btn">🛍️ В корзину</button>
      </div>
    ` : `
      <div class="order-panel card">
        <h3>Информация о товаре</h3>
        <div class="meta-row"><span>📦 В наличии</span><b>${p.quantity} ${p.unit || 'кг'}</b></div>
        <div class="meta-row"><span>📊 Статус</span><b>${p.status === 'pending' ? 'на модерации' : 'активен'}</b></div>
        <div class="meta-row"><span>🏷️ Категория</span><b>${p.category || '—'}</b></div>
        <p class="hint" style="margin-top:14px">Это карточка товара со стороны фермера.</p>
      </div>
    `;

    content.innerHTML = `
      <div class="product-detail-layout">
        <div class="product-gallery">
          ${p.images?.length
            ? `<img src="${p.images[0]}" alt="${p.name}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'gallery-ph',textContent:'${emoji}'}))" />`
            : `<div class="gallery-ph">${emoji}</div>`}
        </div>
        <div class="product-info">
          <span class="pi-cat">${emoji} ${p.category || ''}</span>
          <h1>${p.name}</h1>
          <div class="price-big">${Number(p.price).toLocaleString('ru')} <small>сум / ${p.unit || 'кг'}</small></div>
          <div class="pi-rating">${starsHtml(p.rating)}</div>
          <p class="description">${p.description || 'Описание не указано.'}</p>
          <div class="farmer-block">
            <div class="fb-ava">🌱</div>
            <div>
              <div class="fb-label">Фермер</div>
              <div class="fb-name">${p.fermer_name || 'Фермер'}</div>
            </div>
          </div>
        </div>
        ${orderPanel}
      </div>
    `;

    if (isBuyer) {
      document.getElementById('qty')?.addEventListener('input', () => {
        const qty = parseFloat(document.getElementById('qty').value) || 1;
        document.getElementById('total-price').textContent = `${(qty * Number(p.price)).toLocaleString('ru')} сум`;
      });

      document.getElementById('cart-btn')?.addEventListener('click', () => {
        const qty = parseInt(document.getElementById('qty').value) || 1;
        addToCart(p, qty);
        showToast(`«${p.name}» в корзине`);
      });

      document.getElementById('order-btn')?.addEventListener('click', async () => {
        const quantity = parseInt(document.getElementById('qty').value) || 1;
        const pickup_method = document.querySelector('input[name="pickup"]:checked')?.value || 'self';
        const errBox = document.getElementById('order-error');
        const btn = document.getElementById('order-btn');
        btn.disabled = true; btn.textContent = 'Оформляем…'; errBox.classList.add('hidden');
        try {
          await API.createOrder({ product_id: Number(id), quantity, pickup_method });
          showToast('🎉 Заказ успешно оформлен!');
          router.go('/orders');
        } catch (e) {
          errBox.textContent = e.message; errBox.classList.remove('hidden');
          btn.disabled = false; btn.textContent = 'Заказать';
        }
      });
    }
  } catch (e) {
    content.innerHTML = `<div class="empty-state"><p>⚠️ ${e.message}</p></div>`;
  }
}

window.renderProduct = renderProduct;
