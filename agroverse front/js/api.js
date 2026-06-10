// Берём тот же хост, что и у сайта (localhost или 127.0.0.1) — чтобы не ловить CORS
const BASE_URL = `http://${location.hostname || '127.0.0.1'}:8000`;

function getToken() {
  return localStorage.getItem('access_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(method, path, { body, formData, params } = {}) {
  let url = BASE_URL + path;

  if (params) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined))
    ).toString();
    if (qs) url += '?' + qs;
  }

  const headers = { ...authHeaders() };
  let fetchBody;

  if (formData) {
    // FormData сам выставит Content-Type с boundary — вручную не трогаем
    fetchBody = formData;
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    fetchBody = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, { method, headers, body: fetchBody });

    if (res.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('av_user');
      window.router && window.router.go('/login');
      throw new Error('Сессия истекла, войдите снова');
    }

    const data = res.headers.get('content-type')?.includes('application/json')
      ? await res.json()
      : await res.text();

    // Аккаунт заблокирован — выгоняем и показываем большой экран блокировки
    if (res.status === 403 && data && typeof data === 'object'
        && data.detail && typeof data.detail === 'object' && data.detail.blocked) {
      const reason = data.detail.reason || 'Причина не указана';
      localStorage.removeItem('access_token');
      localStorage.removeItem('av_user');
      if (typeof window.showBlockedScreen === 'function') window.showBlockedScreen(reason);
      throw new Error('BLOCKED');
    }

    if (!res.ok) {
      const msg = typeof data === 'object' && data.detail
        ? (Array.isArray(data.detail) ? (data.detail[0]?.msg || 'Ошибка') : (typeof data.detail === 'object' ? (data.detail.reason || 'Ошибка') : data.detail))
        : (data.message || 'Произошла ошибка');
      throw new Error(msg);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/* ============================================================
   Нормализация продукта: бэк отдаёт title/price_per_unit/photos/
   quantity_available/status, фронт работает с единым форматом.
   ============================================================ */
function normalizeProduct(p) {
  if (!p) return p;
  return {
    id: p.id,
    fermer_id: p.fermer_id,
    fermer_name: p.fermer_name,
    name: p.title,
    description: p.description,
    category: p.category,
    price: p.price_per_unit,
    unit: p.unit,
    quantity: p.quantity_available,
    images: Array.isArray(p.photos) ? p.photos.map(u => u.startsWith('http') ? u : BASE_URL + u) : [],
    rating: p.rating || 0,
    status: p.status,
    created_at: p.created_at,
  };
}

const API = {
  // Auth
  login:         (body) => request('POST', '/api/auth/login', { body }),
  register:      (body) => request('POST', '/api/auth/register', { body }),
  getMe:         ()     => request('GET', '/api/auth/me'),
  updateProfile: (body) => request('PATCH', '/api/auth/me', { body }),

  // Products — getProducts всегда возвращает МАССИВ нормализованных товаров
  async getProducts(params) {
    const res = await request('GET', '/api/products/', { params });
    const list = Array.isArray(res) ? res : (res?.products || []);
    return list.map(normalizeProduct);
  },
  async getProduct(id) {
    const res = await request('GET', `/api/products/${id}`);
    return normalizeProduct(res);
  },
  createProduct: (formData) => request('POST', '/api/products/', { formData }),
  deleteProduct: (id)       => request('DELETE', `/api/products/${id}`),

  // Orders
  getMyOrders:   () => request('GET', '/api/orders/my'),
  createOrder:   (body) => request('POST', '/api/orders/', { body }),
  cancelOrder:   (id) => request('PATCH', `/api/orders/${id}/cancel`),
  completeOrder: (id) => request('PATCH', `/api/orders/${id}/complete`),
  markReady:     (id) => request('PATCH', `/api/orders/${id}/ready`),

  // Wallet
  getWallet:     () => request('GET', '/api/payment/wallet'),

  // Admin
  adminGetUsers:       (params) => request('GET', '/api/admin/users', { params }),
  adminBlockUser:      (id, reason) => request('PATCH', `/api/admin/users/${id}/block`, { body: { reason: reason || '' } }),
  adminUnblockUser:    (id) => request('PATCH', `/api/admin/users/${id}/unblock`),
  adminPendingProducts:() => request('GET', '/api/admin/products/pending'),
  adminApproveProduct: (id) => request('PATCH', `/api/admin/products/${id}/approve`),
  adminRejectProduct:  (id) => request('PATCH', `/api/admin/products/${id}/reject`),
  adminOrdersReport:   () => request('GET', '/api/admin/reports/orders'),
  adminRevenueReport:  () => request('GET', '/api/admin/reports/revenue'),
};

window.API = API;
window.normalizeProduct = normalizeProduct;
