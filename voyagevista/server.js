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
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': 'https://www.voyagevista.ca', 'X-Title': 'Voyage Vista' },
      body: JSON.stringify({ model: req.body.model || 'anthropic/claude-3.5-haiku', max_tokens: 400, messages: req.body.messages })
    });
    res.json(await response.json());
  } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/booking', (req, res) => { console.log('Booking:', req.body); res.json({ success: true }); });

app.get('/trips', (req, res) => {
  const adminFile = path.join(ROOT, 'trips', 'admin.html');
  if (fs.existsSync(adminFile)) res.sendFile(adminFile);
  else res.status(404).send('Admin page not found — make sure trips/admin.html exists in your repo.');
});

app.get('/trips/admin', (req, res) => {
  const adminFile = path.join(ROOT, 'trips', 'admin.html');
  if (fs.existsSync(adminFile)) res.sendFile(adminFile);
  else res.status(404).send('Admin page not found — make sure trips/admin.html exists in your repo.');
});

app.get('/trips/:slug', (req, res) => {
  if (req.params.slug === 'admin') return res.redirect('/trips/admin');
  const data = loadTrips();
  const trip = data.trips[req.params.slug];
  if (!trip) return res.status(404).send(notFoundPage());
  res.send(renderTripPage(trip));
});

function notFoundPage() {
  return `<!DOCTYPE html><html><head><title>Not Found</title>
  <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0d1b2a;color:#e8dcc8;text-align:center;}h1{color:#c4a057;}a{color:#c4a057;}</style></head>
  <body><div><h1>✈ Trip Not Found</h1><p style="color:rgba(255,255,255,0.5)">This trip page doesn't exist.</p><a href="/">Return to Voyage Vista</a></div></body></html>`;
}

function renderTripPage(t) {
  const nights = (t.departDate && t.returnDate) ? Math.max(0, Math.ceil((new Date(t.returnDate) - new Date(t.departDate)) / 86400000)) : null;
  const countdown = t.departDate ? Math.ceil((new Date(t.departDate) - new Date()) / 86400000) : null;
  const fmt = d => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  const heroBg = t.bannerPhoto
    ? `background:linear-gradient(160deg,rgba(13,27,42,0.82) 0%,rgba(26,46,69,0.65) 100%),url('${t.bannerPhoto}') center/cover no-repeat;`
    : `background:linear-gradient(135deg,#0d1b2a 0%,#1a3550 100%);`;
  const photos = (t.photos && t.photos.length) ? `<section class="sec"><div class="sec-label">Photo Gallery</div><div class="photo-grid">${t.photos.map(p=>`<div class="photo-item"><img src="${p}" alt="Trip photo" loading="lazy"></div>`).join('')}</div></section><hr class="div">` : '';
  const logistics = (t.flight || t.hotel) ? `<section class="sec"><div class="sec-label">Booking Details</div>${t.flight?`<div class="info-card"><div class="iicon flight-i">✈</div><div class="ibody"><div class="ititle">${t.flight}</div><div class="isub">${t.flightTime||''}${t.bookingRef?' · '+t.bookingRef:''}</div></div></div>`:''}${t.hotel?`<div class="info-card"><div class="iicon hotel-i">🏨</div><div class="ibody"><div class="ititle">${t.hotel}</div><div class="isub">${t.hotelAddr?t.hotelAddr+'<br>':''}${t.checkin||''}</div></div></div>`:''}</section><hr class="div">` : '';
  const itinerary = (t.days && t.days.some(d=>d.title||( d.events&&d.events.length))) ? `<section class="sec"><div class="sec-label">Your Itinerary</div>${t.days.filter(d=>d.title||(d.events&&d.events.length)).map(d=>`<div class="day-block"><div class="day-lbl">${d.label}${d.date?' — '+d.date:''}</div><div class="day-ttl">${d.title||''}</div>${(d.events||[]).filter(e=>e.title).map(e=>`<div class="event-row"><span class="ev-dot"></span><div><div class="ev-title">${e.title}${e.time?' <span class="ev-time">'+e.time+'</span>':''}</div>${e.notes?'<div class="ev-note">'+e.notes+'</div>':''}</div></div>`).join('')}</div>`).join('')}</section><hr class="div">` : '';
  const pdfSec = t.pdfItinerary ? `<section class="sec"><div class="sec-label">Download Itinerary</div><a href="${t.pdfItinerary}" download class="dl-btn">📄 Download Full Itinerary PDF</a></section><hr class="div">` : '';
  const packCats = t.packingList && t.packingList.length ? t.packingList.reduce((a,i)=>{(a[i.category||'General']=a[i.category||'General']||[]).push(i.item);return a;},{}) : null;
  const packSec = packCats ? `<section class="sec"><div class="sec-label">Packing List</div><div class="pack-grid">${Object.entries(packCats).map(([c,items])=>`<div class="pack-cat"><div class="pack-cat-ttl">${c}</div>${items.map(i=>`<div class="pack-item">✓ ${i}</div>`).join('')}</div>`).join('')}</div></section><hr class="div">` : '';
  const currSec = t.currency && (t.currency.localCurrency||t.currency.tips) ? `<section class="sec"><div class="sec-label">Currency & Money Tips</div><div class="curr-card">${t.currency.localCurrency?`<div class="curr-row"><span class="curr-lbl">Local Currency</span><span class="curr-val">${t.currency.localCurrency}</span></div>`:''}${t.currency.exchangeRate?`<div class="curr-row"><span class="curr-lbl">Exchange Rate</span><span class="curr-val">${t.currency.exchangeRate}</span></div>`:''}${t.currency.dailyBudget?`<div class="curr-row"><span class="curr-lbl">Daily Budget</span><span class="curr-val">${t.currency.dailyBudget}</span></div>`:''}${t.currency.tips?`<div class="curr-tips">${t.currency.tips}</div>`:''}</div></section><hr class="div">` : '';
  const msgSec = t.message ? `<section class="sec"><div class="sec-label">A message for you</div><div class="msg-card"><div class="msg-txt">"${t.message}"</div><div class="msg-from">— ${t.signedFrom||'Voyage Vista Travels'}</div></div></section><hr class="div">` : '';
  const bookSec = t.showBookingForm ? `<section class="sec"><div class="sec-label">RSVP / Enquiry</div><div class="book-form"><form onsubmit="submitB(event)"><div class="frow"><input type="text" placeholder="Full Name *" required id="bn"><input type="email" placeholder="Email *" required id="be"></div><div class="frow"><input type="tel" placeholder="Phone Number" id="bp"><input type="text" placeholder="Number of Guests" id="bg"></div>${(t.bookingFormFields||[]).map(f=>`<input type="text" placeholder="${f}" style="width:100%;margin-bottom:12px;">`).join('')}<textarea placeholder="Special requests or questions..." rows="3" id="bn2"></textarea><button type="submit" class="sub-btn">Send RSVP to Voyage Vista ✈</button></form><div id="bsuccess" style="display:none;text-align:center;padding:24px;color:#7ec98f;font-size:15px;">✅ Thank you! We'll be in touch within 1–2 business days.</div></div></section><hr class="div">` : '';
  const contactSec = t.advisorPhone ? `<section class="sec" style="text-align:center;"><div class="adv-card"><div class="adv-lbl">Your travel advisor is available 24/7</div><a href="tel:${(t.advisorPhone||'').replace(/\D/g,'')}" class="adv-phone">${t.advisorPhone}</a><div style="margin-top:6px;"><a href="mailto:hello@voyagevista.ca" style="color:rgba(255,255,255,0.4);font-size:13px;text-decoration:none;">hello@voyagevista.ca</a></div></div></section>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${t.guestName}'s ${t.occasion} – Voyage Vista Travels</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;background:#f5f0e8;color:#2c2c2c;line-height:1.6;}
.hero{min-height:72vh;${heroBg}display:flex;align-items:center;justify-content:center;text-align:center;padding:72px 24px;}
.h-badge{display:inline-block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#c4a057;border:1px solid rgba(196,160,87,.4);border-radius:20px;padding:5px 18px;margin-bottom:16px;}
.h1{font-family:'Cormorant Garamond',serif;font-size:clamp(2.2rem,7vw,4.5rem);color:#fff;font-weight:600;line-height:1.15;margin-bottom:10px;}
.h1 em{color:#e8c87a;font-style:italic;}
.h-dest{font-size:1.05rem;color:rgba(255,255,255,.6);margin-bottom:28px;}
.h-stats{display:flex;justify-content:center;gap:32px;flex-wrap:wrap;}
.s-num{font-family:'Cormorant Garamond',serif;font-size:1.8rem;color:#c4a057;font-weight:600;}
.s-lbl{font-size:11px;color:rgba(255,255,255,.4);letter-spacing:.06em;margin-top:2px;}
.cd{background:rgba(196,160,87,.15);border:1px solid rgba(196,160,87,.3);border-radius:12px;padding:10px 28px;display:inline-block;margin-top:20px;}
.cd-n{font-size:2.4rem;color:#c4a057;font-family:'Cormorant Garamond',serif;font-weight:600;}
.cd-l{font-size:11px;color:rgba(255,255,255,.45);letter-spacing:.06em;}
.sec{padding:36px 20px;max-width:720px;margin:0 auto;}
.sec-label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#c4a057;font-weight:500;margin-bottom:16px;}
.div{border:none;border-top:1px solid rgba(196,160,87,.1);margin:0 20px;}
.info-card{background:#fff;border-radius:14px;padding:16px 20px;display:flex;align-items:flex-start;gap:14px;margin-bottom:12px;border:1px solid rgba(196,160,87,.1);box-shadow:0 2px 12px rgba(0,0,0,.05);}
.iicon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
.flight-i{background:#EAF3DE;}.hotel-i{background:#E6F1FB;}
.ibody{flex:1;}.ititle{font-size:14px;font-weight:500;}.isub{font-size:12px;color:#888;margin-top:3px;line-height:1.5;}
.day-block{border-left:3px solid rgba(196,160,87,.35);padding-left:18px;margin-bottom:20px;}
.day-lbl{font-size:11px;font-weight:500;color:#c4a057;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px;}
.day-ttl{font-size:16px;font-weight:500;margin-bottom:8px;}
.event-row{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;}
.ev-dot{width:8px;height:8px;border-radius:50%;background:rgba(196,160,87,.5);margin-top:6px;flex-shrink:0;}
.ev-title{font-size:14px;font-weight:500;}
.ev-time{font-size:12px;color:#c4a057;font-weight:400;margin-left:6px;}
.ev-note{font-size:13px;color:#666;margin-top:3px;line-height:1.5;}
.photo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;}
.photo-item{border-radius:12px;overflow:hidden;aspect-ratio:4/3;}
.photo-item img{width:100%;height:100%;object-fit:cover;}
.pack-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px;}
.pack-cat{background:#fff;border-radius:12px;padding:16px;border:1px solid rgba(196,160,87,.1);}
.pack-cat-ttl{font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.08em;color:#c4a057;margin-bottom:10px;}
.pack-item{font-size:13px;color:#555;padding:4px 0;border-bottom:1px solid #f0ebe0;}
.curr-card{background:#0d1b2a;border-radius:14px;padding:24px;border:1px solid rgba(196,160,87,.2);}
.curr-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);}
.curr-lbl{font-size:13px;color:rgba(255,255,255,.5);}.curr-val{font-size:13px;font-weight:500;color:#e8c87a;}
.curr-tips{font-size:13px;color:rgba(255,255,255,.55);margin-top:14px;line-height:1.7;}
.msg-card{background:#0d1b2a;border-radius:14px;padding:28px;border:1px solid rgba(196,160,87,.2);}
.msg-txt{font-size:15px;color:rgba(255,255,255,.7);line-height:1.8;font-style:italic;font-family:'Cormorant Garamond',serif;}
.msg-from{font-size:13px;color:#c4a057;margin-top:16px;font-weight:500;}
.book-form{background:#fff;border-radius:14px;padding:28px;border:1px solid rgba(196,160,87,.1);}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;}
@media(max-width:480px){.frow{grid-template-columns:1fr;}}
.book-form input,.book-form textarea{width:100%;padding:12px 14px;border:1px solid #e0d8cc;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;background:#faf7f2;outline:none;margin-bottom:12px;}
.book-form input:focus,.book-form textarea:focus{border-color:#c4a057;}
.sub-btn{width:100%;padding:14px;border:none;border-radius:10px;background:linear-gradient(135deg,#c4a057,#e8c87a);color:#0d1b2a;font-weight:600;font-size:15px;font-family:'DM Sans',sans-serif;cursor:pointer;}
.dl-btn{display:inline-block;padding:14px 28px;border:2px solid #c4a057;border-radius:10px;color:#c4a057;font-weight:500;font-size:14px;text-decoration:none;}
.dl-btn:hover{background:#c4a057;color:#0d1b2a;}
.adv-card{background:#0d1b2a;border-radius:14px;padding:24px 32px;border:1px solid rgba(196,160,87,.2);display:inline-block;}
.adv-lbl{font-size:12px;color:rgba(255,255,255,.4);margin-bottom:8px;}
.adv-phone{font-size:22px;font-weight:500;color:#c4a057;display:block;text-decoration:none;}
.footer{background:#0d1b2a;text-align:center;padding:32px 20px;color:rgba(255,255,255,.3);font-size:12px;margin-top:40px;}
.footer strong{color:#c4a057;}
</style>
</head>
<body>
<div class="hero"><div>
  <div class="h-badge">Voyage Vista Travels &nbsp;·&nbsp; ${t.theme||'Special Occasion'}</div>
  <div class="h1">Happy <em>${t.occasion}</em>,<br>${t.guestName}!</div>
  ${t.destination?`<div class="h-dest">✈ ${t.destination}</div>`:''}
  ${t.tripDesc?`<div style="color:rgba(255,255,255,.5);font-size:1rem;max-width:500px;margin:0 auto 24px;">${t.tripDesc}</div>`:''}
  <div class="h-stats">
    ${nights?`<div><div class="s-num">${nights}</div><div class="s-lbl">Nights</div></div>`:''}
    ${t.guestCount?`<div><div class="s-num">${t.guestCount}</div><div class="s-lbl">Guests</div></div>`:''}
    ${t.departDate?`<div><div class="s-num">${fmt(t.departDate)}</div><div class="s-lbl">Departure</div></div>`:''}
  </div>
  ${countdown!==null?`<div class="cd"><div class="cd-n">${countdown>0?countdown:'★'}</div><div class="cd-l">${countdown>0?'days to go!':countdown===0?'Today is the day!':'Trip in progress!'}</div></div>`:''}
</div></div>
${photos}${logistics}${itinerary}${pdfSec}${packSec}${currSec}${msgSec}${bookSec}${contactSec}
<footer class="footer">
  <strong>Voyage Vista Travels</strong> · Nepean, ON · (343) 961-3506 · hello@voyagevista.ca<br>
  Affiliated with Nexion Travel Group-Canada · TICO Reg: 1549342
</footer>
<script>function submitB(e){e.preventDefault();document.querySelector('.book-form form').style.display='none';document.getElementById('bsuccess').style.display='block';}</script>
</body></html>`;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Voyage Vista running on port ' + PORT + ', ROOT=' + ROOT));
