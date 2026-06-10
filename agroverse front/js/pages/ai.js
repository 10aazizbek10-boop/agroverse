/* pages/ai.js — ИИ-помощник. Красивый чат-интерфейс БЕЗ логики (заглушка). */

function aiSuggestions(isFarmer) {
  const uz = I18nManager.current;
  const F = {
    uz: ['Bu bahorda nima ekish foydali?', 'Pomidorga qancha narx qoʻyay?', 'Mahsulotlarim sotuvini qanday oshiraman?'],
    ru: ['Что выгодно сажать этой весной?', 'Какую цену поставить на помидоры?', 'Как увеличить продажи моих товаров?'],
    en: ['What is profitable to plant this spring?', 'What price to set for tomatoes?', 'How to increase my product sales?'],
  };
  const B = {
    uz: ['Mavsumiy yangi sabzavotlarni tavsiya qil', 'Fermer mahsulotidan nima tayyorlash mumkin?', 'Bir haftaga savatcha tuzib ber'],
    ru: ['Посоветуй свежие сезонные овощи', 'Что приготовить из фермерских продуктов?', 'Собери корзину на неделю'],
    en: ['Suggest fresh seasonal vegetables', 'What to cook from farm products?', 'Build a cart for a week'],
  };
  return (isFarmer ? F : B)[uz] || (isFarmer ? F.ru : B.ru);
}

function renderAI() {
  const app = document.getElementById('app');
  const isFarmer = Auth.isFarmer();
  const suggestions = aiSuggestions(isFarmer);

  app.innerHTML = pageShell(`
    <div class="ai-wrap">
      <div class="ai-header">
        <div class="ai-orb"><span>🤖</span></div>
        <div>
          <h1 class="ai-title">${t('ai_promo_title')}</h1>
          <p class="ai-status"><span class="ai-dot"></span> ${t('ai_beta')}</p>
        </div>
      </div>

      <div class="ai-chat" id="ai-chat">
        <div class="ai-msg bot">
          <div class="ai-ava">🤖</div>
          <div class="ai-bubble">
            ${t('ai_greeting')}<br>
            ${isFarmer ? t('ai_farmer_help') : t('ai_buyer_help')}
            <br><br><i class="ai-soon">⚙️ ${t('ai_learning')}</i>
          </div>
        </div>
      </div>

      <div class="ai-suggest" id="ai-suggest">
        ${suggestions.map(s => `<button class="ai-chip" onclick="aiSend('${s.replace(/'/g, "\\'")}')">${s}</button>`).join('')}
      </div>

      <div class="ai-input-bar">
        <input type="text" id="ai-input" placeholder="${t('ai_msg_placeholder')}" onkeydown="if(event.key==='Enter')aiSend()" />
        <button class="ai-send" onclick="aiSend()">➤</button>
      </div>
    </div>
  `);
}

function aiSend(text) {
  const input = document.getElementById('ai-input');
  const msg = (text || input?.value || '').trim();
  if (!msg) return;
  const chat = document.getElementById('ai-chat');
  if (input) input.value = '';
  document.getElementById('ai-suggest')?.classList.add('hidden');

  chat.insertAdjacentHTML('beforeend', `
    <div class="ai-msg user"><div class="ai-bubble">${msg}</div></div>
  `);
  chat.scrollTop = chat.scrollHeight;

  chat.insertAdjacentHTML('beforeend', `
    <div class="ai-msg bot" id="ai-typing">
      <div class="ai-ava">🤖</div>
      <div class="ai-bubble"><span class="ai-typing"><i></i><i></i><i></i></span></div>
    </div>
  `);
  chat.scrollTop = chat.scrollHeight;

  setTimeout(() => {
    document.getElementById('ai-typing')?.remove();
    chat.insertAdjacentHTML('beforeend', `
      <div class="ai-msg bot">
        <div class="ai-ava">🤖</div>
        <div class="ai-bubble">${t('ai_stub_answer')}</div>
      </div>
    `);
    chat.scrollTop = chat.scrollHeight;
  }, 1100);
}

window.renderAI = renderAI;
window.aiSend = aiSend;
