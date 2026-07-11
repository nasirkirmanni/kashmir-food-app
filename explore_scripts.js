<script>
const WW_IMG = {
  'hariparbat-dusk.jpg': "DATA_URI",
  'snow-jump.jpg': "DATA_URI",
  'misty-village.jpg': "DATA_URI",
  'dal-shikara-sunset.jpg': "DATA_URI",
  'cloudy-peaks.jpg': "DATA_URI",
  'hillside-village.jpg': "DATA_URI",
  'river-valley.jpg': "DATA_URI",
  'mustard-fields.jpg': "DATA_URI",
  'blue-valley.jpg': "DATA_URI",
  'red-jacket-hiker.jpg': "DATA_URI",
  'snow-bridge.jpg': "DATA_URI",
  'mtn-fog-deadtree.jpg': "DATA_URI"
};
</script>

<script>
const WW_PLACEHOLDER = "DATA_URI";
</script>

<script>
/* ---------- reveal on scroll ---------- */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
},{threshold:0.15});
revealEls.forEach(el=>io.observe(el));

/* ---------- hero typed prompt ---------- */
const prompts = [
  "5 friends · ₹3000 budget · hidden alpine lakes...",
  "Honeymoon in Gulmarg · 4 days · slow pace...",
  "Solo trip · photography · avoid the crowds...",
  "Family of 4 · easy trails · real wazwan food..."
];
const typedEl = document.getElementById('ai-typed');
let pIndex=0, cIndex=0, deleting=false;
function typeLoop(){
  const current = prompts[pIndex];
  if(!deleting){
    cIndex++;
    typedEl.textContent = current.slice(0,cIndex);
    if(cIndex===current.length){ deleting=true; setTimeout(typeLoop, 1800); return; }
  } else {
    cIndex--;
    typedEl.textContent = current.slice(0,cIndex);
    if(cIndex===0){ deleting=false; pIndex=(pIndex+1)%prompts.length; }
  }
  setTimeout(typeLoop, deleting?26:44);
}
typeLoop();
document.getElementById('hero-plan-btn').addEventListener('click', (e)=>{
  e.preventDefault();
  document.getElementById('waza').scrollIntoView({behavior:'smooth'});
});

/* ---------- parallax ---------- */
const parallaxEls = document.querySelectorAll('[data-parallax]');
function onScrollParallax(){
  const y = window.scrollY;
  parallaxEls.forEach(el=>{
    const speed = parseFloat(el.dataset.parallax);
    const rect = el.closest('section').getBoundingClientRect();
    const offset = (window.innerHeight - rect.top) * speed;
    el.style.transform = `translateY(${offset*0.15}px)`;
  });
}
window.addEventListener('scroll', ()=>requestAnimationFrame(onScrollParallax), {passive:true});

/* ---------- trail rail: progress + waypoints ---------- */
const trailRail = document.getElementById('trail-rail');
const trailPath = document.getElementById('trail-path');
const svgNS = "http://www.w3.org/2000/svg";
const progressPath = document.createElementNS(svgNS,'path');
progressPath.setAttribute('id','trail-progress');
progressPath.setAttribute('d', trailPath.getAttribute('d'));
trailRail.appendChild(progressPath);
const totalLen = trailPath.getTotalLength();
progressPath.style.strokeDasharray = totalLen;
progressPath.style.strokeDashoffset = totalLen;

const targets = document.querySelectorAll('.waypoint-target');
const waypointsWrap = document.createElement('div');
waypointsWrap.style.position='absolute'; waypointsWrap.style.top='0'; waypointsWrap.style.left='0'; waypointsWrap.style.width='1px';
document.body.appendChild(waypointsWrap);
const waypointEls = [];
targets.forEach((t,i)=>{
  const wp = document.createElement('div');
  wp.className='waypoint';
  wp.textContent = String(i+1).padStart(2,'0');
  waypointsWrap.appendChild(wp);
  waypointEls.push(wp);
});

function positionTrail(){
  const railTop = document.getElementById('hero').offsetHeight + 60;
  trailRail.style.top = railTop+'px';
  const railHeight = document.body.scrollHeight - railTop - 400;
  trailRail.setAttribute('height', railHeight);
  trailRail.style.height = railHeight+'px';
  trailRail.setAttribute('viewBox', `0 0 40 ${railHeight}`);
  const scaleY = railHeight/4000;
  const d = `M20,0 C20,${300*scaleY} 6,${350*scaleY} 20,${650*scaleY} C34,${950*scaleY} 6,${1000*scaleY} 20,${1350*scaleY} C34,${1700*scaleY} 6,${1750*scaleY} 20,${2100*scaleY} C34,${2450*scaleY} 6,${2500*scaleY} 20,${2850*scaleY} C34,${3200*scaleY} 6,${3250*scaleY} 20,${3600*scaleY} C30,${3800*scaleY} 20,${3900*scaleY} 20,${railHeight}`;
  trailPath.setAttribute('d', d);
  progressPath.setAttribute('d', d);
  const len = trailPath.getTotalLength();
  progressPath.style.strokeDasharray = len;
  progressPath.style.strokeDashoffset = len;

  targets.forEach((t,i)=>{
    const rect = t.getBoundingClientRect();
    const absTop = rect.top + window.scrollY + rect.height*0.15;
    const relY = Math.min(Math.max(absTop - railTop, 0), railHeight);
    const pt = trailPath.getPointAtLength((relY/railHeight)*len);
    waypointEls[i].style.top = (railTop + relY)+'px';
    waypointEls[i].style.left = (26 + (pt.x-20))+'px';
  });
}
function updateTrailProgress(){
  const railTop = document.getElementById('hero').offsetHeight + 60;
  const len = progressPath.getTotalLength();
  const railHeight = parseFloat(trailRail.style.height);
  const scrollRel = Math.min(Math.max((window.scrollY - railTop + window.innerHeight*0.5),0), railHeight);
  const ratio = railHeight? scrollRel/railHeight : 0;
  progressPath.style.strokeDashoffset = len - (len*ratio);

  targets.forEach((t,i)=>{
    const rect = t.getBoundingClientRect();
    const active = rect.top < window.innerHeight*0.6 && rect.bottom > window.innerHeight*0.2;
    waypointEls[i].classList.toggle('active', active);
  });
}
window.addEventListener('load', ()=>{ positionTrail(); updateTrailProgress(); });
window.addEventListener('resize', positionTrail);
window.addEventListener('scroll', ()=>requestAnimationFrame(updateTrailProgress), {passive:true});

/* ---------- filmstrip scroll buttons ---------- */
document.querySelectorAll('.fs-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const stripId = btn.dataset.strip==='photo' ? 'photo-strip' : 'gems-strip';
    const track = document.querySelector(`#${stripId} .filmstrip-track`);
    if(track) track.scrollBy({left: 340*parseInt(btn.dataset.dir), behavior:'smooth'});
  });
});
// fallback for gems strip buttons without data-strip
document.querySelectorAll('#gems-strip .fs-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelector('#gems-strip .filmstrip-track').scrollBy({left:340*parseInt(btn.dataset.dir), behavior:'smooth'});
  });
});

/* ---------- tilt cards ---------- */
document.querySelectorAll('.tilt-card').forEach(card=>{
  card.addEventListener('mousemove', (e)=>{
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left)/r.width - 0.5;
    const y = (e.clientY - r.top)/r.height - 0.5;
    card.style.transform = `perspective(1000px) rotateY(${x*6}deg) rotateX(${-y*6}deg) scale(1.01)`;
  });
  card.addEventListener('mouseleave', ()=>{ card.style.transform='perspective(1000px) rotateY(0) rotateX(0) scale(1)'; });
});

/* ---------- season switch ---------- */
const seasonData = {
  winter:{
    title:'Destinations that come<br>alive in <em>winter</em>.',
    cards:[
      {img: WW_PLACEHOLDER, tag:'Family', name:'Gulmarg', meta:'1–2 Days · High crowd'},
      {img: WW_PLACEHOLDER, tag:'Hidden Gem', name:'Doodhpathri', meta:'Half Day · Moderate'},
      {img: WW_PLACEHOLDER, tag:'Adventure', name:'Sonamarg', meta:'1 Day · Moderate'},
      {img: WW_PLACEHOLDER, tag:'Family', name:'Srinagar', meta:'2–3 Days · High crowd'},
      {img: WW_PLACEHOLDER, tag:'Hidden Gem', name:'Kokernag', meta:'Half Day · Moderate'},
    ]
  },
  summer:{
    title:'Destinations that come<br>alive in <em>summer</em>.',
    cards:[
      {img: WW_PLACEHOLDER, tag:'Family', name:'Pahalgam', meta:'1–2 Days · High crowd'},
      {img: WW_PLACEHOLDER, tag:'Hidden Gem', name:'Yusmarg', meta:'Half Day · Low crowd'},
      {img: WW_PLACEHOLDER, tag:'Adventure', name:'Betaab Valley', meta:'Half Day · High effort'},
      {img: WW_PLACEHOLDER, tag:'Family', name:'Kokernag', meta:'Half Day · Moderate'},
      {img: WW_PLACEHOLDER, tag:'Hidden Gem', name:'Daksum', meta:'2 Days · Low crowd'},
    ]
  }
};
function renderSeason(season){
  const data = seasonData[season];
  document.getElementById('season-title').innerHTML = data.title;
  const wrap = document.getElementById('season-cards');
  wrap.innerHTML = data.cards.map(c=>`
    <div class="fcard tilt-card"><img src="${c.img}"><div class="fcard-tag">${c.tag}</div><div class="fcard-copy"><h4>${c.name}</h4><span class="mono">${c.meta}</span></div></div>
  `).join('');
  wrap.querySelectorAll('.tilt-card').forEach(card=>{
    card.addEventListener('mousemove', (e)=>{
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left)/r.width - 0.5;
      const y = (e.clientY - r.top)/r.height - 0.5;
      card.style.transform = `perspective(1000px) rotateY(${x*6}deg) rotateX(${-y*6}deg) scale(1.01)`;
    });
    card.addEventListener('mouseleave', ()=>{ card.style.transform='perspective(1000px) rotateY(0) rotateX(0) scale(1)'; });
  });
  document.querySelectorAll('.season-bg').forEach(bg=>{
    bg.style.opacity = bg.dataset.season===season ? '1':'0';
  });
  document.querySelectorAll('.season-btn').forEach(b=> b.classList.toggle('active', b.dataset.season===season));
}
renderSeason('winter');
document.querySelectorAll('.season-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>renderSeason(btn.dataset.season));
});

/* ---------- waza ai typing reveal ---------- */
const wazaMsg = document.getElementById('waza-ai-msg');
const wazaIO = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      setTimeout(()=>{
        wazaMsg.innerHTML = '<p>Found it — <strong>Gurez Valley</strong> for the lake, camping under deodar for the budget, and a wazwan stop in Bandipora on the way back. Building your 3-day route now →</p>';
      }, 1600);
      wazaIO.unobserve(wazaMsg);
    }
  });
},{threshold:0.6});
wazaIO.observe(wazaMsg);
</script>

<script>
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('img[data-src]').forEach(function(img) {
    var key = img.getAttribute('data-src');
    if (WW_IMG[key]) img.src = WW_IMG[key];
  });
});
</script>