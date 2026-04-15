const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json({ limit: '50mb' }));
const ROOT = __dirname;
const TRIPS_FILE = path.join(ROOT, 'trips-data.json');

function loadTrips() {
  try { if (fs.existsSync(TRIPS_FILE)) return JSON.parse(fs.readFileSync(TRIPS_FILE, 'utf8')); }
  catch(e) { console.error('Load error:', e); }
  return { trips: {} };
}
function saveTrips(data) {
  try { fs.writeFileSync(TRIPS_FILE, JSON.stringify(data, null, 2)); return true; }
  catch(e) { console.error('Save error:', e); return false; }
}
function generateSlug(name, occ) {
  return (name + '-' + occ).toLowerCase()
    .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').substring(0,60);
}

app.use(express.static(ROOT));

app.get('/api/trips', (req, res) => {
  const data = loadTrips();
  res.json({ trips: Object.values(data.trips).map(t => ({
    id: t.id, guestName: t.guestName, occasion: t.occasion,
    destination: t.destination, departDate: t.departDate, theme: t.theme, createdAt: t.createdAt
  }))});
});
app.get('/api/trips/:slug', (req, res) => {
  const data = loadTrips();
  const trip = data.trips[req.params.slug];
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  res.json(trip);
});
app.post('/api/trips', (req, res) => {
  const data = loadTrips();
  const trip = req.body;
  if (!trip.guestName || !trip.occasion) return res.status(400).json({ error: 'Guest name and occasion required' });
  const slug = trip.id || generateSlug(trip.guestName, trip.occasion);
  trip.id = slug;
  trip.createdAt = trip.createdAt || new Date().toISOString().split('T')[0];
  trip.updatedAt = new Date().toISOString().split('T')[0];
  data.trips[slug] = trip;
  if (saveTrips(data)) res.json({ success: true, slug });
  else res.status(500).json({ error: 'Failed to save' });
});
app.delete('/api/trips/:slug', (req, res) => {
  const data = loadTrips();
  if (!data.trips[req.params.slug]) return res.status(404).json({ error: 'Not found' });
  delete data.trips[req.params.slug];
  saveTrips(data);
  res.json({ success: true });
});
app.post('/api/chat', async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not configured' });
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': 'https://www.voyagevista.ca', 'X-Title': 'Voyage Vista Travels' },
      body: JSON.stringify({ model: req.body.model || 'anthropic/claude-3.5-haiku', max_tokens: 400, messages: req.body.messages })
    });
    res.json(await response.json());
  } catch(e) { res.status(500).json({ error: 'Server error' }); }
});
app.post('/api/booking', (req, res) => { console.log('Booking:', req.body); res.json({ success: true }); });

app.get('/trips', (req, res) => {
  const f = path.join(ROOT, 'trips', 'admin.html');
  fs.existsSync(f) ? res.sendFile(f) : res.status(404).send('Admin not found');
});
app.get('/trips/admin', (req, res) => {
  const f = path.join(ROOT, 'trips', 'admin.html');
  fs.existsSync(f) ? res.sendFile(f) : res.status(404).send('Admin not found');
});
app.get('/trips/:slug/resort', (req, res) => {
  const data = loadTrips();
  const trip = data.trips[req.params.slug];
  if (!trip) return res.status(404).send(notFoundPage());
  res.send(renderResortPage(trip));
});
app.get('/trips/:slug', (req, res) => {
  if (req.params.slug === 'admin') return res.redirect('/trips/admin');
  const data = loadTrips();
  const trip = data.trips[req.params.slug];
  if (!trip) return res.status(404).send(notFoundPage());
  res.send(renderTripPage(trip));
});

function notFoundPage() {
  return `<!DOCTYPE html><html><head><title>Not Found</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0d1b2a;color:#e8dcc8;text-align:center;}h1{color:#c4a057;}a{color:#c4a057;}</style></head><body><div><h1>✈ Trip Not Found</h1><p style="color:rgba(255,255,255,0.5)">This trip page doesn't exist.</p><a href="/">Return to Voyage Vista Travels</a></div></body></html>`;
}

// ── RESORT PHOTOS PAGE ────────────────────────────────
function renderResortPage(t) {
  const photos = (t.resortPhotos && t.resortPhotos.length) ? t.resortPhotos : [];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${t.hotel||'Resort'} Photos — Voyage Vista Travels</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;background:#0d1b2a;color:#e8dcc8;}
.hero{background:linear-gradient(135deg,#0d1b2a,#1a3550);padding:60px 24px 40px;text-align:center;}
.badge{display:inline-block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#c4a057;border:1px solid rgba(196,160,87,.4);border-radius:20px;padding:5px 18px;margin-bottom:14px;}
h1{font-family:'Cormorant Garamond',serif;font-size:clamp(1.8rem,5vw,3rem);color:#fff;font-weight:600;margin-bottom:8px;}
.sub{font-size:1rem;color:rgba(255,255,255,.5);}
.back-btn{display:inline-block;margin-top:20px;padding:10px 24px;border:1px solid rgba(196,160,87,.4);border-radius:8px;color:#c4a057;text-decoration:none;font-size:13px;}
.back-btn:hover{background:rgba(196,160,87,.1);}
.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:6px;padding:24px;}
.gitem{position:relative;overflow:hidden;border-radius:4px;aspect-ratio:4/3;cursor:pointer;}
.gitem img{width:100%;height:100%;object-fit:cover;transition:transform .3s;}
.gitem:hover img{transform:scale(1.04);}
.lightbox{position:fixed;inset:0;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;z-index:999;opacity:0;pointer-events:none;transition:opacity .25s;}
.lightbox.open{opacity:1;pointer-events:all;}
.lb-img{max-width:90vw;max-height:88vh;border-radius:8px;object-fit:contain;}
.lb-close{position:absolute;top:16px;right:20px;font-size:28px;color:rgba(255,255,255,.7);cursor:pointer;background:none;border:none;}
.lb-close:hover{color:#fff;}
.lb-prev,.lb-next{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.1);border:none;color:#fff;font-size:24px;padding:12px 16px;cursor:pointer;border-radius:6px;}
.lb-prev{left:12px;}.lb-next{right:12px;}
.lb-prev:hover,.lb-next:hover{background:rgba(255,255,255,.2);}
.lb-counter{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.5);font-size:13px;}
.footer{text-align:center;padding:32px 20px;color:rgba(255,255,255,.25);font-size:12px;}
.footer strong{color:#c4a057;}
${photos.length===0?'.empty{display:flex;align-items:center;justify-content:center;min-height:300px;color:rgba(255,255,255,.3);font-size:14px;}':''}
</style>
</head>
<body>
<div class="hero">
  <div class="badge">Voyage Vista Travels · Resort Gallery</div>
  <h1>${t.hotel||'Resort'} Photos</h1>
  <div class="sub">${t.destination||''}</div>
  <a href="/trips/${t.id}" class="back-btn">← Back to Trip Page</a>
</div>
${photos.length === 0
  ? '<div class="empty">No resort photos have been uploaded yet.</div>'
  : `<div class="gallery">${photos.map((p,i)=>`<div class="gitem" onclick="openLB(${i})"><img src="${p}" alt="Resort photo ${i+1}" loading="lazy"></div>`).join('')}</div>`
}
<div class="lightbox" id="lb">
  <button class="lb-close" onclick="closeLB()">✕</button>
  <button class="lb-prev" onclick="navLB(-1)">‹</button>
  <img class="lb-img" id="lbImg">
  <button class="lb-next" onclick="navLB(1)">›</button>
  <div class="lb-counter" id="lbCounter"></div>
</div>
<footer class="footer"><strong>Voyage Vista Travels</strong> · Nepean, ON · (343) 961-3506 · hello@voyagevista.ca</footer>
<script>
var photos=${JSON.stringify(photos)},lbIdx=0;
function openLB(i){lbIdx=i;document.getElementById('lbImg').src=photos[i];document.getElementById('lbCounter').textContent=(i+1)+' / '+photos.length;document.getElementById('lb').classList.add('open');}
function closeLB(){document.getElementById('lb').classList.remove('open');}
function navLB(d){lbIdx=(lbIdx+d+photos.length)%photos.length;openLB(lbIdx);}
document.getElementById('lb').addEventListener('click',function(e){if(e.target===this)closeLB();});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeLB();if(e.key==='ArrowRight')navLB(1);if(e.key==='ArrowLeft')navLB(-1);});
</script>
</body></html>`;
}

// ── GUEST TRIP PAGE ───────────────────────────────────
function renderTripPage(t) {
  const nights = (t.departDate && t.returnDate) ? Math.max(0, Math.ceil((new Date(t.returnDate) - new Date(t.departDate)) / 86400000)) : null;
  const countdown = t.departDate ? Math.ceil((new Date(t.departDate) - new Date()) / 86400000) : null;
  const fmt = d => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  const heroBg = t.bannerPhoto
    ? `background:linear-gradient(160deg,rgba(13,27,42,0.78) 0%,rgba(26,46,69,0.6) 100%),url('${t.bannerPhoto}') center/cover no-repeat;`
    : `background:linear-gradient(135deg,#0d1b2a 0%,#1a3550 60%,#0a2a1f 100%);`;

  // Countdown festive section
  let cdHtml = '';
  if (countdown !== null) {
    if (countdown > 0) {
      cdHtml = `<div class="cd-wrap">
        <div class="cd-sparkles">✨ 🎉 ✨</div>
        <div class="cd-num" id="cdNum">${countdown}</div>
        <div class="cd-label">days until your adventure begins!</div>
        <div class="cd-sparkles">🌟 🎊 🌟</div>
      </div>`;
    } else if (countdown === 0) {
      cdHtml = `<div class="cd-wrap cd-today"><div class="cd-sparkles">🎉 🥂 🎉</div><div class="cd-num">Today!</div><div class="cd-label">Your adventure starts now!</div><div class="cd-sparkles">✨ 🌟 ✨</div></div>`;
    } else {
      cdHtml = `<div class="cd-wrap cd-active"><div class="cd-sparkles">🌴 ✈️ 🌴</div><div class="cd-num">You're There!</div><div class="cd-label">Trip in progress — enjoy every moment!</div></div>`;
    }
  }

  // Gallery swiper
  const galleryHtml = (t.photos && t.photos.length) ? `
  <section class="sec">
    <div class="sec-label">Photo Gallery</div>
    <div class="swiper" id="mainSwiper">
      <div class="swiper-track" id="mainTrack">
        ${t.photos.map((p,i)=>`<div class="swipe-slide"><img src="${p}" alt="Trip photo ${i+1}" loading="lazy" onclick="openLB('main',${i})"></div>`).join('')}
      </div>
      <div class="swipe-dots" id="mainDots">
        ${t.photos.map((_,i)=>`<div class="dot${i===0?' active':''}" onclick="goSlide('main',${i})"></div>`).join('')}
      </div>
    </div>
  </section><hr class="div">` : '';

  // Resort photos button
  const resortBtn = (t.resortPhotos && t.resortPhotos.length) ? `
  <section class="sec" style="text-align:center;">
    <a href="/trips/${t.id}/resort" class="resort-btn">
      🏨 View ${t.hotel||'Resort'} Photos
      <span class="resort-count">${t.resortPhotos.length} photos</span>
    </a>
  </section><hr class="div">` : '';

  // Resort hero on logistics
  const resortHeroHtml = t.resortHeroPhoto ? `<div class="resort-hero-img"><img src="${t.resortHeroPhoto}" alt="${t.hotel||'Resort'}"></div>` : '';

  // Logistics
  const logistics = (t.flight || t.hotel) ? `
  <section class="sec">
    <div class="sec-label">Booking Details</div>
    ${t.hotel ? `
    <div class="info-card hotel-card">
      <div class="iicon hotel-i">🏨</div>
      <div class="ibody">
        <div class="ititle">${t.hotel}</div>
        <div class="isub">${t.hotelAddr ? t.hotelAddr+'<br>' : ''}${t.checkin||''}</div>
      </div>
    </div>
    ${resortHeroHtml}` : ''}
    ${t.flight ? `<div class="info-card"><div class="iicon flight-i">✈</div><div class="ibody"><div class="ititle">${t.flight}</div><div class="isub">${t.flightTime||''}${t.bookingRef?' · '+t.bookingRef:''}</div></div></div>` : ''}
  </section><hr class="div">` : '';

  // Itinerary with events
  const itinerary = (t.days && t.days.some(d=>d.title||(d.events&&d.events.length))) ? `
  <section class="sec">
    <div class="sec-label">Your Itinerary</div>
    ${t.days.filter(d=>d.title||(d.events&&d.events.length)).map(d=>`
    <div class="day-block">
      <div class="day-lbl">${d.label}${d.date?' — '+d.date:''}</div>
      ${d.title?`<div class="day-ttl">${d.title}</div>`:''}
      ${(d.events||[]).filter(e=>e.title).map(e=>`
      <div class="ev-row">
        <span class="ev-dot ev-dot-${e.type}"></span>
        <div>
          <div class="ev-title">${e.title}${e.time?` <span class="ev-time">${e.time}</span>`:''}</div>
          ${e.flightNum?`<div class="ev-note">Flight ${e.flightNum}${e.route?' · '+e.route:''}</div>`:''}
          ${e.address?`<div class="ev-note">📍 ${e.address}</div>`:''}
          ${e.notes?`<div class="ev-note">${e.notes}</div>`:''}
        </div>
      </div>`).join('')}
    </div>`).join('')}
  </section><hr class="div">` : '';

  // Itinerary download link
  const itineraryDownload = t.itineraryLink ? `
  <section class="sec">
    <div class="sec-label">Itinerary Document</div>
    <a href="${t.itineraryLink}" target="_blank" rel="noopener" class="dl-btn">📄 ${t.itineraryLinkLabel||'Download Full Itinerary'}</a>
  </section><hr class="div">` : '';

  // Packing
  const packCats = t.packingList && t.packingList.length ? t.packingList.reduce((a,i)=>{(a[i.category||'General']=a[i.category||'General']||[]).push(i.item);return a;},{}) : null;
  const packSec = packCats ? `
  <section class="sec">
    <div class="sec-label">Packing List</div>
    <div class="pack-grid">${Object.entries(packCats).map(([c,items])=>`<div class="pack-cat"><div class="pack-cat-ttl">${c}</div>${items.map(i=>`<div class="pack-item">✓ ${i}</div>`).join('')}</div>`).join('')}</div>
  </section><hr class="div">` : '';

  // Currency
  const currSec = t.currency && (t.currency.localCurrency||t.currency.tips) ? `
  <section class="sec">
    <div class="sec-label">Currency & Money Tips</div>
    <div class="curr-card">
      ${t.currency.localCurrency?`<div class="curr-row"><span class="curr-lbl">Local Currency</span><span class="curr-val">${t.currency.localCurrency}</span></div>`:''}
      ${t.currency.exchangeRate?`<div class="curr-row"><span class="curr-lbl">Exchange Rate</span><span class="curr-val">${t.currency.exchangeRate}</span></div>`:''}
      ${t.currency.dailyBudget?`<div class="curr-row"><span class="curr-lbl">Daily Budget</span><span class="curr-val">${t.currency.dailyBudget}</span></div>`:''}
      ${t.currency.tips?`<div class="curr-tips">${t.currency.tips}</div>`:''}
    </div>
  </section><hr class="div">` : '';

  // Weather snapshot
  const weatherSec = t.weatherSnapshot ? `
  <section class="sec">
    <div class="sec-label">Weather in ${t.weatherSnapshot.dest||t.destination||''}</div>
    <div class="weather-card">
      <div class="weather-icon-big">${t.weatherSnapshot.icon||'🌤️'}</div>
      <div class="weather-data">
        <div class="weather-temp-big">${t.weatherSnapshot.tempC}°C / ${t.weatherSnapshot.tempF}°F</div>
        <div class="weather-desc-big">${t.weatherSnapshot.desc}</div>
        <div class="weather-extras">Feels like ${t.weatherSnapshot.feels}°C · Humidity ${t.weatherSnapshot.humidity}%</div>
      </div>
    </div>
  </section><hr class="div">` : '';

  // Message (after logistics)
  const msgSec = t.message ? `
  <section class="sec">
    <div class="sec-label">A message for you</div>
    <div class="msg-card">
      <div class="msg-txt">"${t.message}"</div>
      <div class="msg-from">— ${t.signedFrom||'Voyage Vista Travels'}</div>
    </div>
  </section><hr class="div">` : '';

  // RSVP form — sends to Hello@voyagevista.ca
  const bookSec = t.showBookingForm ? `
  <section class="sec">
    <div class="sec-label">RSVP / Enquiry</div>
    <div class="book-form">
      <form id="rsvpForm">
        <div class="frow">
          <input type="text" placeholder="Full Name *" required id="bn">
          <input type="email" placeholder="Email *" required id="be">
        </div>
        <div class="frow">
          <input type="tel" placeholder="Phone Number" id="bp">
          <input type="text" placeholder="Number of Guests" id="bg">
        </div>
        ${(t.bookingFormFields||[]).map(f=>`<input type="text" placeholder="${f}" style="width:100%;margin-bottom:12px;">`).join('')}
        <textarea placeholder="Special requests, dietary requirements, or any questions..." rows="3" id="bn2"></textarea>
        <button type="submit" class="sub-btn">Send RSVP to Voyage Vista Travels ✈</button>
      </form>
      <div id="bsuccess" style="display:none;text-align:center;padding:24px;color:#7ec98f;font-size:15px;line-height:1.7;">
        ✅ Thank you! Your RSVP has been received.<br>
        <span style="font-size:13px;color:#aaa;">We'll be in touch at <strong style="color:#c4a057;">Hello@voyagevista.ca</strong> within 1–2 business days.</span>
      </div>
    </div>
  </section><hr class="div">` : '';

  // Contact
  const contactSec = t.advisorPhone ? `
  <section class="sec" style="text-align:center;">
    <div class="adv-card">
      <div class="adv-lbl">Your travel advisor is available 24/7</div>
      <a href="tel:${(t.advisorPhone||'').replace(/\D/g,'')}" class="adv-phone">${t.advisorPhone}</a>
      <a href="mailto:Hello@voyagevista.ca" class="adv-email">Hello@voyagevista.ca</a>
    </div>
  </section>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${t.guestName}'s ${t.occasion} – Voyage Vista Travels</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;background:#f5f0e8;color:#2c2c2c;line-height:1.6;}

/* HERO — more festive & colorful */
.hero{min-height:100vh;${heroBg}display:flex;align-items:center;justify-content:center;text-align:center;padding:80px 24px 60px;position:relative;overflow:hidden;}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(196,160,87,0.18) 0%,transparent 65%),radial-gradient(ellipse at 80% 80%,rgba(200,100,120,0.1) 0%,transparent 50%),radial-gradient(ellipse at 20% 70%,rgba(50,150,200,0.1) 0%,transparent 50%);pointer-events:none;}
.hero-inner{position:relative;z-index:1;max-width:700px;margin:0 auto;}
.h-badge{display:inline-flex;align-items:center;gap:8px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#c4a057;border:1px solid rgba(196,160,87,.45);border-radius:20px;padding:6px 20px;margin-bottom:20px;background:rgba(196,160,87,.08);}
.confetti-strip{font-size:1.4rem;letter-spacing:4px;margin-bottom:14px;opacity:.85;}
.h1{font-family:'Cormorant Garamond',serif;font-size:clamp(2.4rem,8vw,5.5rem);color:#fff;font-weight:600;line-height:1.1;margin-bottom:12px;text-shadow:0 2px 24px rgba(0,0,0,.3);}
.h1 em{color:#e8c87a;font-style:italic;}
.h-dest{font-size:1.1rem;color:rgba(255,255,255,.65);margin-bottom:12px;letter-spacing:.04em;}
.h-desc{font-size:.95rem;color:rgba(255,255,255,.45);max-width:480px;margin:0 auto 28px;line-height:1.7;}
.h-stats{display:flex;justify-content:center;gap:28px;flex-wrap:wrap;margin-bottom:32px;}
.stat-box{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 22px;backdrop-filter:blur(8px);}
.s-num{font-family:'Cormorant Garamond',serif;font-size:1.9rem;color:#e8c87a;font-weight:600;}
.s-lbl{font-size:10px;color:rgba(255,255,255,.4);letter-spacing:.08em;text-transform:uppercase;margin-top:2px;}

/* BIG FESTIVE COUNTDOWN */
.cd-wrap{display:inline-block;background:linear-gradient(135deg,rgba(196,160,87,.2),rgba(232,200,122,.12));border:2px solid rgba(196,160,87,.5);border-radius:20px;padding:24px 48px;margin-top:8px;position:relative;overflow:hidden;}
.cd-wrap::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(196,160,87,.15),transparent 70%);pointer-events:none;}
.cd-sparkles{font-size:1.4rem;letter-spacing:6px;margin-bottom:8px;animation:sparkPulse 2s ease-in-out infinite;}
@keyframes sparkPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(1.05)}}
.cd-num{font-family:'Cormorant Garamond',serif;font-size:clamp(4rem,12vw,8rem);color:#e8c87a;font-weight:600;line-height:1;text-shadow:0 0 40px rgba(196,160,87,.5);animation:cdPulse 3s ease-in-out infinite;}
@keyframes cdPulse{0%,100%{text-shadow:0 0 40px rgba(196,160,87,.5)}50%{text-shadow:0 0 80px rgba(232,200,122,.8),0 0 120px rgba(196,160,87,.4)}}
.cd-label{font-size:1rem;color:rgba(255,255,255,.7);margin-top:4px;letter-spacing:.06em;text-transform:uppercase;font-size:.85rem;}
.cd-today .cd-num{color:#7ec98f;}
.cd-active .cd-num{color:#c4a057;}

/* SECTIONS */
.sec{padding:36px 20px;max-width:720px;margin:0 auto;}
.sec-label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#c4a057;font-weight:500;margin-bottom:16px;}
.div{border:none;border-top:1px solid rgba(196,160,87,.1);margin:0 20px;}

/* SWIPEABLE GALLERY */
.swiper{position:relative;overflow:hidden;border-radius:16px;margin-bottom:12px;}
.swiper-track{display:flex;transition:transform .4s cubic-bezier(.25,.46,.45,.94);cursor:grab;}
.swiper-track:active{cursor:grabbing;}
.swipe-slide{flex-shrink:0;width:100%;aspect-ratio:16/9;overflow:hidden;}
.swipe-slide img{width:100%;height:100%;object-fit:cover;cursor:pointer;}
.swipe-dots{display:flex;justify-content:center;gap:6px;padding:10px 0;}
.dot{width:8px;height:8px;border-radius:50%;background:rgba(196,160,87,.3);cursor:pointer;transition:all .2s;}
.dot.active{background:#c4a057;width:20px;border-radius:4px;}

/* RESORT BUTTON */
.resort-btn{display:inline-flex;align-items:center;gap:12px;padding:16px 32px;background:linear-gradient(135deg,#0d1b2a,#1a3550);border:2px solid rgba(196,160,87,.4);border-radius:14px;color:#e8c87a;font-size:15px;font-weight:500;text-decoration:none;font-family:'DM Sans',sans-serif;transition:all .25s;}
.resort-btn:hover{border-color:#c4a057;background:linear-gradient(135deg,#1a2e45,#1e3a52);transform:translateY(-2px);}
.resort-count{background:rgba(196,160,87,.2);color:#c4a057;font-size:11px;padding:3px 10px;border-radius:10px;}

/* RESORT HERO */
.resort-hero-img{width:100%;border-radius:12px;overflow:hidden;margin:12px 0;aspect-ratio:16/7;}
.resort-hero-img img{width:100%;height:100%;object-fit:cover;}

/* LOGISTICS */
.info-card{background:#fff;border-radius:14px;padding:16px 20px;display:flex;align-items:flex-start;gap:14px;margin-bottom:10px;border:1px solid rgba(196,160,87,.1);box-shadow:0 2px 12px rgba(0,0,0,.05);}
.iicon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
.flight-i{background:#EAF3DE;}.hotel-i{background:#E6F1FB;}
.ibody{flex:1;}.ititle{font-size:14px;font-weight:500;}.isub{font-size:12px;color:#888;margin-top:3px;line-height:1.5;}

/* ITINERARY */
.day-block{border-left:3px solid rgba(196,160,87,.35);padding-left:18px;margin-bottom:22px;}
.day-lbl{font-size:11px;font-weight:500;color:#c4a057;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px;}
.day-ttl{font-size:16px;font-weight:500;margin-bottom:8px;}
.ev-row{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;}
.ev-dot{width:10px;height:10px;border-radius:50%;margin-top:5px;flex-shrink:0;}
.ev-dot-flight{background:#3B6D11;}.ev-dot-hotel{background:#185FA5;}
.ev-dot-activity{background:#854F0B;}.ev-dot-restaurant{background:#993556;}
.ev-dot-transport{background:#5F5E5A;}.ev-dot-note{background:#534AB7;}
.ev-title{font-size:14px;font-weight:500;}.ev-time{font-size:12px;color:#c4a057;font-weight:400;margin-left:6px;}
.ev-note{font-size:12px;color:#777;margin-top:3px;line-height:1.5;}

/* DOWNLOAD LINK */
.dl-btn{display:inline-flex;align-items:center;gap:10px;padding:14px 28px;border:2px solid #c4a057;border-radius:10px;color:#c4a057;font-weight:500;font-size:14px;text-decoration:none;transition:all .2s;}
.dl-btn:hover{background:#c4a057;color:#0d1b2a;}

/* PACKING */
.pack-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px;}
.pack-cat{background:#fff;border-radius:12px;padding:16px;border:1px solid rgba(196,160,87,.1);}
.pack-cat-ttl{font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.08em;color:#c4a057;margin-bottom:10px;}
.pack-item{font-size:13px;color:#555;padding:4px 0;border-bottom:1px solid #f0ebe0;}

/* CURRENCY */
.curr-card{background:#0d1b2a;border-radius:14px;padding:24px;border:1px solid rgba(196,160,87,.2);}
.curr-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);}
.curr-lbl{font-size:13px;color:rgba(255,255,255,.5);}.curr-val{font-size:13px;font-weight:500;color:#e8c87a;}
.curr-tips{font-size:13px;color:rgba(255,255,255,.55);margin-top:14px;line-height:1.7;}

/* WEATHER */
.weather-card{background:linear-gradient(135deg,#e8f4fd,#ddeeff);border-radius:14px;padding:20px 24px;display:flex;align-items:center;gap:18px;border:1px solid #b8d4f0;}
.weather-icon-big{font-size:3rem;}
.weather-temp-big{font-size:1.5rem;font-weight:500;color:#1a3550;}
.weather-desc-big{font-size:13px;color:#555;margin-top:3px;}
.weather-extras{font-size:12px;color:#888;margin-top:4px;}

/* MESSAGE */
.msg-card{background:#0d1b2a;border-radius:14px;padding:28px;border:1px solid rgba(196,160,87,.2);}
.msg-txt{font-size:15px;color:rgba(255,255,255,.7);line-height:1.8;font-style:italic;font-family:'Cormorant Garamond',serif;}
.msg-from{font-size:13px;color:#c4a057;margin-top:16px;font-weight:500;}

/* RSVP */
.book-form{background:#fff;border-radius:14px;padding:28px;border:1px solid rgba(196,160,87,.1);}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;}
@media(max-width:480px){.frow{grid-template-columns:1fr;}}
.book-form input,.book-form textarea{width:100%;padding:12px 14px;border:1px solid #e0d8cc;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;background:#faf7f2;outline:none;margin-bottom:12px;}
.book-form input:focus,.book-form textarea:focus{border-color:#c4a057;}
.sub-btn{width:100%;padding:14px;border:none;border-radius:10px;background:linear-gradient(135deg,#c4a057,#e8c87a);color:#0d1b2a;font-weight:600;font-size:15px;font-family:'DM Sans',sans-serif;cursor:pointer;}
.sub-btn:hover{opacity:.9;}

/* CONTACT */
.adv-card{background:#0d1b2a;border-radius:14px;padding:24px 32px;border:1px solid rgba(196,160,87,.2);display:inline-block;min-width:260px;}
.adv-lbl{font-size:12px;color:rgba(255,255,255,.4);margin-bottom:8px;}
.adv-phone{font-size:22px;font-weight:500;color:#c4a057;display:block;text-decoration:none;margin-bottom:4px;}
.adv-email{font-size:13px;color:rgba(255,255,255,.4);text-decoration:none;display:block;}
.adv-email:hover{color:#c4a057;}

/* LIGHTBOX */
.lb{position:fixed;inset:0;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;z-index:999;opacity:0;pointer-events:none;transition:opacity .25s;}
.lb.open{opacity:1;pointer-events:all;}
.lb-img{max-width:90vw;max-height:88vh;border-radius:8px;object-fit:contain;}
.lb-close{position:absolute;top:16px;right:20px;font-size:28px;color:rgba(255,255,255,.7);cursor:pointer;background:none;border:none;}
.lb-prev,.lb-next{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.1);border:none;color:#fff;font-size:24px;padding:12px 16px;cursor:pointer;border-radius:6px;}
.lb-prev{left:12px;}.lb-next{right:12px;}
.lb-prev:hover,.lb-next:hover{background:rgba(255,255,255,.2);}

.footer{background:#0d1b2a;text-align:center;padding:32px 20px;color:rgba(255,255,255,.3);font-size:12px;margin-top:40px;}
.footer strong{color:#c4a057;}
</style>
</head>
<body>

<!-- HERO -->
<div class="hero">
  <div class="hero-inner">
    <div class="h-badge">✈ Voyage Vista Travels · ${t.theme||'Special Occasion'}</div>
    <div class="confetti-strip">🎉 🌟 🎊 🌴 🎈</div>
    <div class="h1">Happy <em>${t.occasion}</em>,<br>${t.guestName}!</div>
    ${t.destination ? `<div class="h-dest">📍 ${t.destination}</div>` : ''}
    ${t.tripDesc ? `<div class="h-desc">${t.tripDesc}</div>` : ''}
    <div class="h-stats">
      ${nights ? `<div class="stat-box"><div class="s-num">${nights}</div><div class="s-lbl">Nights</div></div>` : ''}
      ${t.guestCount ? `<div class="stat-box"><div class="s-num">${t.guestCount}</div><div class="s-lbl">Guests</div></div>` : ''}
      ${t.departDate ? `<div class="stat-box"><div class="s-num">${fmt(t.departDate)}</div><div class="s-lbl">Departure</div></div>` : ''}
    </div>
    ${cdHtml}
  </div>
</div>

${galleryHtml}
${resortBtn}
${logistics}
${msgSec}
${itinerary}
${itineraryDownload}
${weatherSec}
${packSec}
${currSec}
${bookSec}
${contactSec}

<footer class="footer">
  <strong>Voyage Vista Travels</strong> · Nepean, ON · (343) 961-3506 · Hello@voyagevista.ca<br>
  Affiliated with Nexion Travel Group-Canada · TICO Reg: 1549342
</footer>

<!-- LIGHTBOX -->
<div class="lb" id="lb">
  <button class="lb-close" onclick="closeLB()">✕</button>
  <button class="lb-prev" onclick="navLB(-1)">‹</button>
  <img class="lb-img" id="lbImg">
  <button class="lb-next" onclick="navLB(1)">›</button>
</div>

<script>
var allPhotos = ${JSON.stringify(t.photos||[])};
var lbIdx = 0;

// ── SWIPER ──
var swipers = {};
function initSwiper(id, count) {
  if(count < 2) return;
  var track = document.getElementById(id+'Track');
  var dots = document.getElementById(id+'Dots');
  var idx = 0, startX = 0, isDrag = false;
  swipers[id] = { idx:0, count:count };
  track.addEventListener('mousedown', function(e){ startX=e.clientX; isDrag=true; });
  track.addEventListener('mousemove', function(e){ if(isDrag) track.style.transition='none'; });
  track.addEventListener('mouseup', function(e){
    if(!isDrag)return; isDrag=false;
    var dx=e.clientX-startX; track.style.transition='';
    if(dx<-40) goSlide(id,Math.min(idx+1,count-1));
    else if(dx>40) goSlide(id,Math.max(idx-1,0));
    else goSlide(id,idx);
  });
  track.addEventListener('touchstart',function(e){startX=e.touches[0].clientX;},{passive:true});
  track.addEventListener('touchend',function(e){
    var dx=e.changedTouches[0].clientX-startX;
    if(dx<-40) goSlide(id,Math.min(swipers[id].idx+1,count-1));
    else if(dx>40) goSlide(id,Math.max(swipers[id].idx-1,0));
  });
}
function goSlide(id,i){
  var track=document.getElementById(id+'Track');
  var dots=document.getElementById(id+'Dots');
  if(!track)return;
  if(!swipers[id])swipers[id]={idx:0};
  swipers[id].idx=i;
  track.style.transform='translateX(-'+i+'00%)';
  if(dots) dots.querySelectorAll('.dot').forEach(function(d,j){d.classList.toggle('active',j===i);});
}
window.addEventListener('DOMContentLoaded',function(){
  if(document.getElementById('mainTrack')) initSwiper('main',${(t.photos||[]).length});
});

// ── LIGHTBOX ──
function openLB(prefix,i){lbIdx=i;document.getElementById('lbImg').src=allPhotos[i];document.getElementById('lb').classList.add('open');}
function closeLB(){document.getElementById('lb').classList.remove('open');}
function navLB(d){lbIdx=(lbIdx+d+allPhotos.length)%allPhotos.length;document.getElementById('lbImg').src=allPhotos[lbIdx];}
document.getElementById('lb').addEventListener('click',function(e){if(e.target===this)closeLB();});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeLB();if(e.key==='ArrowRight')navLB(1);if(e.key==='ArrowLeft')navLB(-1);});

// ── RSVP ──
var form=document.getElementById('rsvpForm');
if(form){form.addEventListener('submit',function(e){
  e.preventDefault();
  var data={name:document.getElementById('bn').value,email:document.getElementById('be').value,phone:document.getElementById('bp')&&document.getElementById('bp').value,guests:document.getElementById('bg')&&document.getElementById('bg').value,notes:document.getElementById('bn2').value,trip:'${t.id}',to:'Hello@voyagevista.ca'};
  fetch('/api/booking',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  form.style.display='none';document.getElementById('bsuccess').style.display='block';
});}
</script>
</body>
</html>`;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Voyage Vista Travels running on port ' + PORT));
