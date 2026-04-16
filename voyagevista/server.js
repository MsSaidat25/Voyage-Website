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
    const { error } = await supabase.from('trips').upsert({
      id: slug, guest_name: trip.guestName, occasion: trip.occasion,
      destination: trip.destination || null, depart_date: trip.departDate || null,
      return_date: trip.returnDate || null, guest_count: trip.guestCount || null,
      theme: trip.theme || null, trip_data: trip
    }, { onConflict: 'id' });
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

const BG_MAP = {
  sunset: 'linear-gradient(135deg,#FF6B35,#F7931E)',
  hotpink: 'linear-gradient(135deg,#E91E8C,#FF6B9D)',
  caribbean: 'linear-gradient(135deg,#00838F,#00BCD4)',
  purple: 'linear-gradient(135deg,#6A1B9A,#CE93D8)',
  coral: 'linear-gradient(135deg,#D32F2F,#FF7043)',
  ocean: 'linear-gradient(135deg,#1565C0,#42A5F5)',
  tropical: 'linear-gradient(135deg,#2E7D32,#66BB6A)',
  gold: 'linear-gradient(135deg,#E65100,#FFA000)',
  navy: 'linear-gradient(135deg,#0d1b2a,#1a3550)'
};

function getBgStyle(t) {
  if (t.bannerPhoto) {
    return `background:linear-gradient(160deg,rgba(0,0,0,0.65) 0%,rgba(0,0,0,0.4) 100%),url('${t.bannerPhoto}') center/cover no-repeat;`;
  }
  const color = t.bgColor || 'sunset';
  const bg = color.startsWith('#')
    ? `linear-gradient(135deg,${color},${color}aa)`
    : (BG_MAP[color] || BG_MAP.sunset);
  return `background:${bg};`;
}

function renderResortPage(t) {
  const photos = t.resortPhotos || [];
  const bg = getBgStyle(t);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${t.hotel||'Resort'} Photos — Voyage Vista Travels</title><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'DM Sans',sans-serif;background:#0d1b2a;color:#e8dcc8;}.hero{${bg}padding:60px 24px 40px;text-align:center;}.badge{display:inline-block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#fff;border:1px solid rgba(255,255,255,.4);border-radius:20px;padding:5px 18px;margin-bottom:14px;}h1{font-family:'Cormorant Garamond',serif;font-size:clamp(1.8rem,5vw,3rem);color:#fff;font-weight:600;margin-bottom:8px;}.sub{color:rgba(255,255,255,.6);}.back-btn{display:inline-block;margin-top:20px;padding:10px 24px;border:1px solid rgba(255,255,255,.4);border-radius:8px;color:#fff;text-decoration:none;font-size:13px;}.back-btn:hover{background:rgba(255,255,255,.1);}.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:6px;padding:24px;}.gitem{overflow:hidden;border-radius:6px;aspect-ratio:4/3;cursor:pointer;}.gitem img{width:100%;height:100%;object-fit:cover;transition:transform .3s;}.gitem:hover img{transform:scale(1.04);}.lb{position:fixed;inset:0;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;z-index:999;opacity:0;pointer-events:none;transition:opacity .25s;}.lb.open{opacity:1;pointer-events:all;}.lb img{max-width:90vw;max-height:88vh;border-radius:8px;object-fit:contain;}.lb-close{position:absolute;top:16px;right:20px;font-size:28px;color:rgba(255,255,255,.7);cursor:pointer;background:none;border:none;}.lb-prev,.lb-next{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.1);border:none;color:#fff;font-size:24px;padding:12px 16px;cursor:pointer;border-radius:6px;}.lb-prev{left:12px;}.lb-next{right:12px;}.footer{text-align:center;padding:32px 20px;color:rgba(255,255,255,.25);font-size:12px;}.footer strong{color:#c4a057;}</style></head><body><div class="hero"><div class="badge">Voyage Vista Travels · Resort Gallery</div><h1>${t.hotel||'Resort'} Photos</h1><div class="sub">${t.destination||''}</div><a href="/trips/${t.id}" class="back-btn">← Back to Trip Page</a></div>${photos.length?`<div class="gallery">${photos.map((p,i)=>`<div class="gitem" onclick="openLB(${i})"><img src="${p}" loading="lazy"></div>`).join('')}</div>`:'<div style="display:flex;align-items:center;justify-content:center;min-height:300px;color:rgba(255,255,255,.3);">No resort photos uploaded yet.</div>'}<div class="lb" id="lb"><button class="lb-close" onclick="closeLB()">✕</button><button class="lb-prev" onclick="navLB(-1)">‹</button><img id="lbImg"><button class="lb-next" onclick="navLB(1)">›</button></div><footer class="footer"><strong>Voyage Vista Travels</strong> · (343) 961-3506 · Hello@voyagevista.ca</footer><script>var p=${JSON.stringify(photos)},i=0;function openLB(n){i=n;document.getElementById('lbImg').src=p[n];document.getElementById('lb').classList.add('open');}function closeLB(){document.getElementById('lb').classList.remove('open');}function navLB(d){i=(i+d+p.length)%p.length;openLB(i);}document.getElementById('lb').addEventListener('click',function(e){if(e.target===this)closeLB();});document.addEventListener('keydown',function(e){if(e.key==='Escape')closeLB();if(e.key==='ArrowRight')navLB(1);if(e.key==='ArrowLeft')navLB(-1);});<\/script></body></html>`;
}

function renderTripPage(t) {
  const nights = (t.departDate&&t.returnDate)?Math.max(0,Math.ceil((new Date(t.returnDate)-new Date(t.departDate))/86400000)):null;
  const countdown = t.departDate?Math.ceil((new Date(t.departDate)-new Date())/86400000):null;
  const fmt = d=>d?new Date(d+'T12:00:00').toLocaleDateString('en-CA',{month:'long',day:'numeric',year:'numeric'}):'';
  const heroBg = getBgStyle(t);
  const photoCount = (t.photos||[]).length;

  let cdHtml='';
  if(countdown!==null){
    if(countdown>0) cdHtml=`<div class="cd-wrap"><div class="cd-sp">✨ 🎉 ✨</div><div class="cd-num">${countdown}</div><div class="cd-lbl">days until your adventure begins!</div><div class="cd-sp">🌟 🎊 🌟</div></div>`;
    else if(countdown===0) cdHtml=`<div class="cd-wrap"><div class="cd-sp">🎉 🥂 🎉</div><div class="cd-num">Today!</div><div class="cd-lbl">Your adventure starts now!</div></div>`;
    else cdHtml=`<div class="cd-wrap"><div class="cd-sp">🌴 ✈️ 🌴</div><div class="cd-num">You're There!</div><div class="cd-lbl">Enjoy every moment!</div></div>`;
  }

  // LARGE AUTO-CAROUSEL WITH ARROWS
  const autoCarousel = photoCount > 0 ? `
  <section class="sec">
    <div class="sec-label">Photo Gallery</div>
    <div class="car-outer">
      <button class="car-arrow car-prev" onclick="carNav(-1)" aria-label="Previous">&#8249;</button>
      <div class="car-viewport" id="carVP">
        <div class="car-track" id="carTrack">
          ${t.photos.map((p,i)=>`<div class="car-slide"><img src="${p}" loading="lazy" onclick="openLB(${i})" alt="Photo ${i+1}"></div>`).join('')}
        </div>
      </div>
      <button class="car-arrow car-next" onclick="carNav(1)" aria-label="Next">&#8250;</button>
    </div>
    <div class="car-dots" id="carDots">
      ${t.photos.map((_,i)=>`<div class="car-dot${i===0?' on':''}" onclick="carGo(${i})"></div>`).join('')}
    </div>
  </section><hr class="div">` : '';

  const resortBtn=(t.resortPhotos&&t.resortPhotos.length)?`<section class="sec" style="text-align:center;"><a href="/trips/${t.id}/resort" class="resort-btn">🏨 View ${t.hotel||'Resort'} Photos <span class="r-count">${t.resortPhotos.length} photos</span></a></section><hr class="div">`:'';
  const resortHero=t.resortHeroPhoto?`<div class="resort-img"><img src="${t.resortHeroPhoto}" alt="${t.hotel||'Resort'}"></div>`:'';

  const logistics=(t.flight||t.hotel)?`
  <section class="sec"><div class="sec-label">Booking Details</div>
  ${t.hotel?`<div class="card"><div class="ci hotel-i">🏨</div><div class="cb"><div class="ct">${t.hotel}</div><div class="cs">${t.hotelAddr?t.hotelAddr+'<br>':''}${t.checkin||''}</div></div></div>${resortHero}`:''} 
  ${t.flight?`<div class="card"><div class="ci flight-i">✈</div><div class="cb"><div class="ct">${t.flight}</div><div class="cs">${t.flightTime||''}${t.bookingRef?' · '+t.bookingRef:''}</div></div></div>`:''}
  </section><hr class="div">` : '';

  const itin=(t.days&&t.days.some(d=>d.title||(d.events&&d.events.length)))?`
  <section class="sec">
    <div class="doc-section-hd">🗓 Itinerary</div>
    ${t.days.filter(d=>d.title||(d.events&&d.events.length)).map(d=>`
    <div class="day-block"><div class="day-lbl">${d.label}${d.date?' — '+d.date:''}</div>
    ${d.title?`<div class="day-ttl">${d.title}</div>`:''}
    ${(d.events||[]).filter(e=>e.title).map(e=>`<div class="ev-row"><span class="ev-dot ev-${e.type}"></span><div><div class="ev-title">${e.title}${e.time?` <span class="ev-time">${e.time}</span>`:''}</div>${e.notes?`<div class="ev-note">${e.notes}</div>`:''}</div></div>`).join('')}
    </div>`).join('')}
  </section><hr class="div">` : '';

  // ITINERARY + BOOKING SIDE BY SIDE with SEPARATE HEADINGS
  const docSection = (t.itineraryLink||t.bookingUrl) ? `
  <section class="sec">
    <div class="doc-cols">
      ${t.itineraryLink ? `
      <div class="doc-col">
        <div class="doc-section-hd">📄 Itinerary Document</div>
        <a href="${t.itineraryLink}" target="_blank" rel="noopener" class="doc-btn itinerary-btn">
          <span>⬇</span> ${t.itineraryLinkLabel||'Download Itinerary'}
        </a>
      </div>` : ''}
      ${t.bookingUrl ? `
      <div class="doc-col">
        <div class="doc-section-hd">🔗 Booking Link</div>
        <a href="${t.bookingUrl}" target="_blank" rel="noopener" class="doc-btn booking-url-btn">
          <span>→</span> ${t.bookingUrlLabel||'Book Now'}
        </a>
        ${t.bookingNote?`<div class="booking-note">💡 ${t.bookingNote}</div>`:''}
      </div>` : ''}
    </div>
  </section><hr class="div">` : '';

  // MESSAGE is AFTER doc section
  const msgSec=t.message?`
  <section class="sec"><div class="sec-label">A message for you</div>
  <div class="msg-card"><div class="msg-txt">"${t.message}"</div><div class="msg-from">— ${t.signedFrom||'Voyage Vista Travels'}</div></div>
  </section><hr class="div">` : '';

  const weatherSec=t.weatherSnapshot?`<section class="sec"><div class="sec-label">Weather in ${t.weatherSnapshot.dest||t.destination||''}</div><div class="weather-card"><div class="w-icon">${t.weatherSnapshot.icon||'🌤️'}</div><div><div class="w-temp">${t.weatherSnapshot.tempC}°C / ${t.weatherSnapshot.tempF}°F</div><div class="w-desc">${t.weatherSnapshot.desc}</div><div class="w-extra">Feels like ${t.weatherSnapshot.feels}°C · Humidity ${t.weatherSnapshot.humidity}%</div></div></div></section><hr class="div">`:'';

  const packCats=t.packingList&&t.packingList.length?t.packingList.reduce((a,i)=>{(a[i.category||'General']=a[i.category||'General']||[]).push(i.item);return a;},{}):null;
  const packSec=packCats?`<section class="sec"><div class="sec-label">Packing List</div><div class="pack-grid">${Object.entries(packCats).map(([c,items])=>`<div class="pack-cat"><div class="pack-ttl">${c}</div>${items.map(i=>`<div class="pack-item">✓ ${i}</div>`).join('')}</div>`).join('')}</div></section><hr class="div">`:'';

  const currSec=t.currency&&(t.currency.localCurrency||t.currency.tips)?`<section class="sec"><div class="sec-label">Currency & Money Tips</div><div class="curr-card">${t.currency.localCurrency?`<div class="curr-row"><span class="curr-lbl">Local Currency</span><span class="curr-val">${t.currency.localCurrency}</span></div>`:''} ${t.currency.exchangeRate?`<div class="curr-row"><span class="curr-lbl">Exchange Rate</span><span class="curr-val">${t.currency.exchangeRate}</span></div>`:''} ${t.currency.dailyBudget?`<div class="curr-row"><span class="curr-lbl">Daily Budget</span><span class="curr-val">${t.currency.dailyBudget}</span></div>`:''} ${t.currency.tips?`<div class="curr-tips">${t.currency.tips}</div>`:''}</div></section><hr class="div">`:'';

  const bookSec=t.showBookingForm?`<section class="sec"><div class="sec-label">Booking Form</div><div class="book-form"><form id="rsvpForm"><div class="frow"><input type="text" placeholder="Full Name *" required id="bn"><input type="email" placeholder="Email *" required id="be"></div><div class="frow"><input type="tel" placeholder="Phone Number" id="bp"><input type="text" placeholder="Number of Guests" id="bg"></div>${(t.bookingFormFields||[]).map(f=>`<input type="text" placeholder="${f}" style="width:100%;margin-bottom:12px;">`).join('')}<textarea placeholder="Special requests or questions..." rows="3" id="bn2"></textarea><button type="submit" class="sub-btn">Submit Booking to Voyage Vista Travels ✈</button></form><div id="bsuccess" style="display:none;text-align:center;padding:24px;color:#7ec98f;line-height:1.7;">✅ Thank you! We'll be in touch at <strong style="color:#c4a057;">Hello@voyagevista.ca</strong></div></div></section><hr class="div">`:'';

  const contactSec=t.advisorPhone?`<section class="sec" style="text-align:center;"><div class="adv-card"><div class="adv-lbl">Your travel advisor is available 24/7</div><a href="tel:${(t.advisorPhone||'').replace(/\D/g,'')}" class="adv-phone">${t.advisorPhone}</a><a href="mailto:Hello@voyagevista.ca" class="adv-email">Hello@voyagevista.ca</a></div></section>`:'';

  const socialLinks=(t.socialIG||t.socialFB||t.socialWA)?`
  <div class="social-bar">
    ${t.socialIG?`<a href="${t.socialIG}" target="_blank" rel="noopener" class="social-link" title="Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>`:''} 
    ${t.socialFB?`<a href="${t.socialFB}" target="_blank" rel="noopener" class="social-link" title="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>`:''}
    ${t.socialWA?`<a href="https://wa.me/${t.socialWA}" target="_blank" rel="noopener" class="social-link" title="WhatsApp"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></a>`:''}
  </div>`:'';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${t.guestName}'s ${t.occasion} – Voyage Vista Travels</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;background:#f5f0e8;color:#2c2c2c;line-height:1.6;}
.hero{min-height:100vh;${heroBg}display:flex;align-items:center;justify-content:center;text-align:center;padding:80px 24px 60px;position:relative;overflow:hidden;}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(255,255,255,.12),transparent 60%);pointer-events:none;}
.hi{position:relative;z-index:1;max-width:720px;margin:0 auto;}
.h-badge{display:inline-flex;align-items:center;gap:8px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#fff;border:1px solid rgba(255,255,255,.5);border-radius:20px;padding:6px 20px;margin-bottom:20px;background:rgba(255,255,255,.12);}
.conf{font-size:1.6rem;letter-spacing:6px;margin-bottom:14px;opacity:.9;}
.h1{font-family:'Cormorant Garamond',serif;font-size:clamp(2.6rem,8vw,5.8rem);color:#fff;font-weight:600;line-height:1.1;margin-bottom:12px;text-shadow:0 2px 32px rgba(0,0,0,.25);}
.h1 em{color:#fff;font-style:italic;text-shadow:0 0 40px rgba(255,255,255,.4);}
.h-dest{font-size:1.1rem;color:rgba(255,255,255,.8);margin-bottom:12px;}
.h-desc{font-size:.95rem;color:rgba(255,255,255,.65);max-width:500px;margin:0 auto 28px;line-height:1.7;}
.h-stats{display:flex;justify-content:center;gap:20px;flex-wrap:wrap;margin-bottom:32px;}
.stat-box{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);border-radius:14px;padding:14px 24px;backdrop-filter:blur(8px);}
.s-num{font-family:'Cormorant Garamond',serif;font-size:1.9rem;color:#fff;font-weight:600;}
.s-lbl{font-size:10px;color:rgba(255,255,255,.65);letter-spacing:.08em;text-transform:uppercase;margin-top:2px;}
.cd-wrap{display:inline-block;background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.4);border-radius:24px;padding:24px 52px;margin-top:8
