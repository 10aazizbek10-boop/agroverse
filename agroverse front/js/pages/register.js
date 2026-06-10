function renderRegister() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card" style="max-width:460px;">
        <div class="auth-lang">
          <select class="lang-select" onchange="I18nManager.set(this.value)">
            ${(window.I18nManager?I18nManager.langs():[]).map(l=>`<option value="${l.code}" ${l.code===I18nManager.current?'selected':''}>${l.flag} ${l.label}</option>`).join('')}
          </select>
        </div>
        <div class="auth-logo">
          <div class="logo">🌾 <span>Agro</span>Verse</div>
          <p>${t('create_account')}</p>
        </div>

        <h2 class="auth-title">${t('register')}</h2>
        <div id="reg-error" class="form-error hidden"></div>

        <div class="form-group">
          <label for="reg-name">${t('name')} *</label>
          <input type="text" id="reg-name" placeholder="${t('reg_name_ph')}" required />
        </div>

        <div class="form-group">
          <label for="reg-phone">${t('phone')} *</label>
          <input type="tel" id="reg-phone" placeholder="+998 90 000 00 00" required />
        </div>

        <div class="form-group">
          <label for="reg-email">${t('email')}</label>
          <input type="email" id="reg-email" placeholder="email@example.com" />
        </div>

        <div class="form-group">
          <label for="reg-password">${t('password_label')} *</label>
          <input type="password" id="reg-password" placeholder="${t('password_ph')}" required />
        </div>

        <div class="form-group">
          <label>${t('i_am')}</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" name="role" value="fermer" /> 🌾 ${t('role_farmer')}
            </label>
            <label class="radio-label">
              <input type="radio" name="role" value="xaridor" checked /> 🛒 ${t('role_buyer')}
            </label>
          </div>
        </div>

        <button class="btn btn-primary btn-full" id="reg-btn">${t('register')}</button>

        <div class="auth-footer">
          ${t('have_account')} <a href="#/login" onclick="router.go('/login'); return false;">${t('login')}</a>
        </div>
      </div>
    </div>
  `;

  const btn = document.getElementById('reg-btn');
  const errBox = document.getElementById('reg-error');

  btn.addEventListener('click', async function(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const roleElement = document.querySelector('input[name="role"]:checked');
    const role = roleElement ? roleElement.value : 'xaridor';

    errBox.classList.add('hidden');

    if (!name || !phone || !password) {
      errBox.textContent = t('fill_name_phone_pass');
      errBox.classList.remove('hidden');
      return;
    }
    if (password.length < 6) {
      errBox.textContent = t('pass_min6');
      errBox.classList.remove('hidden');
      return;
    }

    btn.disabled = true;
    btn.textContent = t('registering');

    const body = { name, phone, password, role };
    if (email) body.email = email;

    try {
      const data = await API.register(body);
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('av_user', JSON.stringify(data.user || { name, phone, role }));
        showToast('✅ ' + t('reg_success'), 'success');
        setTimeout(() => window.location.hash = '#/home', 800);
      } else {
        showToast('✅ ' + t('reg_success'), 'success');
        setTimeout(() => router.go('/login'), 1000);
      }
    } catch (error) {
      console.error('Register error:', error);
      if (error.message === 'BLOCKED') return;
      errBox.textContent = error.message || t('reg_error');
      errBox.classList.remove('hidden');
      btn.disabled = false;
      btn.textContent = t('register');
    }
  });
}

window.renderRegister = renderRegister;
