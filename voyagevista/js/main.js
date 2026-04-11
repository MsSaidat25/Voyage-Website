// ── NAV ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu
  var hamburger = document.querySelector('.nav-hamburger');
  var mobileNav = document.querySelector('.nav-mobile');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
    });
  }

  // Active nav link
  var currentPage = window.location.pathname.split('/').filter(Boolean).pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(function(link) {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
  });

  // ── CHATBOT ──────────────────────────────────────
  // ⚠️ Replace with your new OpenRouter API key
  var VV_API_KEY = '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';
  var VV_MODEL = 'anthropic/claude-3.5-haiku';

  var vvOpen = false, vvLoading = false;
  var vvHistory = [{
    role: 'system',
    content: 'You are the VoyageVista Concierge — a warm, knowledgeable AI travel assistant for Voyage Vista Travels (www.voyagevista.ca), a Canadian travel company based in Nepean, ON. You specialize in group travel, milestone celebrations, luxury escapes, and culturally enriching experiences. Help visitors with destinations, bookings, travel tips, and services. Keep responses concise and elegant. Phone: (343) 777-4159. For specific pricing or availability, direct them to the contact form or suggest they call.'
  }];

  // Greeting
  vvAddBot("Welcome to Voyage Vista! ✈️ I'm your personal travel concierge. Whether you're dreaming of a luxury cruise, a girls' getaway, or a family reunion trip — I'm here to help plan it perfectly. Where shall we begin?");

  var inp = document.getElementById('vv-input');
  if (inp) {
    inp.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
    inp.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); vvSend(); }
    });
  }

  window.vvToggle = function() {
    vvOpen = !vvOpen;
    document.getElementById('vv-chat').classList.toggle('open', vvOpen);
    document.getElementById('vv-toggle').classList.toggle('open', vvOpen);
    if (vvOpen) setTimeout(function() { document.getElementById('vv-input').focus(); }, 350);
  };

  window.vvSendQuick = function(text) {
    document.getElementById('vv-input').value = text;
    vvSend();
    document.getElementById('vv-qr').style.display = 'none';
  };

  window.vvSend = function() {
    var inp = document.getElementById('vv-input');
    var text = inp.value.trim();
    if (!text || vvLoading) return;
    inp.value = ''; inp.style.height = 'auto';
    document.getElementById('vv-send').disabled = true;
    vvLoading = true;
    vvAddUser(text);
    vvHistory.push({ role: 'user', content: text });
    vvShowTyping();
    fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + VV_API_KEY,
        'HTTP-Referer': 'https://www.voyagevista.ca',
        'X-Title': 'VoyageVista Concierge'
      },
      body: JSON.stringify({ model: VV_MODEL, max_tokens: 400, messages: vvHistory })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.error) throw new Error(data.error.message);
      var reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "I'm sorry, could you rephrase that?";
      vvHistory.push({ role: 'assistant', content: reply });
      vvHideTyping(); vvAddBot(reply);
    })
    .catch(function() {
      vvHideTyping();
      vvAddBot('Sorry, I\'m having a moment! Please call us at <a href="tel:3437774159" style="color:#c4a057;">(343) 777-4159</a> or use the contact form.');
    })
    .finally(function() {
      vvLoading = false;
      document.getElementById('vv-send').disabled = false;
    });
  };

  function vvTime() { return new Date().toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }); }

  function vvAddBot(text) {
    var c = document.getElementById('vv-messages'), d = document.createElement('div');
    d.className = 'vvmsg bot';
    d.innerHTML = '<div class="vvmsg-bubble">' + text + '</div><span class="vvmsg-time">' + vvTime() + '</span>';
    c.appendChild(d); c.scrollTop = c.scrollHeight;
  }

  function vvAddUser(text) {
    var c = document.getElementById('vv-messages'), d = document.createElement('div');
    d.className = 'vvmsg user';
    d.innerHTML = '<div class="vvmsg-bubble">' + text + '</div><span class="vvmsg-time">' + vvTime() + '</span>';
    c.appendChild(d); c.scrollTop = c.scrollHeight;
  }

  function vvShowTyping() {
    var c = document.getElementById('vv-messages'), d = document.createElement('div');
    d.id = 'vv-typing';
    d.innerHTML = '<div class="vv-typing"><div class="vv-dot"></div><div class="vv-dot"></div><div class="vv-dot"></div></div>';
    c.appendChild(d); c.scrollTop = c.scrollHeight;
  }

  function vvHideTyping() { var el = document.getElementById('vv-typing'); if (el) el.remove(); }

  // Contact form
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      document.getElementById('form-success').style.display = 'block';
      form.style.display = 'none';
    });
  }
});

// ── THEME TOGGLE ──────────────────────────────────────
(function() {
  var btn = document.createElement('button');
  btn.id = 'theme-toggle';
  btn.title = 'Toggle dark/light mode';
  var saved = localStorage.getItem('vv-theme') || 'light';
  if (saved === 'dark') { document.body.classList.add('dark-mode'); btn.textContent = '☀️'; }
  else { btn.textContent = '🌙'; }
  btn.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    var isDark = document.body.classList.contains('dark-mode');
    btn.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('vv-theme', isDark ? 'dark' : 'light');
  });
  document.body.appendChild(btn);
})();
