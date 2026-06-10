function renderLogin() {
  const app = document.getElementById('app');
  const pending = popPendingMessage();

  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-lang">
          <select class="lang-select" onchange="I18nManager.set(this.value)">
            ${(window.I18nManager?I18nManager.langs():[]).map(l=>`<option value="${l.code}" ${l.code===I18nManager.current?'selected':''}>${l.flag} ${l.label}</option>`).join('')}
          </select>
        </div>
        <div class="auth-logo">
          <div class="logo">🌾 <span>Agro</span>Verse</div>
          <p>${t('login_subtitle')}</p>
        </div>

        <h2 class="auth-title">${t('login_to_account')}</h2>

        ${pending ? `<div class="form-error" style="background:#d4edda;border-color:#c3e6cb;color:#155724;">${pending}</div>` : ''}
        <div id="login-error" class="form-error hidden"></div>

        <div class="form-group">
          <label for="phone">${t('phone')}</label>
          <input type="tel" id="phone" placeholder="+998 90 000 00 00" required />
        </div>

        <div class="form-group">
          <label for="password">${t('password_label')}</label>
          <input type="password" id="password" placeholder="••••••••" required />
        </div>

        <button class="btn btn-primary btn-full" id="login-btn">${t('login')}</button>

        <div class="auth-footer">
          ${t('no_account')} <a href="#/register" onclick="router.go('/register'); return false;">${t('register')}</a>
        </div>
      </div>
    </div>
  `;

  const btn = document.getElementById('login-btn');
  const errBox = document.getElementById('login-error');

  async function handleLogin() {
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;

    if (!phone || !password) {
      errBox.textContent = t('fill_all');
      errBox.classList.remove('hidden');
      return;
    }

    btn.disabled = true;
    btn.textContent = t('logging_in');
    errBox.classList.add('hidden');

    try {
      const data = await API.login({ phone, password });
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('av_user', JSON.stringify(data.user));
      showToast('✅ ' + t('login_success'), 'success');
      const dest = data.user && data.user.role === 'admin' ? '#/admin' : '#/home';
      setTimeout(() => window.location.hash = dest, 400);
    } catch (e) {
      console.error('Login error:', e);
      if (e.message === 'BLOCKED') return;
      errBox.textContent = e.message || t('bad_credentials');
      errBox.classList.remove('hidden');
      btn.disabled = false;
      btn.textContent = t('login');
    }
  }

  btn.addEventListener('click', handleLogin);
  document.getElementById('password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
}

window.renderLogin = renderLogin;
