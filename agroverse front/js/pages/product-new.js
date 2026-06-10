/* pages/product-new.js */

function renderProductNew() {
  const app = document.getElementById('app');

  app.innerHTML = pageShell(`
    <div class="form-page">
      <div class="back-link" onclick="router.go('/profile')">${t('back_to_profile')}</div>
      <div class="form-card">
        <h2>📦 ${t('pn_title')}</h2>
        <p style="color: var(--clr-muted); font-size: .95rem; margin-bottom: 28px;">${t('pn_subtitle')}</p>

        <div id="pn-error" class="form-error hidden"></div>

        <div class="form-row">
          <div class="form-group">
            <label for="pn-name">${t('pn_name')} *</label>
            <input type="text" id="pn-name" placeholder="${t('pn_name_ph')}" required />
          </div>
          <div class="form-group">
            <label for="pn-category">${t('pn_category')} *</label>
            <select id="pn-category">
              <option value="">${t('pn_choose_cat')}</option>
              <option value="Овощи">🥦 Овощи</option>
              <option value="Фрукты">🍎 Фрукты</option>
              <option value="Зелень">🌿 Зелень</option>
              <option value="Зерновые">🌾 Зерновые</option>
              <option value="Молочные">🥛 Молочные</option>
              <option value="Мёд">🍯 Мёд</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="pn-description">${t('pn_desc')} *</label>
          <textarea id="pn-description" placeholder="${t('pn_desc_ph')}"></textarea>
          <small style="color: var(--clr-muted); font-size: .8rem;">${t('pn_desc_hint')}</small>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="pn-price">${t('pn_price')} *</label>
            <input type="number" id="pn-price" placeholder="0.00" min="0" step="0.01" />
          </div>
          <div class="form-group">
            <label for="pn-unit">${t('pn_unit')}</label>
            <select id="pn-unit">
              <option value="кг">кг (килограмм)</option>
              <option value="шт">шт (штука)</option>
              <option value="литр">л (литр)</option>
              <option value="г">г (грамм)</option>
              <option value="дюжина">дюжина</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="pn-quantity">${t('pn_qty')} *</label>
          <input type="number" id="pn-quantity" placeholder="0" min="0" />
        </div>

        <div class="form-group">
          <label>${t('pn_photos')}</label>
          <div class="file-upload-zone" id="upload-zone">
            <input type="file" id="pn-images" multiple accept="image/*" />
            <div class="upload-icon">📸</div>
            <p>${t('pn_drop')}</p>
            <p style="font-size:.8rem;margin-top:8px;color:var(--clr-muted);">${t('pn_drop_hint')}</p>
          </div>
          <div id="image-previews" class="image-previews"></div>
        </div>

        <button class="btn btn-primary btn-full" id="publish-btn" style="padding: 14px 24px; font-size: 1rem;">
          <span>✨</span> ${t('pn_publish')}
        </button>
      </div>
    </div>
  `);

  // Image preview
  const fileInput = document.getElementById('pn-images');
  const previewsEl = document.getElementById('image-previews');

  fileInput?.addEventListener('change', () => {
    previewsEl.innerHTML = '';
    Array.from(fileInput.files).forEach(file => {
      const url = URL.createObjectURL(file);
      const img = document.createElement('img');
      img.src = url;
      img.className = 'image-preview';
      previewsEl.appendChild(img);
    });
  });

  // Drag over
  const zone = document.getElementById('upload-zone');
  zone?.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
  zone?.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone?.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    fileInput.files = e.dataTransfer.files;
    fileInput.dispatchEvent(new Event('change'));
  });

  // Submit
  document.getElementById('publish-btn')?.addEventListener('click', async () => {
    const name     = document.getElementById('pn-name').value.trim();
    const category = document.getElementById('pn-category').value;
    const desc     = document.getElementById('pn-description').value.trim();
    const price    = document.getElementById('pn-price').value;
    const unit     = document.getElementById('pn-unit').value;
    const quantity = document.getElementById('pn-quantity').value;
    const files    = document.getElementById('pn-images').files;
    const errBox   = document.getElementById('pn-error');
    const btn      = document.getElementById('publish-btn');

    if (!name || !category || !price || !quantity) {
      errBox.textContent = t('pn_fill_required');
      const catEl = document.getElementById('pn-category');
      if (catEl && !category) catEl.classList.add('error');
      errBox.classList.remove('hidden');
      ['pn-name','pn-price','pn-quantity'].forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.value.trim()) el.classList.add('error');
      });
      return;
    }

    if (desc.length < 10) {
      errBox.textContent = t('pn_desc_min');
      errBox.classList.remove('hidden');
      document.getElementById('pn-description').classList.add('error');
      return;
    }

    btn.disabled = true;
    btn.textContent = t('pn_publishing');
    errBox.classList.add('hidden');

    const fd = new FormData();
    fd.append('title', name);
    fd.append('category', category);
    fd.append('description', desc);
    fd.append('price_per_unit', price);
    fd.append('unit', unit);
    fd.append('quantity_available', quantity);
    if (files && files.length > 0) {
      Array.from(files).forEach(f => { if (f && f.size > 0) fd.append('photos', f); });
    }

    try {
      await API.createProduct(fd);
      setPendingMessage('✅ ' + t('pn_success'));
      router.go('/profile');
    } catch (e) {
      if (e.message === 'BLOCKED') return;
      errBox.textContent = e.message;
      errBox.classList.remove('hidden');
      btn.disabled = false;
      btn.textContent = t('pn_publish');
    }
  });

  // Remove error class on input
  ['pn-name','pn-price','pn-quantity','pn-description'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', (e) => e.target.classList.remove('error'));
  });
}

window.renderProductNew = renderProductNew;