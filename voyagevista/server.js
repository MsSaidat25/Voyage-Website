const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const app = express();

app.use(express.json({ limit: '50mb' }));
const ROOT = __dirname;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_KEY must be set.');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
console.log('✅ Supabase connected:', process.env.SUPABASE_URL);

const LOGO_B64 = 'data:image/png;base64,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';

function generateSlug(name, occ) {
  return (name + '-' + occ).toLowerCase()
    .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').substring(0,60);
}

app.use(express.static(ROOT));

app.get('/api/health', async (req, res) => {
  try {
    const { count } = await supabase.from('trips').select('*', { count: 'exact', head: true });
    res.json({ status: 'ok', supabase: 'connected', tripCount: count || 0 });
  } catch(e) { res.json({ status: 'ok', supabase: 'error' }); }
});

app.get('/api/trips', async (req, res) => {
  try {
    const { data, error } = await supabase.from('trips')
      .select('id, guest_name, occasion, destination, depart_date, theme, created_at')
       .or('use_builder.is.null,use_builder.eq.false')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ trips: (data||[]).map(t => ({
      id: t.id, guestName: t.guest_name, occasion: t.occasion,
      destination: t.destination, departDate: t.depart_date,
      theme: t.theme, createdAt: t.created_at
    }))});
  } catch(e) { res.status(500).json({ error: 'Failed to load trips' }); }
});

app.get('/api/trips/:slug', async (req, res) => {
  if (req.params.slug === 'builder') {
    try {
      const { data, error } = await supabase.from('trips')
        .select('id, guest_name, occasion, destination, depart_date, theme, created_at')
        .eq('use_builder', true).order('created_at', { ascending: false });
      if (error) throw error;
      return res.json({ trips: (data||[]).map(t => ({ id: t.id, guestName: t.guest_name, occasion: t.occasion, destination: t.destination, departDate: t.depart_date, theme: t.theme, createdAt: t.created_at }))});
    } catch(e) { return res.status(500).json({ error: 'Failed to load builder trips' }); }
  }
  try {
    const { data, error } = await supabase.from('trips').select('trip_data').eq('id', req.params.slug).single();
    if (error || !data) return res.status(404).json({ error: 'Trip not found' });
    res.json(data.trip_data);
  } catch(e) { res.status(500).json({ error: 'Failed to load trip' }); }
});

app.post('/api/trips', async (req, res) => {
  try {
    const trip = req.body;
    if (!trip.guestName || !trip.occasion) return res.status(400).json({ error: 'Guest name and occasion required' });
    const slug = trip.id || generateSlug(trip.guestName, trip.occasion);
    trip.id = slug;
    // RPC function runs with 60s statement timeout — fixes default 8s Supabase timeout
    const { error } = await supabase.rpc('upsert_trip_data', {
      p_id:          slug,
      p_guest_name:  trip.guestName,
      p_occasion:    trip.occasion,
      p_destination: trip.destination  || null,
      p_depart_date: trip.departDate   || null,
      p_return_date: trip.returnDate   || null,
      p_guest_count: trip.guestCount   || null,
      p_theme:       trip.theme        || null,
      p_trip_data:   trip
    });
    if (error) throw error;
    res.json({ success: true, slug });
  } catch(e) { res.status(500).json({ error: 'Failed to save: ' + e.message }); }
});

app.delete('/api/trips/:slug', async (req, res) => {
  try {
    const { error } = await supabase.from('trips').delete().eq('id', req.params.slug);
    if (error) throw error;
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: 'Failed to delete' }); }
});

app.post('/api/chat', async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not configured' });
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://www.voyagevista.ca', 'X-Title': 'Voyage Vista Travels' },
      body: JSON.stringify({ model: req.body.model || 'anthropic/claude-3.5-haiku', max_tokens: 400, messages: req.body.messages })
    });
    res.json(await response.json());
  } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/booking', (req, res) => { console.log('Booking:', req.body); res.json({ success: true }); });

app.get('/trips', (req, res) => { const fs=require('fs'),f=path.join(ROOT,'trips','admin.html'); fs.existsSync(f)?res.sendFile(f):res.status(404).send('Admin not found'); });
app.get('/trips/admin', (req, res) => { const fs=require('fs'),f=path.join(ROOT,'trips','admin.html'); fs.existsSync(f)?res.sendFile(f):res.status(404).send('Admin not found'); });

app.get('/trips/:slug/resort', async (req, res) => {
  try {
    const { data } = await supabase.from('trips').select('trip_data').eq('id', req.params.slug).single();
    if (!data) return res.status(404).send(notFoundPage());
    res.send(renderResortPage(data.trip_data));
  } catch(e) { res.status(404).send(notFoundPage()); }
});

app.get('/trips/builder', (req, res) => { const fs=require('fs'),f=path.join(ROOT,'trips','builder.html'); fs.existsSync(f)?res.sendFile(f):res.status(404).send('Builder not found'); });
app.get('/trips/v2/:slug', async (req, res) => { try { const{data}=await supabase.from('trips').select('trip_data,page_components').eq('id',req.params.slug).eq('use_builder',true).single(); if(!data)return res.status(404).send(notFoundPage()); const page={...(data.trip_data||{}),components:data.page_components||[]}; res.send(renderBuilderPage(page)); } catch(e){res.status(404).send(notFoundPage());} });

app.get('/trips/:slug', async (req, res) => {
  if (req.params.slug === 'admin') return res.redirect('/trips/admin');
  try {
    const { data } = await supabase.from('trips').select('trip_data').eq('id', req.params.slug).single();
    if (!data) return res.status(404).send(notFoundPage());
    res.send(renderTripPage(data.trip_data));
  } catch(e) { res.status(404).send(notFoundPage()); }
});

function notFoundPage() {
  return `<!DOCTYPE html><html><head><title>Not Found</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0d1b2a;color:#e8dcc8;text-align:center;}h1{color:#c4a057;}a{color:#c4a057;}</style></head><body><div><h1>✈ Trip Not Found</h1><p style="color:rgba(255,255,255,0.5)">This page doesn't exist.</p><a href="/">Return to Voyage Vista Travels</a></div></body></html>`;
}

const THEME_BG = {
  'Birthday Celebration': 'linear-gradient(135deg,#C2185B,#E91E8C,#FF6B9D)',
  'Luxury Escape':        'linear-gradient(135deg,#0d1b2a,#1a3550,#0d2a3a)',
  'Girls Getaway':        'linear-gradient(135deg,#AD1457,#E91E8C,#F48FB1)',
  'Family Celebration':   'linear-gradient(135deg,#E65100,#FF6B35,#FFA000)',
  'Romantic Escape':      'linear-gradient(135deg,#6A1B3A,#880E4F,#C2185B)',
  'Adventure Trip':       'linear-gradient(135deg,#1B5E20,#2E7D32,#00695C)',
  'Group Tour':           'linear-gradient(135deg,#0D47A1,#1565C0,#1976D2)',
  'Cruise':               'linear-gradient(135deg,#006064,#00838F,#0097A7)',
};

const NAMED_BG = {
  sunset:    'linear-gradient(135deg,#FF6B35,#F7931E)',
  hotpink:   'linear-gradient(135deg,#E91E8C,#FF6B9D)',
  caribbean: 'linear-gradient(135deg,#00838F,#00BCD4)',
  purple:    'linear-gradient(135deg,#6A1B9A,#CE93D8)',
  coral:     'linear-gradient(135deg,#D32F2F,#FF7043)',
  ocean:     'linear-gradient(135deg,#1565C0,#42A5F5)',
  tropical:  'linear-gradient(135deg,#2E7D32,#66BB6A)',
  gold:      'linear-gradient(135deg,#E65100,#FFA000)',
  navy:      'linear-gradient(135deg,#0d1b2a,#1a3550)',
};

function getBg(t) {
  const c = t.bgColor;
  if (c && c !== 'sunset' && NAMED_BG[c]) return NAMED_BG[c];
  if (c && c.startsWith('#')) return `linear-gradient(135deg,${c},${c}cc)`;
  if (t.theme && THEME_BG[t.theme]) return THEME_BG[t.theme];
  return NAMED_BG.sunset;
}

function countdownHtml(countdown) {
  if (countdown === null || countdown === undefined) return '';
  let topEmoji = '✨ 🎉 ✨', botEmoji = '🌟 🎊 🌟', num = '', label = '';
  if (countdown > 0)        { num = countdown; label = 'days until your adventure begins!'; }
  else if (countdown === 0) { num = 'Today!'; label = 'Your adventure starts now!'; topEmoji = '🎉 🥂 🎉'; botEmoji = '🥳 🎊 🥳'; }
  else                      { num = "You're There!"; label = 'Enjoy every moment!'; topEmoji = '🌴 ✈️ 🌴'; botEmoji = '🌊 🌞 🌊'; }
  return `<div class="cd-float">
    <div class="cd-sp">${topEmoji}</div>
    <div class="cd-num-big">${num}</div>
    <div class="cd-lbl-big">${label}</div>
    <div class="cd-sp">${botEmoji}</div>
  </div>`;
}

function renderResortPage(t) {
  const photos = t.resortPhotos || [];
  const bg = getBg(t);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${t.hotel||'Resort'} Photos — Voyage Vista Travels</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'DM Sans',sans-serif;background:#0d1b2a;color:#e8dcc8;}
.hero{background:${bg};padding:40px 24px 32px;text-align:center;}
.logo-img{height:44px;width:auto;margin-bottom:16px;filter:drop-shadow(0 2px 8px rgba(0,0,0,.3));}
h1{font-family:'Cormorant Garamond',serif;font-size:clamp(1.8rem,5vw,3rem);color:#fff;font-weight:600;margin-bottom:8px;}
.sub{color:rgba(255,255,255,.6);}
.back-btn{display:inline-block;margin-top:16px;padding:10px 24px;border:1px solid rgba(255,255,255,.4);border-radius:8px;color:#fff;text-decoration:none;font-size:13px;}
.back-btn:hover{background:rgba(255,255,255,.1);}
.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:6px;padding:24px;}
.gitem{overflow:hidden;border-radius:6px;aspect-ratio:4/3;cursor:pointer;}
.gitem img{width:100%;height:100%;object-fit:cover;transition:transform .3s;}
.gitem:hover img{transform:scale(1.04);}
.lb{position:fixed;inset:0;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;z-index:999;opacity:0;pointer-events:none;transition:opacity .25s;}
.lb.open{opacity:1;pointer-events:all;}
.lb img{max-width:90vw;max-height:88vh;border-radius:8px;object-fit:contain;}
.lb-close{position:absolute;top:16px;right:20px;font-size:28px;color:rgba(255,255,255,.7);cursor:pointer;background:none;border:none;}
.lb-prev,.lb-next{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.1);border:none;color:#fff;font-size:28px;padding:12px 18px;cursor:pointer;border-radius:6px;}
.lb-prev{left:12px;}.lb-next{right:12px;}
.footer{text-align:center;padding:32px 20px;color:rgba(255,255,255,.25);font-size:12px;}
.footer strong{color:#c4a057;}</style></head><body>
<div class="hero">
  <div><img src="${LOGO_B64}" alt="Voyage Vista Travels" class="logo-img"></div>
  <h1>${t.hotel||'Resort'} Photos</h1>
  <div class="sub">${t.destination||''}</div>
  <a href="/trips/${t.id}" class="back-btn">← Back to Trip Page</a>
</div>
${photos.length
  ? `<div class="gallery">${photos.map((p,i)=>`<div class="gitem" onclick="openLB(${i})"><img src="${p}" loading="lazy"></div>`).join('')}</div>`
  : '<div style="display:flex;align-items:center;justify-content:center;min-height:300px;color:rgba(255,255,255,.3);">No resort photos uploaded yet.</div>'
}
<div class="lb" id="lb">
  <button class="lb-close" onclick="closeLB()">✕</button>
  <button class="lb-prev" onclick="navLB(-1)">‹</button>
  <img id="lbImg">
  <button class="lb-next" onclick="navLB(1)">›</button>
</div>
<footer class="footer"><strong>Voyage Vista Travels</strong> · (343) 961-3506 · Hello@voyagevista.ca</footer>
<script>
var p=${JSON.stringify(photos)},i=0;
function openLB(n){i=n;document.getElementById('lbImg').src=p[n];document.getElementById('lb').classList.add('open');}
function closeLB(){document.getElementById('lb').classList.remove('open');}
function navLB(d){i=(i+d+p.length)%p.length;openLB(i);}
document.getElementById('lb').addEventListener('click',function(e){if(e.target===this)closeLB();});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeLB();if(e.key==='ArrowRight')navLB(1);if(e.key==='ArrowLeft')navLB(-1);});
<\/script>
</body></html>`;
}

function renderTripPage(t) {
  const nights = (t.departDate&&t.returnDate)?Math.max(0,Math.ceil((new Date(t.returnDate)-new Date(t.departDate))/86400000)):null;
  const countdown = t.departDate ? Math.ceil((new Date(t.departDate+' 12:00:00') - new Date()) / 86400000) : null;
  const fmt = d=>d?new Date(d+'T12:00:00').toLocaleDateString('en-CA',{month:'long',day:'numeric',year:'numeric'}):'';
  const photoCount = (t.photos||[]).length;
  const bg = getBg(t);

  const heroBannerImg = t.bannerPhoto
    ? `<img class="hero-banner-img" src="${t.bannerPhoto}" alt="Trip banner" loading="eager">`
    : '';

  const tintOverlay = t.bannerPhoto
    ? `<div style="position:absolute;inset:0;z-index:2;opacity:0.22;mix-blend-mode:multiply;background:${bg};pointer-events:none;"></div>`
    : '';

  const heroClass = t.bannerPhoto ? 'hero-banner' : 'hero-color';
  const heroBgStyle = !t.bannerPhoto ? `background:${bg};` : '';

  const statsHtml = (nights||t.guestCount||t.departDate) ? `
    <div class="hero-stats-left">
      ${nights?`<div class="stat-pill"><span class="sp-num">${nights}</span><span class="sp-lbl">Nights</span></div>`:''}
      ${t.guestCount?`<div class="stat-pill"><span class="sp-num">${t.guestCount}</span><span class="sp-lbl">Guests</span></div>`:''}
      ${t.departDate?`<div class="stat-pill"><span class="sp-num">${fmt(t.departDate)}</span><span class="sp-lbl">Departure</span></div>`:''}
    </div>` : '';

  const autoCarousel = photoCount > 0 ? `
  <section class="sec">
    <div class="sec-label">Photo Gallery</div>
    <div class="car-outer">
      <button class="car-arrow car-prev" onclick="carNav(-1)">&#8249;</button>
      <div class="car-viewport">
        <div class="car-track" id="carTrack">
          ${t.photos.map((p,i)=>`<div class="car-slide"><img src="${p}" loading="lazy" onclick="openLB(${i})" alt="Photo ${i+1}"></div>`).join('')}
        </div>
      </div>
      <button class="car-arrow car-next" onclick="carNav(1)">&#8250;</button>
    </div>
    <div class="car-dots" id="carDots">
      ${t.photos.map((_,i)=>`<div class="car-dot${i===0?' on':''}" onclick="carGo(${i})"></div>`).join('')}
    </div>
  </section><hr class="div">` : '';

  const resortBtn = (t.resortPhotos&&t.resortPhotos.length) ? `
  <section class="sec" style="text-align:center;">
    <a href="/trips/${t.id}/resort" class="resort-btn">🏨 View ${t.hotel||'Resort'} Photos <span class="r-count">${t.resortPhotos.length} photos</span></a>
  </section><hr class="div">` : '';

  const resortHero = t.resortHeroPhoto ? `<div class="resort-img"><img src="${t.resortHeroPhoto}" alt="${t.hotel||'Resort'}" loading="lazy"></div>` : '';

  const logistics = (t.flight||t.hotel) ? `
  <section class="sec"><div class="sec-label">Booking Details</div>
  ${t.hotel?`<div class="card"><div class="ci hotel-i">🏨</div><div class="cb"><div class="ct">${t.hotel}</div><div class="cs">${t.hotelAddr?t.hotelAddr+'<br>':''}${t.checkin||''}</div></div></div>${resortHero}`:''}
  ${t.flight?`<div class="card"><div class="ci flight-i">✈</div><div class="cb"><div class="ct">${t.flight}</div><div class="cs">${t.flightTime||''}${t.bookingRef?' · '+t.bookingRef:''}</div></div></div>`:''}
  </section><hr class="div">` : '';

  const itin = (t.days&&t.days.some(d=>d.title||(d.events&&d.events.length))) ? `
  <section class="sec">
    <div class="doc-heading">🗓 Itinerary</div>
    ${t.days.filter(d=>d.title||(d.events&&d.events.length)).map(d=>`
    <div class="day-block">
      <div class="day-lbl">${d.label}${d.date?' — '+d.date:''}</div>
      ${d.title?`<div class="day-ttl">${d.title}</div>`:''}
      ${(d.events||[]).filter(e=>e.title).map(e=>`
      <div class="ev-row"><span class="ev-dot ev-${e.type}"></span><div>
        <div class="ev-title">${e.title}${e.time?` <span class="ev-time">${e.time}</span>`:''}</div>
        ${e.notes?`<div class="ev-note">${e.notes}</div>`:''}
      </div></div>`).join('')}
    </div>`).join('')}
  </section><hr class="div">` : '';

  const docSection = (t.itineraryLink||t.bookingUrl) ? `
  <section class="sec">
    <div class="doc-cols">
      ${t.itineraryLink?`<div class="doc-col"><div class="doc-heading">📄 Itinerary Document</div><a href="${t.itineraryLink}" target="_blank" rel="noopener" class="doc-btn itinerary-btn">⬇ ${t.itineraryLinkLabel||'Download Itinerary'}</a></div>`:''}
      ${t.bookingUrl?`<div class="doc-col"><div class="doc-heading">🔗 Booking Link</div><a href="${t.bookingUrl}" target="_blank" rel="noopener" class="doc-btn booking-url-btn">→ ${t.bookingUrlLabel||'Book Now'}</a>${t.bookingNote?`<div class="booking-note">💡 ${t.bookingNote}</div>`:''}</div>`:''}
    </div>
  </section><hr class="div">` : '';

  const msgSec = t.message ? `
  <section class="sec"><div class="sec-label">A message for you</div>
  <div class="msg-card"><div class="msg-txt">"${t.message}"</div>
  <div class="msg-from">— ${t.signedFrom||'Voyage Vista Travels'}</div></div>
  </section><hr class="div">` : '';

  const weatherSec = t.weatherSnapshot ? `
  <section class="sec"><div class="sec-label">Weather in ${t.weatherSnapshot.dest||t.destination||''}</div>
  <div class="weather-card">
    <div class="w-icon">${t.weatherSnapshot.icon||'🌤️'}</div>
    <div><div class="w-temp">${t.weatherSnapshot.tempC}°C / ${t.weatherSnapshot.tempF}°F</div>
    <div class="w-desc">${t.weatherSnapshot.desc}</div>
    <div class="w-extra">Feels like ${t.weatherSnapshot.feels}°C · Humidity ${t.weatherSnapshot.humidity}%</div></div>
  </div></section><hr class="div">` : '';

  const packCats = t.packingList&&t.packingList.length ? t.packingList.reduce((a,i)=>{(a[i.category||'General']=a[i.category||'General']||[]).push(i.item);return a;},{}) : null;
  const packSec = packCats ? `
  <section class="sec"><div class="sec-label">Packing List</div>
  <div class="pack-grid">${Object.entries(packCats).map(([c,items])=>`<div class="pack-cat"><div class="pack-ttl">${c}</div>${items.map(i=>`<div class="pack-item">✓ ${i}</div>`).join('')}</div>`).join('')}</div>
  </section><hr class="div">` : '';

  const currSec = t.currency&&(t.currency.localCurrency||t.currency.tips) ? `
  <section class="sec"><div class="sec-label">Currency & Money Tips</div>
  <div class="curr-card">
    ${t.currency.localCurrency?`<div class="curr-row"><span class="curr-lbl">Local Currency</span><span class="curr-val">${t.currency.localCurrency}</span></div>`:''}
    ${t.currency.exchangeRate?`<div class="curr-row"><span class="curr-lbl">Exchange Rate</span><span class="curr-val">${t.currency.exchangeRate}</span></div>`:''}
    ${t.currency.dailyBudget?`<div class="curr-row"><span class="curr-lbl">Daily Budget</span><span class="curr-val">${t.currency.dailyBudget}</span></div>`:''}
    ${t.currency.tips?`<div class="curr-tips">${t.currency.tips}</div>`:''}
  </div></section><hr class="div">` : '';

  const bookSec = t.showBookingForm ? `
  <section class="sec"><div class="sec-label">Booking Form</div>
  <div class="book-form">
    <form id="rsvpForm">
      <div class="frow"><input type="text" placeholder="Full Name *" required id="bn"><input type="email" placeholder="Email *" required id="be"></div>
      <div class="frow"><input type="tel" placeholder="Phone Number" id="bp"><input type="text" placeholder="Number of Guests" id="bg"></div>
      ${(t.bookingFormFields||[]).map(f=>`<input type="text" placeholder="${f}" style="width:100%;margin-bottom:12px;">`).join('')}
      <textarea placeholder="Special requests or questions..." rows="3" id="bn2"></textarea>
      <button type="submit" class="sub-btn">Submit Booking to Voyage Vista Travels ✈</button>
    </form>
    <div id="bsuccess" style="display:none;text-align:center;padding:24px;color:#7ec98f;line-height:1.7;">
      ✅ Thank you! We'll be in touch at <strong style="color:#c4a057;">Hello@voyagevista.ca</strong>
    </div>
  </div></section><hr class="div">` : '';

  const contactSec = t.advisorPhone ? `
  <section class="sec" style="text-align:center;">
  <div class="adv-card">
    <div class="adv-lbl">Your travel advisor is available 24/7</div>
    <a href="tel:${(t.advisorPhone||'').replace(/\D/g,'')}" class="adv-phone">${t.advisorPhone}</a>
    <a href="mailto:Hello@voyagevista.ca" class="adv-email">Hello@voyagevista.ca</a>
  </div></section>` : '';

  const waNum = (t.socialWA||'').replace(/\D/g,'');
  const socialLinks = (t.socialIG||t.socialFB||waNum) ? `
  <div class="social-bar">
    ${t.socialIG?`<a href="${t.socialIG}" target="_blank" rel="noopener" class="social-link" title="Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>`:''}
    ${t.socialFB?`<a href="${t.socialFB}" target="_blank" rel="noopener" class="social-link" title="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>`:''}
    ${waNum?`<a href="https://wa.me/${waNum}" target="_blank" rel="noopener" class="social-link" title="WhatsApp"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></a>`:''}
  </div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${t.guestName}'s ${t.occasion} – Voyage Vista Travels</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;background:#f5f0e8;color:#2c2c2c;line-height:1.6;}
.hero-banner,.hero-color{position:relative;width:100%;min-height:92vh;display:flex;flex-direction:column;overflow:hidden;}
.hero-banner-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center center;z-index:0;}
.hero-banner::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.35) 0%,rgba(0,0,0,0.25) 40%,rgba(0,0,0,0.60) 75%,rgba(0,0,0,0.78) 100%);z-index:3;}
.hero-topbar{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:18px 28px 0;flex-shrink:0;}
.hero-logo{height:40px;width:auto;filter:drop-shadow(0 2px 8px rgba(0,0,0,.4));}
.contact-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 20px;background:rgba(255,255,255,.15);border:1.5px solid rgba(255,255,255,.45);border-radius:50px;color:#fff;font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;text-decoration:none;backdrop-filter:blur(8px);transition:all .2s;white-space:nowrap;}
.contact-btn:hover{background:rgba(255,255,255,.28);border-color:rgba(255,255,255,.7);}
.hero-text{position:relative;z-index:10;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:28px 24px 16px;}
.h1{font-family:'Cormorant Garamond',serif;font-size:clamp(2.2rem,6.5vw,5rem);color:#fff;font-weight:600;line-height:1.1;margin-bottom:10px;text-shadow:0 2px 24px rgba(0,0,0,.35);}
.h1 em{font-style:italic;}
.h-dest{font-size:1rem;color:rgba(255,255,255,.88);margin-bottom:8px;}
.h-desc{font-size:.9rem;color:rgba(255,255,255,.7);max-width:500px;margin:0 auto;line-height:1.75;}
.hero-bottom{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;padding:16px 28px 24px;background:linear-gradient(to top,rgba(0,0,0,0.65),transparent);flex-shrink:0;}
.hero-stats-left{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.stat-pill{display:flex;flex-direction:column;align-items:center;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);border-radius:10px;padding:8px 16px;backdrop-filter:blur(6px);}
.sp-num{font-family:'Cormorant Garamond',serif;font-size:1.3rem;color:#fff;font-weight:600;line-height:1.1;}
.sp-lbl{font-size:9px;color:rgba(255,255,255,.65);letter-spacing:.08em;text-transform:uppercase;margin-top:2px;}
.cd-float{display:inline-flex;flex-direction:column;align-items:center;background:rgba(255,255,255,.18);border:2px solid rgba(255,255,255,.45);border-radius:24px;padding:16px 44px;backdrop-filter:blur(8px);box-shadow:0 8px 32px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.3);}
.cd-sp{font-size:1.4rem;letter-spacing:6px;margin-bottom:4px;animation:sp 2s ease-in-out infinite;}
.cd-sp:last-child{margin-bottom:0;margin-top:6px;}
@keyframes sp{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.7;transform:scale(1.08);}}
.cd-num-big{font-family:'Cormorant Garamond',serif;font-size:clamp(3.5rem,9vw,7rem);color:#fff;font-weight:600;line-height:1;animation:cdglow 3s ease-in-out infinite;}
@keyframes cdglow{0%,100%{text-shadow:0 0 40px rgba(255,255,255,.45);}50%{text-shadow:0 0 90px rgba(255,255,255,.95),0 0 20px rgba(255,255,255,.6);}}
.cd-lbl-big{font-size:.78rem;color:rgba(255,255,255,.82);text-transform:uppercase;letter-spacing:.1em;margin-top:4px;}
@media(max-width:600px){.hero-topbar{padding:14px 16px 0;}.hero-bottom{flex-direction:column;align-items:flex-start;padding:14px 16px 18px;}.cd-float{padding:12px 24px;}.cd-num-big{font-size:clamp(2.8rem,10vw,4.5rem);}.cd-sp{font-size:1.1rem;}}
.sec{padding:36px 20px;max-width:760px;margin:0 auto;}
.sec-label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#c4a057;font-weight:500;margin-bottom:16px;}
.doc-heading{font-size:15px;font-weight:600;color:#2c2c2c;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #f0ebe0;}
.div{border:none;border-top:1px solid rgba(196,160,87,.12);margin:0 20px;}
.car-outer{position:relative;display:flex;align-items:center;}
.car-viewport{flex:1;overflow:hidden;border-radius:16px;background:#111;}
.car-track{display:flex;transition:transform .45s cubic-bezier(.25,.46,.45,.94);}
.car-slide{flex-shrink:0;width:100%;aspect-ratio:4/3;overflow:hidden;background:#111;display:flex;align-items:center;justify-content:center;}
.car-slide img{width:100%;height:100%;object-fit:contain;cursor:pointer;}
.car-arrow{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.95);border:none;font-size:24px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#2c2c2c;box-shadow:0 2px 12px rgba(0,0,0,.15);transition:all .2s;}
.car-arrow:hover{background:#fff;transform:scale(1.08);}
.car-prev{margin-right:10px;}.car-next{margin-left:10px;}
.car-dots{display:flex;justify-content:center;gap:6px;padding:12px 0 4px;}
.car-dot{width:8px;height:8px;border-radius:50%;background:rgba(196,160,87,.3);cursor:pointer;transition:all .2s;}
.car-dot.on{background:#c4a057;width:22px;border-radius:4px;}
.resort-btn{display:inline-flex;align-items:center;gap:12px;padding:16px 32px;background:linear-gradient(135deg,#0d1b2a,#1a3550);border:2px solid rgba(196,160,87,.4);border-radius:14px;color:#e8c87a;font-size:15px;font-weight:500;text-decoration:none;transition:all .25s;}
.resort-btn:hover{border-color:#c4a057;transform:translateY(-2px);}
.r-count{background:rgba(196,160,87,.2);color:#c4a057;font-size:11px;padding:3px 10px;border-radius:10px;}
.resort-img{width:100%;border-radius:14px;overflow:hidden;margin:14px 0;aspect-ratio:16/7;}
.resort-img img{width:100%;height:100%;object-fit:cover;}
.card{background:#fff;border-radius:14px;padding:16px 20px;display:flex;align-items:flex-start;gap:14px;margin-bottom:10px;border:1px solid rgba(196,160,87,.1);box-shadow:0 2px 12px rgba(0,0,0,.05);}
.ci{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
.flight-i{background:#EAF3DE;}.hotel-i{background:#E6F1FB;}
.cb{flex:1;}.ct{font-size:14px;font-weight:500;}.cs{font-size:12px;color:#888;margin-top:3px;line-height:1.5;}
.day-block{border-left:3px solid rgba(196,160,87,.35);padding-left:18px;margin-bottom:22px;}
.day-lbl{font-size:11px;font-weight:500;color:#c4a057;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px;}
.day-ttl{font-size:16px;font-weight:500;margin-bottom:8px;}
.ev-row{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;}
.ev-dot{width:10px;height:10px;border-radius:50%;margin-top:5px;flex-shrink:0;}
.ev-flight{background:#3B6D11;}.ev-hotel{background:#185FA5;}.ev-activity{background:#854F0B;}
.ev-restaurant{background:#993556;}.ev-transport{background:#5F5E5A;}.ev-note{background:#534AB7;}
.ev-title{font-size:14px;font-weight:500;}.ev-time{font-size:12px;color:#c4a057;font-weight:400;margin-left:6px;}
.ev-note{font-size:12px;color:#777;margin-top:3px;line-height:1.5;}
.doc-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
@media(max-width:500px){.doc-cols{grid-template-columns:1fr;}}
.doc-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px 20px;border-radius:12px;font-weight:600;font-size:14px;text-decoration:none;transition:all .2s;font-family:'DM Sans',sans-serif;width:100%;}
.itinerary-btn{border:2px solid #c4a057;color:#c4a057;background:#fff;}
.itinerary-btn:hover{background:#c4a057;color:#fff;}
.booking-url-btn{background:linear-gradient(135deg,#c4a057,#e8c87a);color:#0d1b2a;border:2px solid transparent;}
.booking-url-btn:hover{opacity:.9;transform:translateY(-1px);}
.booking-note{background:#faf7f2;border-left:3px solid rgba(196,160,87,.4);border-radius:0 8px 8px 0;padding:10px 14px;font-size:12px;color:#888;margin-top:10px;line-height:1.6;}
.pack-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px;}
.pack-cat{background:#fff;border-radius:12px;padding:16px;border:1px solid rgba(196,160,87,.1);}
.pack-ttl{font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.08em;color:#c4a057;margin-bottom:10px;}
.pack-item{font-size:13px;color:#555;padding:4px 0;border-bottom:1px solid #f0ebe0;}
.curr-card{background:#0d1b2a;border-radius:14px;padding:24px;border:1px solid rgba(196,160,87,.2);}
.curr-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);}
.curr-lbl{font-size:13px;color:rgba(255,255,255,.5);}.curr-val{font-size:13px;font-weight:500;color:#e8c87a;}
.curr-tips{font-size:13px;color:rgba(255,255,255,.55);margin-top:14px;line-height:1.7;}
.weather-card{background:linear-gradient(135deg,#e8f4fd,#ddeeff);border-radius:14px;padding:20px 24px;display:flex;align-items:center;gap:18px;border:1px solid #b8d4f0;}
.w-icon{font-size:3rem;}.w-temp{font-size:1.5rem;font-weight:500;color:#1a3550;}
.w-desc{font-size:13px;color:#555;margin-top:3px;}.w-extra{font-size:12px;color:#888;margin-top:4px;}
.msg-card{background:#0d1b2a;border-radius:14px;padding:28px;border:1px solid rgba(196,160,87,.2);}
.msg-txt{font-size:15px;color:rgba(255,255,255,.75);line-height:1.8;font-style:italic;font-family:'Cormorant Garamond',serif;}
.msg-from{font-size:13px;color:#c4a057;margin-top:16px;font-weight:500;}
.book-form{background:#fff;border-radius:14px;padding:28px;border:1px solid rgba(196,160,87,.1);}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;}
@media(max-width:480px){.frow{grid-template-columns:1fr;}}
.book-form input,.book-form textarea{width:100%;padding:12px 14px;border:1px solid #e0d8cc;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;background:#faf7f2;outline:none;margin-bottom:12px;}
.book-form input:focus,.book-form textarea:focus{border-color:#c4a057;}
.sub-btn{width:100%;padding:14px;border:none;border-radius:10px;background:linear-gradient(135deg,#c4a057,#e8c87a);color:#0d1b2a;font-weight:600;font-size:15px;font-family:'DM Sans',sans-serif;cursor:pointer;}
.adv-card{background:#0d1b2a;border-radius:14px;padding:24px 32px;border:1px solid rgba(196,160,87,.2);display:inline-block;min-width:260px;}
.adv-lbl{font-size:12px;color:rgba(255,255,255,.4);margin-bottom:8px;}
.adv-phone{font-size:22px;font-weight:500;color:#c4a057;display:block;text-decoration:none;margin-bottom:4px;}
.adv-email{font-size:13px;color:rgba(255,255,255,.4);text-decoration:none;display:block;}
.adv-email:hover{color:#c4a057;}
.social-bar{display:flex;justify-content:center;gap:12px;padding:20px 20px 8px;}
.social-link{width:46px;height:46px;border-radius:12px;background:#0d1b2a;border:1px solid rgba(196,160,87,.25);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.5);text-decoration:none;transition:all .2s;}
.social-link:hover{border-color:#c4a057;color:#c4a057;}
.lb{position:fixed;inset:0;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;z-index:999;opacity:0;pointer-events:none;transition:opacity .25s;}
.lb.open{opacity:1;pointer-events:all;}
.lb img{max-width:90vw;max-height:88vh;border-radius:8px;object-fit:contain;}
.lb-close{position:absolute;top:16px;right:20px;font-size:28px;color:rgba(255,255,255,.7);cursor:pointer;background:none;border:none;}
.lb-prev,.lb-next{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.1);border:none;color:#fff;font-size:28px;padding:12px 18px;cursor:pointer;border-radius:6px;}
.lb-prev{left:12px;}.lb-next{right:12px;}
.lb-prev:hover,.lb-next:hover{background:rgba(255,255,255,.2);}
.footer{background:#0d1b2a;text-align:center;padding:28px 20px 20px;color:rgba(255,255,255,.3);font-size:12px;margin-top:40px;}
.footer-logo{height:34px;width:auto;margin-bottom:10px;opacity:.65;}
.footer strong{color:#c4a057;}
</style>
</head>
<body>

<div class="${heroClass}" ${heroBgStyle?`style="${heroBgStyle}"`:''}>
  ${heroBannerImg}
  ${tintOverlay}

  <div class="hero-topbar">
    <img src="${LOGO_B64}" alt="Voyage Vista Travels" class="hero-logo">
    <a href="mailto:Hello@voyagevista.ca" class="contact-btn">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      Contact Us
    </a>
  </div>

  <div class="hero-text">
    <div class="h1">Happy <em>${t.occasion}</em>,<br>${t.guestName}!</div>
    ${t.destination?`<div class="h-dest">📍 ${t.destination}</div>`:''}
    ${t.tripDesc?`<div class="h-desc">${t.tripDesc}</div>`:''}
  </div>

  <div class="hero-bottom">
    ${statsHtml}
    ${countdownHtml(countdown)}
  </div>
</div>

${autoCarousel}${resortBtn}${logistics}${itin}${docSection}${msgSec}${weatherSec}${packSec}${currSec}${bookSec}${contactSec}
${socialLinks}
<footer class="footer">
  <div><img src="${LOGO_B64}" alt="Voyage Vista Travels" class="footer-logo"></div>
  <strong>Voyage Vista Travels</strong> · Nepean, ON · (343) 961-3506 · Hello@voyagevista.ca<br>
  Affiliated with Nexion Travel Group-Canada · TICO Reg: 1549342
</footer>

<div class="lb" id="lb">
  <button class="lb-close" onclick="closeLB()">✕</button>
  <button class="lb-prev" onclick="navLB(-1)">‹</button>
  <img id="lbImg">
  <button class="lb-next" onclick="navLB(1)">›</button>
</div>

<script>
var photos=${JSON.stringify(t.photos||[])},lbIdx=0,carIdx=0,carTotal=${photoCount},carAuto;
var track=document.getElementById('carTrack');
var dots=document.querySelectorAll('.car-dot');
function carGo(i){
  carIdx=Math.max(0,Math.min(i,carTotal-1));
  if(track)track.style.transform='translateX(-'+carIdx+'00%)';
  dots.forEach(function(d,j){d.classList.toggle('on',j===carIdx);});
}
function carNav(d){carGo(carIdx+d);}
if(carTotal>1){
  carAuto=setInterval(function(){carGo((carIdx+1)%carTotal);},4000);
  if(track){
    track.parentElement.addEventListener('mouseenter',function(){clearInterval(carAuto);});
    track.parentElement.addEventListener('mouseleave',function(){carAuto=setInterval(function(){carGo((carIdx+1)%carTotal);},4000);});
  }
  var csx=0;
  track.addEventListener('touchstart',function(e){csx=e.touches[0].clientX;},{passive:true});
  track.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-csx;if(dx<-40)carNav(1);else if(dx>40)carNav(-1);});
}
function openLB(i){lbIdx=i;document.getElementById('lbImg').src=photos[i];document.getElementById('lb').classList.add('open');}
function closeLB(){document.getElementById('lb').classList.remove('open');}
function navLB(d){lbIdx=(lbIdx+d+photos.length)%photos.length;document.getElementById('lbImg').src=photos[lbIdx];}
document.getElementById('lb').addEventListener('click',function(e){if(e.target===this)closeLB();});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeLB();if(e.key==='ArrowRight')navLB(1);if(e.key==='ArrowLeft')navLB(-1);});
var form=document.getElementById('rsvpForm');
if(form)form.addEventListener('submit',function(e){
  e.preventDefault();
  fetch('/api/booking',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:document.getElementById('bn').value,email:document.getElementById('be').value,to:'Hello@voyagevista.ca',trip:'${t.id}'})});
  form.style.display='none';document.getElementById('bsuccess').style.display='block';
});
<\/script>
</body></html>`;
}

// ═══════════════════════════════════════════════════════════════
// PAGE BUILDER — new routes added BELOW existing routes
// Nothing above this line is changed
// ═══════════════════════════════════════════════════════════════

// List all builder trips
app.get('/api/trips/builder', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('id, guest_name, occasion, destination, depart_date, theme, created_at')
      .eq('use_builder', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ trips: (data||[]).map(t => ({
      id: t.id, guestName: t.guest_name, occasion: t.occasion,
      destination: t.destination, departDate: t.depart_date,
      theme: t.theme, createdAt: t.created_at
    }))});
  } catch(e) { res.status(500).json({ error: 'Failed to load builder trips' }); }
});

// Get single builder trip
app.get('/api/trips/builder/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('trip_data, page_components')
      .eq('id', req.params.slug)
      .eq('use_builder', true)
      .single();
    if (error || !data) return res.status(404).json({ error: 'Page not found' });
    const merged = { ...(data.trip_data || {}), components: data.page_components || [] };
    res.json(merged);
  } catch(e) { res.status(500).json({ error: 'Failed to load builder trip' }); }
});

// Save builder trip
app.post('/api/trips/builder', async (req, res) => {
  try {
    const page = req.body;
    if (!page.guestName || !page.occasion)
      return res.status(400).json({ error: 'Guest name and occasion required' });
    const slug = page.id || generateSlug(page.guestName, page.occasion);
    page.id = slug;
    const components = page.components || [];
    const meta = { ...page };
    delete meta.components;

    const { error } = await supabase.rpc('upsert_builder_trip', {
      p_id:          slug,
      p_guest_name:  page.guestName,
      p_occasion:    page.occasion,
      p_destination: page.destination  || null,
      p_depart_date: page.departDate   || null,
      p_theme:       page.theme        || null,
      p_components:  components
    });
    if (error) throw error;
    res.json({ success: true, slug });
  } catch(e) { res.status(500).json({ error: 'Failed to save: ' + e.message }); }
});

// Delete builder trip
app.delete('/api/trips/builder/:slug', async (req, res) => {
  try {
    const { error } = await supabase.from('trips').delete()
      .eq('id', req.params.slug).eq('use_builder', true);
    if (error) throw error;
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: 'Failed to delete' }); }
});

// ── COMPONENT RENDERERS ─────────────────────────────────────────
const THEME_BG_BUILDER = {
  'Birthday Celebration': 'linear-gradient(135deg,#C2185B,#d194b8)',
  'Luxury Escape':        'linear-gradient(135deg,#2A334A,#3d4e6e)',
  'Girls Getaway':        'linear-gradient(135deg,#AD1457,#d194b8)',
  'Family Celebration':   'linear-gradient(135deg,#E65100,#FF6B35)',
  'Romantic Escape':      'linear-gradient(135deg,#6A1B3A,#d194b8)',
  'Adventure Trip':       'linear-gradient(135deg,#1B5E20,#2E7D32)',
  'Group Tour':           'linear-gradient(135deg,#0D47A1,#1565C0)',
  'Cruise':               'linear-gradient(135deg,#006064,#00838F)',
};

function renderBuilderPage(page) {
  const comps = page.components || [];
  const countdown = page.departDate
    ? Math.ceil((new Date(page.departDate + ' 12:00:00') - new Date()) / 86400000)
    : null;
  const themeBg = THEME_BG_BUILDER[page.theme] || THEME_BG_BUILDER['Birthday Celebration'];

  const renderedComps = comps.map(c => renderBuilderComp(c, page, countdown, themeBg)).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${page.guestName}'s ${page.occasion} – Voyage Vista Travels</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Poppins',sans-serif;background:#fff;color:#2A334A;line-height:1.6;}
:root{--pink:#d194b8;--navy:#2A334A;}

/* NAVBAR */
.vv-navbar{background:var(--navy);display:flex;align-items:center;justify-content:space-between;padding:14px 32px;position:sticky;top:0;z-index:100;}
.vv-nav-logo{height:36px;width:auto;filter:drop-shadow(0 1px 4px rgba(0,0,0,.3));}
.vv-nav-cta{background:var(--pink);color:#fff;border:none;border-radius:4px;padding:8px 18px;font-size:13px;font-family:'Poppins',sans-serif;cursor:pointer;text-decoration:none;}

/* HERO */
.vv-hero{position:relative;min-height:90vh;display:flex;flex-direction:column;overflow:hidden;}
.vv-hero-bg{position:absolute;inset:0;object-fit:cover;width:100%;height:100%;z-index:0;}
.vv-hero-overlay{position:absolute;inset:0;z-index:1;background:linear-gradient(to bottom,rgba(42,51,74,.3) 0%,rgba(42,51,74,.65) 100%);}
.vv-hero-content{position:relative;z-index:2;flex:1;display:flex;flex-direction:column;justify-content:flex-end;padding:40px 32px 28px;}
.vv-hero-location{display:inline-block;background:var(--pink);color:#fff;border-radius:4px;padding:5px 14px;font-size:12px;font-weight:400;margin-bottom:12px;}
.vv-hero-h1{font-size:clamp(2rem,6vw,4.5rem);font-weight:200;color:#fff;line-height:1.15;margin-bottom:6px;}
.vv-hero-sub{font-size:clamp(.9rem,2vw,1.3rem);font-weight:300;color:rgba(255,255,255,.8);margin-bottom:20px;}
.vv-hero-pills{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;}
.vv-hero-pill{background:rgba(255,255,255,.12);border:.5px solid rgba(255,255,255,.3);border-radius:4px;padding:6px 14px;font-size:12px;color:#fff;font-weight:300;}
.vv-hero-btns{display:flex;gap:10px;flex-wrap:wrap;}
.vv-hero-btn-pink{background:var(--pink);color:#fff;border:none;border-radius:4px;padding:10px 22px;font-size:13px;font-family:'Poppins',sans-serif;text-decoration:none;cursor:pointer;}
.vv-hero-btn-outline{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.5);border-radius:4px;padding:10px 22px;font-size:13px;font-family:'Poppins',sans-serif;text-decoration:none;cursor:pointer;}

/* COUNTDOWN */
.vv-cd-wrap{display:inline-flex;flex-direction:column;align-items:center;background:rgba(209,148,184,.2);border:1.5px solid rgba(209,148,184,.5);border-radius:12px;padding:14px 32px;margin-bottom:20px;backdrop-filter:blur(6px);}
.vv-cd-em{font-size:1.2rem;letter-spacing:5px;margin-bottom:4px;animation:vvsp 2s ease-in-out infinite;}
@keyframes vvsp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(1.07)}}
.vv-cd-num{font-size:clamp(3rem,8vw,6rem);font-weight:200;color:#fff;line-height:1;}
.vv-cd-lbl{font-size:9px;color:rgba(255,255,255,.75);text-transform:uppercase;letter-spacing:.1em;margin-top:3px;}
.vv-cd-em2{font-size:1.2rem;letter-spacing:5px;margin-top:6px;animation:vvsp 2s ease-in-out infinite .5s;}

/* ASIDE */
.vv-aside{display:grid;grid-template-columns:1fr 1fr;gap:0;min-height:360px;}
.vv-aside.img-left{direction:rtl;}.vv-aside.img-left>*{direction:ltr;}
.vv-aside-text{padding:48px 40px;display:flex;flex-direction:column;justify-content:center;background:#fff;}
.vv-aside-img{overflow:hidden;}
.vv-aside-img img{width:100%;height:100%;object-fit:cover;}
@media(max-width:640px){.vv-aside{grid-template-columns:1fr;}.vv-aside.img-left{direction:ltr;}}

/* TEXT BLOCK */
.vv-text-block{padding:48px 32px;background:#fff;}
.vv-text-block.center{text-align:center;}
.vv-text-block.center .vv-tb-btns{justify-content:center;}

/* IMAGE BANNER */
.vv-banner{position:relative;min-height:340px;display:flex;align-items:center;justify-content:center;overflow:hidden;}
.vv-banner-bg{position:absolute;inset:0;object-fit:cover;width:100%;height:100%;}
.vv-banner-overlay{position:absolute;inset:0;background:rgba(42,51,74,.55);}
.vv-banner-content{position:relative;z-index:2;text-align:center;padding:40px 32px;}

/* CAROUSEL */
.vv-carousel{background:#fdf0f7;padding:40px 0;}
.vv-car-inner{max-width:900px;margin:0 auto;padding:0 16px;}
.vv-car-track-wrap{overflow:hidden;border-radius:8px;background:#f0e8f4;}
.vv-car-track{display:flex;transition:transform .45s cubic-bezier(.25,.46,.45,.94);}
.vv-car-slide{flex-shrink:0;width:100%;aspect-ratio:16/9;overflow:hidden;}
.vv-car-slide img{width:100%;height:100%;object-fit:cover;}
.vv-car-dots{display:flex;justify-content:center;gap:6px;padding:10px 0 4px;}
.vv-car-dot{width:7px;height:7px;border-radius:50%;background:rgba(209,148,184,.3);cursor:pointer;border:none;transition:all .2s;}
.vv-car-dot.on{background:var(--pink);width:20px;border-radius:3px;}
.vv-car-arrows{display:flex;justify-content:center;gap:8px;margin-top:8px;}
.vv-car-arr{width:36px;height:36px;border-radius:50%;background:#fff;border:1px solid rgba(209,148,184,.3);color:var(--navy);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;}

/* IMAGE GALLERY */
.vv-gallery{padding:40px 32px;background:#fff;}
.vv-gallery-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px;margin-top:20px;}
.vv-gallery-item{aspect-ratio:4/3;overflow:hidden;border-radius:6px;cursor:pointer;}
.vv-gallery-item img{width:100%;height:100%;object-fit:cover;transition:transform .3s;}
.vv-gallery-item:hover img{transform:scale(1.04);}

/* BOOKING DETAILS */
.vv-booking{background:#fff;padding:40px 32px;}
.vv-card{background:#fdf0f7;border-radius:8px;padding:16px 18px;display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;}
.vv-card-icon{width:36px;height:36px;background:#fff;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;border:.5px solid rgba(209,148,184,.3);}
.vv-card-title{font-size:14px;font-weight:500;color:var(--navy);}
.vv-card-sub{font-size:12px;font-weight:300;color:#888;margin-top:2px;}
.vv-resort-img{width:100%;border-radius:8px;overflow:hidden;margin:10px 0;aspect-ratio:16/6;}
.vv-resort-img img{width:100%;height:100%;object-fit:cover;}

/* DOCUMENTS */
.vv-docs{background:var(--navy);padding:40px 32px;}
.vv-doc-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px;}
@media(max-width:500px){.vv-doc-grid{grid-template-columns:1fr;}}
.vv-doc-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px 20px;border-radius:6px;font-size:13px;font-weight:400;text-decoration:none;font-family:'Poppins',sans-serif;}
.vv-doc-outline{border:1px solid var(--pink);color:var(--pink);background:transparent;}
.vv-doc-outline:hover{background:rgba(209,148,184,.1);}
.vv-doc-filled{background:var(--pink);color:#fff;border:1px solid var(--pink);}
.vv-doc-filled:hover{opacity:.9;}
.vv-booking-note{background:rgba(255,255,255,.06);border-left:3px solid var(--pink);border-radius:0 6px 6px 0;padding:8px 12px;font-size:12px;color:rgba(255,255,255,.55);margin-top:8px;}

/* MESSAGE */
.vv-message{background:var(--navy);padding:48px 32px;text-align:center;}
.vv-msg-text{font-size:1rem;font-weight:300;color:rgba(255,255,255,.8);font-style:italic;line-height:1.9;max-width:600px;margin:0 auto 16px;}
.vv-msg-from{font-size:12px;color:var(--pink);font-weight:400;}

/* CONTACT */
.vv-contact{background:var(--pink-light,#fdf0f7);padding:40px 32px;text-align:center;}
.vv-contact-phone{font-size:1.8rem;font-weight:200;color:var(--navy);text-decoration:none;display:block;margin-bottom:4px;}
.vv-contact-email{font-size:13px;color:#888;font-weight:300;text-decoration:none;}

/* FOOTER */
.vv-footer{background:var(--navy);padding:32px;text-align:center;}
.vv-footer-logo{height:36px;width:auto;margin-bottom:12px;opacity:.75;}
.vv-footer-brand{font-size:14px;font-weight:300;color:rgba(255,255,255,.6);}
.vv-footer-copy{font-size:11px;font-weight:300;color:rgba(255,255,255,.3);margin-top:6px;}
.vv-social-bar{display:flex;justify-content:center;gap:10px;margin:12px 0;}
.vv-social-link{width:38px;height:38px;border-radius:6px;background:rgba(255,255,255,.08);border:.5px solid rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.5);text-decoration:none;transition:all .2s;}
.vv-social-link:hover{border-color:var(--pink);color:var(--pink);}

/* SHARED */
.vv-pink-heading{font-size:clamp(1.4rem,4vw,2.5rem);font-weight:200;color:var(--pink);line-height:1.2;margin-bottom:6px;}
.vv-navy-heading{font-size:clamp(1.3rem,3.5vw,2.2rem);font-weight:200;color:var(--navy);line-height:1.2;margin-bottom:6px;}
.vv-white-heading{font-size:clamp(1.3rem,3.5vw,2.2rem);font-weight:200;color:#fff;line-height:1.2;margin-bottom:6px;}
.vv-subheading{font-size:.8rem;font-weight:500;color:#888;letter-spacing:.05em;text-transform:uppercase;margin-bottom:12px;}
.vv-subheading-pink{font-size:.8rem;font-weight:500;color:var(--pink);letter-spacing:.05em;text-transform:uppercase;margin-bottom:12px;}
.vv-subheading-white{font-size:.8rem;font-weight:500;color:rgba(255,255,255,.6);letter-spacing:.05em;text-transform:uppercase;margin-bottom:12px;}
.vv-body{font-size:.9rem;font-weight:300;color:#555;line-height:1.85;margin-bottom:16px;}
.vv-body-white{font-size:.9rem;font-weight:300;color:rgba(255,255,255,.75);line-height:1.85;margin-bottom:16px;}
.vv-btn-pink{display:inline-block;background:var(--pink);color:#fff;border-radius:4px;padding:10px 22px;font-size:13px;font-weight:400;font-family:'Poppins',sans-serif;text-decoration:none;border:none;cursor:pointer;}
.vv-btn-outline{display:inline-block;background:transparent;color:var(--pink);border:1px solid var(--pink);border-radius:4px;padding:10px 22px;font-size:13px;font-weight:400;font-family:'Poppins',sans-serif;text-decoration:none;}
.vv-btn-outline-white{display:inline-block;background:transparent;color:#fff;border:1px solid rgba(255,255,255,.5);border-radius:4px;padding:10px 22px;font-size:13px;font-weight:300;font-family:'Poppins',sans-serif;text-decoration:none;}
.vv-tb-btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:4px;}
.vv-weather{background:#e8f4fd;border-radius:8px;padding:16px 20px;display:flex;align-items:center;gap:16px;margin-top:12px;}
.vv-pack-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin-top:12px;}
.vv-pack-cat{background:var(--pink-light,#fdf0f7);border-radius:8px;padding:14px;}
.vv-pack-ttl{font-size:10px;font-weight:500;text-transform:uppercase;color:var(--pink);margin-bottom:8px;}
.vv-pack-item{font-size:12px;font-weight:300;color:#555;padding:3px 0;border-bottom:.5px solid rgba(209,148,184,.2);}
.vv-curr-card{background:var(--navy);border-radius:8px;padding:20px;margin-top:12px;}
.vv-curr-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:.5px solid rgba(255,255,255,.06);}
.vv-curr-lbl{font-size:12px;font-weight:300;color:rgba(255,255,255,.5);}
.vv-curr-val{font-size:12px;font-weight:400;color:var(--pink);}
.vv-section-container{max-width:900px;margin:0 auto;padding:0 32px;}
.lb{position:fixed;inset:0;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;z-index:999;opacity:0;pointer-events:none;transition:opacity .25s;}
.lb.open{opacity:1;pointer-events:all;}
.lb img{max-width:90vw;max-height:88vh;border-radius:8px;object-fit:contain;}
.lb-close{position:absolute;top:16px;right:20px;font-size:28px;color:rgba(255,255,255,.7);cursor:pointer;background:none;border:none;}
.lb-prev,.lb-next{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.1);border:none;color:#fff;font-size:28px;padding:12px 18px;cursor:pointer;border-radius:6px;}
.lb-prev{left:12px;}.lb-next{right:12px;}
</style>
</head>
<body>
${renderedComps}
<div class="lb" id="lb"><button class="lb-close" onclick="closeLB()">✕</button><button class="lb-prev" onclick="navLB(-1)">‹</button><img id="lbImg"><button class="lb-next" onclick="navLB(1)">›</button></div>
<script>
var __lbImgs=[],__lbIdx=0;
function openLB(imgs,i){__lbImgs=imgs;__lbIdx=i;document.getElementById('lbImg').src=imgs[i];document.getElementById('lb').classList.add('open');}
function closeLB(){document.getElementById('lb').classList.remove('open');}
function navLB(d){__lbIdx=(__lbIdx+d+__lbImgs.length)%__lbImgs.length;document.getElementById('lbImg').src=__lbImgs[__lbIdx];}
document.getElementById('lb').addEventListener('click',function(e){if(e.target===this)closeLB();});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeLB();if(e.key==='ArrowRight')navLB(1);if(e.key==='ArrowLeft')navLB(-1);});
// carousels init
document.querySelectorAll('[data-carousel]').forEach(function(el){
  var id=el.dataset.carousel,idx=0;
  var track=document.getElementById('car-track-'+id);
  var dots=document.querySelectorAll('[data-dot-'+id+']');
  var total=track?track.children.length:0;
  function go(i){idx=Math.max(0,Math.min(i,total-1));if(track)track.style.transform='translateX(-'+idx+'00%)';dots.forEach(function(d,j){d.classList.toggle('on',j===idx);});}
  document.getElementById('car-prev-'+id)?.addEventListener('click',function(){go(idx-1);});
  document.getElementById('car-next-'+id)?.addEventListener('click',function(){go(idx+1);});
  dots.forEach(function(d,i){d.addEventListener('click',function(){go(i);});});
  if(total>1)setInterval(function(){go((idx+1)%total);},4000);
});
<\/script>
</body></html>`;
}

function renderBuilderComp(comp, page, countdown, themeBg) {
  const d = comp.data || {};
  const fmt = dt => dt ? new Date(dt+'T12:00:00').toLocaleDateString('en-CA',{month:'long',day:'numeric',year:'numeric'}) : '';
  const nights = (page.departDate && page.returnDate)
    ? Math.max(0, Math.ceil((new Date(page.returnDate)-new Date(page.departDate))/86400000)) : null;

  switch(comp.type) {
    case 'navbar': return `
<nav class="vv-navbar">
  <img src="${LOGO_B64}" alt="Voyage Vista Travels" class="vv-nav-logo">
  <a href="mailto:${d.ctaEmail||'Hello@voyagevista.ca'}" class="vv-nav-cta">${d.ctaText||'Contact Us'}</a>
</nav>`;

    case 'hero': {
      const bgStyle = d.backgroundPhoto
        ? `<img class="vv-hero-bg" src="${d.backgroundPhoto}" alt="Hero"><div class="vv-hero-overlay"></div>`
        : `<div class="vv-hero-overlay" style="background:${themeBg};position:absolute;inset:0;z-index:1;"></div>`;
      const countdownBlock = d.showCountdown !== false && countdown !== null ? `
        <div class="vv-cd-wrap">
          <div class="vv-cd-em">✨ 🎉 ✨</div>
          <div class="vv-cd-num">${countdown > 0 ? countdown : countdown === 0 ? 'Today!' : "You're There!"}</div>
          <div class="vv-cd-lbl">${countdown > 0 ? 'days until your adventure begins!' : countdown === 0 ? 'Adventure starts now!' : 'Enjoy every moment!'}</div>
          <div class="vv-cd-em2">🌟 🎊 🌟</div>
        </div>` : '';
      const btnsHtml = (d.buttons||[]).map(b => b.url
        ? `<a href="${b.url}" class="vv-hero-btn-outline" target="_blank">${b.text}</a>`
        : `<span class="vv-hero-btn-outline">${b.text}</span>`
      ).join('');
      return `
<div class="vv-hero">
  ${bgStyle}
  <div class="vv-hero-content">
    ${d.location ? `<div class="vv-hero-location">📍 ${d.location}</div>` : ''}
    ${d.heading ? `<div class="vv-hero-h1">${d.heading}</div>` : ''}
    ${d.subheading ? `<div class="vv-hero-sub">${d.subheading}</div>` : ''}
    ${d.description ? `<div style="font-size:.85rem;font-weight:300;color:rgba(255,255,255,.75);max-width:540px;margin-bottom:18px;">${d.description}</div>` : ''}
    ${d.showCountdown !== false ? countdownBlock : ''}
    ${(page.departDate||nights||page.guestCount) ? `<div class="vv-hero-pills">
      ${nights ? `<div class="vv-hero-pill">${nights} Nights</div>` : ''}
      ${page.guestCount ? `<div class="vv-hero-pill">${page.guestCount} Guests</div>` : ''}
      ${page.departDate ? `<div class="vv-hero-pill">${fmt(page.departDate)}</div>` : ''}
    </div>` : ''}
    ${btnsHtml ? `<div class="vv-hero-btns">${btnsHtml}</div>` : ''}
  </div>
</div>`;
    }

    case 'aside': return `
<div class="vv-aside${d.imagePosition==='left'?' img-left':''}">
  <div class="vv-aside-text">
    ${d.heading ? `<div class="vv-pink-heading">${d.heading}</div>` : ''}
    ${d.subheading ? `<div class="vv-subheading">${d.subheading}</div>` : ''}
    ${d.description ? `<div class="vv-body">${d.description.replace(/\n/g,'<br>')}</div>` : ''}
  </div>
  <div class="vv-aside-img">
    ${d.image ? `<img src="${d.image}" alt="${d.heading||''}">` : `<div style="background:#f5dcea;width:100%;height:100%;min-height:280px;display:flex;align-items:center;justify-content:center;color:#d194b8;font-size:2rem;">🌴</div>`}
  </div>
</div>`;

    case 'textBlock': return `
<div class="vv-text-block${d.alignment==='center'?' center':''}">
  <div class="vv-section-container">
    ${d.heading ? `<div class="vv-navy-heading">${d.heading}</div>` : ''}
    ${d.subheading ? `<div class="vv-subheading">${d.subheading}</div>` : ''}
    ${d.description ? `<div class="vv-body">${d.description.replace(/\n/g,'<br>')}</div>` : ''}
    ${d.buttonText && d.buttonUrl ? `<div class="vv-tb-btns"><a href="${d.buttonUrl}" class="vv-btn-outline" target="_blank">${d.buttonText}</a></div>` : ''}
  </div>
</div>`;

    case 'imageBanner': return `
<div class="vv-banner">
  ${d.photo ? `<img class="vv-banner-bg" src="${d.photo}" alt="${d.heading||''}">` : ''}
  <div class="vv-banner-overlay"></div>
  <div class="vv-banner-content">
    ${d.heading ? `<div class="vv-white-heading">${d.heading}</div>` : ''}
    ${d.description ? `<div class="vv-body-white">${d.description}</div>` : ''}
    ${d.buttonText && d.buttonUrl ? `<a href="${d.buttonUrl}" class="vv-btn-outline-white" target="_blank">${d.buttonText}</a>` : ''}
  </div>
</div>`;

    case 'carousel': {
      const imgs = d.images || [];
      if (!imgs.length) return `<div style="background:#fdf0f7;padding:32px;text-align:center;color:#d194b8;">No carousel images yet.</div>`;
      const cid = 'c' + comp.id.replace(/\W/g,'');
      return `
<div class="vv-carousel" data-carousel="${cid}">
  <div class="vv-car-inner">
    ${d.heading ? `<div class="vv-pink-heading" style="margin-bottom:8px;">${d.heading}</div>` : ''}
    ${d.subheading ? `<div class="vv-subheading-pink">${d.subheading}</div>` : ''}
    <div class="vv-car-track-wrap">
      <div class="vv-car-track" id="car-track-${cid}">
        ${imgs.map(p=>`<div class="vv-car-slide"><img src="${p}" loading="lazy"></div>`).join('')}
      </div>
    </div>
    <div class="vv-car-dots">${imgs.map((_,i)=>`<button class="vv-car-dot${i===0?' on':''}" data-dot-${cid}></button>`).join('')}</div>
    <div class="vv-car-arrows">
      <button class="vv-car-arr" id="car-prev-${cid}">‹</button>
      <button class="vv-car-arr" id="car-next-${cid}">›</button>
    </div>
  </div>
</div>`;
    }

    case 'imageGallery': {
      const imgs = d.images || [];
      const imgArr = JSON.stringify(imgs);
      return `
<div class="vv-gallery">
  <div class="vv-section-container">
    ${d.heading ? `<div class="vv-navy-heading">${d.heading}</div>` : ''}
    <div class="vv-gallery-grid">
      ${imgs.map((p,i)=>`<div class="vv-gallery-item" onclick="openLB(${imgArr},${i})"><img src="${p}" loading="lazy"></div>`).join('')}
    </div>
  </div>
</div>`;
    }

    case 'countdown': {
      if (countdown === null) return '';
      const num = countdown > 0 ? countdown : countdown === 0 ? 'Today!' : "You're There!";
      const lbl = countdown > 0 ? 'days until your adventure begins!' : countdown === 0 ? 'Adventure starts now!' : 'Enjoy every moment!';
      return `
<div style="background:${themeBg};padding:48px 32px;text-align:center;">
  <div class="vv-cd-wrap" style="display:inline-flex;">
    <div class="vv-cd-em">✨ 🎉 ✨</div>
    <div class="vv-cd-num">${num}</div>
    <div class="vv-cd-lbl">${lbl}</div>
    <div class="vv-cd-em2">🌟 🎊 🌟</div>
  </div>
</div>`;
    }

    case 'bookingDetails': return `
<div class="vv-booking">
  <div class="vv-section-container">
    <div class="vv-subheading-pink">Booking Details</div>
    ${d.hotel ? `<div class="vv-card"><div class="vv-card-icon">🏨</div><div><div class="vv-card-title">${d.hotel}</div><div class="vv-card-sub">${d.hotelAddr||''}${d.checkin?' · '+d.checkin:''}</div></div></div>` : ''}
    ${d.hotelPhoto ? `<div class="vv-resort-img"><img src="${d.hotelPhoto}" alt="${d.hotel||'Resort'}"></div>` : ''}
    ${d.flight ? `<div class="vv-card"><div class="vv-card-icon">✈</div><div><div class="vv-card-title">${d.flight}</div><div class="vv-card-sub">${d.flightTime||''}${d.bookingRef?' · '+d.bookingRef:''}</div></div></div>` : ''}
  </div>
</div>`;

    case 'documents': return `
<div class="vv-docs">
  <div class="vv-section-container">
    <div class="vv-subheading-white">Documents & Links</div>
    <div class="vv-doc-grid">
      ${d.itineraryLink ? `<div><a href="${d.itineraryLink}" target="_blank" class="vv-doc-btn vv-doc-outline">⬇ ${d.itineraryLabel||'Download Itinerary'}</a></div>` : ''}
      ${d.bookingUrl ? `<div><a href="${d.bookingUrl}" target="_blank" class="vv-doc-btn vv-doc-filled">→ ${d.bookingLabel||'Book Now'}</a>${d.bookingNote?`<div class="vv-booking-note">💡 ${d.bookingNote}</div>`:''}</div>` : ''}
    </div>
  </div>
</div>`;

    case 'message': return d.text ? `
<div class="vv-message">
  <div class="vv-section-container">
    <div class="vv-msg-text">"${d.text}"</div>
    <div class="vv-msg-from">— ${d.signedFrom||'Voyage Vista Travels'}</div>
  </div>
</div>` : '';

    case 'contact': return `
<div class="vv-contact">
  <div class="vv-subheading" style="color:var(--pink);">Your travel advisor is available 24/7</div>
  ${d.phone ? `<a href="tel:${d.phone.replace(/\D/g,'')}" class="vv-contact-phone">${d.phone}</a>` : ''}
  ${d.email ? `<a href="mailto:${d.email}" class="vv-contact-email">${d.email}</a>` : ''}
</div>`;

    case 'footer': {
      const waNum = (d.socialWA||'').replace(/\D/g,'');
      return `
<footer class="vv-footer">
  <div><img src="${LOGO_B64}" alt="Voyage Vista Travels" class="vv-footer-logo"></div>
  ${(d.socialIG||d.socialFB||waNum) ? `<div class="vv-social-bar">
    ${d.socialIG ? `<a href="${d.socialIG}" class="vv-social-link" target="_blank" title="Instagram"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>` : ''}
    ${d.socialFB ? `<a href="${d.socialFB}" class="vv-social-link" target="_blank" title="Facebook"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>` : ''}
    ${waNum ? `<a href="https://wa.me/${waNum}" class="vv-social-link" target="_blank" title="WhatsApp"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></a>` : ''}
  </div>` : ''}
  <div class="vv-footer-brand">Voyage Vista Travels</div>
  <div class="vv-footer-copy">Nepean, ON · (343) 961-3506 · Hello@voyagevista.ca<br>Affiliated with Nexion Travel Group-Canada · TICO Reg: 1549342</div>
  <div class="vv-footer-copy" style="margin-top:8px;">© ${new Date().getFullYear()} Voyage Vista Travels</div>
</footer>`;
    }

    case 'weather': return ''; // rendered dynamically client-side

    case 'packingList': {
      const cats = (d.items||[]).reduce((a,i)=>{(a[i.category||'Other']=a[i.category||'Other']||[]).push(i.item);return a;},{});
      if (!Object.keys(cats).length) return '';
      return `
<div style="background:#fff;padding:40px 32px;">
  <div class="vv-section-container">
    <div class="vv-subheading-pink">Packing List</div>
    <div class="vv-pack-grid">
      ${Object.entries(cats).map(([cat,items])=>`<div class="vv-pack-cat"><div class="vv-pack-ttl">${cat}</div>${items.map(i=>`<div class="vv-pack-item">✓ ${i}</div>`).join('')}</div>`).join('')}
    </div>
  </div>
</div>`;
    }

    case 'currency': return (d.localCurrency||d.tips) ? `
<div style="background:#fdf0f7;padding:40px 32px;">
  <div class="vv-section-container">
    <div class="vv-subheading-pink">Currency & Money Tips</div>
    <div class="vv-curr-card">
      ${d.localCurrency ? `<div class="vv-curr-row"><span class="vv-curr-lbl">Local Currency</span><span class="vv-curr-val">${d.localCurrency}</span></div>` : ''}
      ${d.exchangeRate ? `<div class="vv-curr-row"><span class="vv-curr-lbl">Exchange Rate</span><span class="vv-curr-val">${d.exchangeRate}</span></div>` : ''}
      ${d.dailyBudget ? `<div class="vv-curr-row"><span class="vv-curr-lbl">Daily Budget</span><span class="vv-curr-val">${d.dailyBudget}</span></div>` : ''}
      ${d.tips ? `<div style="font-size:12px;font-weight:300;color:rgba(255,255,255,.55);margin-top:12px;line-height:1.7;">${d.tips}</div>` : ''}
    </div>
  </div>
</div>` : '';

    default: return '';
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Voyage Vista Travels running on port ' + PORT);
  if (process.env.RENDER_EXTERNAL_URL) {
    setInterval(() => { fetch(process.env.RENDER_EXTERNAL_URL + '/api/health').catch(()=>{}); }, 14 * 60 * 1000);
  }
});
