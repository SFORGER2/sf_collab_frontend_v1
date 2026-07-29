/* eslint-disable */
/**
 * SFCollab cinematic universe — the WebGL scene, scroll director, camera rig,
 * HUD, journey rail, vision-star picking and content fade for the landing page.
 *
 * The body of `boot()` below is the original design file's script, extracted
 * verbatim rather than rewritten, so the choreography stays exactly as authored.
 * It drives the DOM imperatively by id, which is why LandingCosmos.jsx renders
 * the markup as static HTML and lets this own the contents.
 *
 * Only three things are added around it:
 *   1. three.js comes from the npm package instead of a CDN <script>, with
 *      ColorManagement disabled so the palette matches the r128 original.
 *   2. addEventListener is recorded during boot so unmount can unbind cleanly —
 *      the original page never unmounted, an SPA route does.
 *   3. A teardown hook stops the animation loop and disposes the renderer.
 */
import * as THREE from 'three';

export function bootUniverse() {
  // r152+ converts sRGB inputs to linear by default, which would shift every
  // colour in the scene away from the design. The shaders here already work in
  // the original's colour space.
  THREE.ColorManagement.enabled = false;
  window.THREE = THREE;

  // Record listeners added during boot so they can all be removed on unmount.
  const bound = [];
  const targets = [window, document];
  if (window.visualViewport) targets.push(window.visualViewport);
  const originals = targets.map((t) => t.addEventListener);
  targets.forEach((t, i) => {
    t.addEventListener = function (type, handler, opts) {
      bound.push([t, type, handler, opts]);
      return originals[i].call(t, type, handler, opts);
    };
  });

  try {
    /* ================= BEGIN verbatim scene script ================= */
    window.SFC_CONFIG = {
      registerUrl: '/signup',
      loginUrl: '/login',
      visionsUrl: '/discover-startups',
      // First endpoint that responds with JSON wins. Expected: an array (or {visions|items|data:[...]})
      // of objects with any of: id, name|title, summary|description|tagline, founder|owner|author,
      // stage|status, roles|needed_roles|open_roles, signal|activity|supporters|score, url|slug.
      visionsEndpoints: ['/api/public/visions?limit=48', '/api/visions/public?limit=48', '/api/ideas/top?page=1&per_page=48', '/api/startups/top?page=1&per_page=48'],
      // Optional stats endpoint. Only keys present in the response are rendered — nothing is invented.
      statsEndpoints: ['/api/public/stats'],
      statLabels: {
        visions: 'Active Visions', users: 'Registered Users', startups: 'Startups',
        contributions: 'Contributions', countries: 'Countries', skills: 'Skills Available',
        tasks_completed: 'Completed Tasks', ai_assets: 'AI Assets Generated'
      },
      analyticsEndpoint: null,       // optional POST target for landing events
      maxStars: { high: 64, medium: 40, low: 22 },
      // Adjust statuses to match reality before shipping. Categories: live | dev | planned | future
      roadmap: {
        live:    { title: 'Available now',  items: ['Visions & discovery','Five profiles','AI startup creator (business plan, landing page, pitch deck, content)','SF Drive','SF Meet','Contributions, reputation & achievements','Wallet, rewards & referrals'] },
        dev:     { title: 'In development', items: ['Deeper contextual assistant workflows','Expanded meeting intelligence'] },
        planned: { title: 'Planned',        items: ['Expanded operating tools','New marketplace capabilities'] },
        future:  { title: 'Long-term vision', items: ['Full startup infrastructure layer','Persistent organizational intelligence'] }
      }
    };

    (function(){
    'use strict';
    var CFG = window.SFC_CONFIG;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isMobile = window.matchMedia('(max-width: 860px)').matches || ('ontouchstart' in window && screen.width < 900);

    /* ---------------- utils ---------------- */
    function lerp(a,b,t){return a+(b-a)*t}
    function clamp01(v){return v<0?0:v>1?1:v}
    function smooth(t){return t*t*(3-2*t)}
    function el(id){return document.getElementById(id)}
    function esc(s){var d=document.createElement('div');d.textContent=s==null?'':String(s);return d.innerHTML}

    /* ---------------- analytics ---------------- */
    function track(action, extra){
      try{
        var payload = Object.assign({event:'sfc_landing', action:action, ts:Date.now()}, extra||{});
        (window.dataLayer = window.dataLayer || []).push(payload);
        if (CFG.analyticsEndpoint && navigator.sendBeacon){
          navigator.sendBeacon(CFG.analyticsEndpoint, JSON.stringify(payload));
        }
      }catch(e){}
    }
    document.addEventListener('click', function(e){
      var t = e.target.closest('[data-track]');
      if (t) track(t.getAttribute('data-track'));
    });

    /* ---------------- nav + mobile menu ---------------- */
    var nav = el('nav'), navToggle = el('nav-toggle'), mobileMenu = el('mobile-menu');
    navToggle.addEventListener('click', function(){
      var open = mobileMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
      navToggle.textContent = open ? '✕' : '☰';
    });
    mobileMenu.addEventListener('click', function(e){
      if (e.target.tagName === 'A'){ mobileMenu.classList.remove('open'); navToggle.setAttribute('aria-expanded','false'); navToggle.textContent='☰'; }
    });

    /* ---------------- reveal observer ---------------- */
    var revealIO = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (en.isIntersecting) en.target.classList.add('in'); });
    },{threshold:0.25});
    document.querySelectorAll('.reveal').forEach(function(n){ revealIO.observe(n); });

    /* ---------------- mobile CTA bar ---------------- */
    var mobileCta = el('mobile-cta');
    var ctaShownAfter = null;
    window.addEventListener('scroll', function(){
      nav.classList.toggle('scrolled', window.scrollY > 20);
      if (!renderer) setRail(clamp01(window.scrollY/Math.max(1, document.documentElement.scrollHeight - window.innerHeight)));
      if (mobileCta){
        if (ctaShownAfter === null) ctaShownAfter = el('positioning').offsetTop;
        var nearEnd = window.scrollY + window.innerHeight > document.body.scrollHeight - 900;
        mobileCta.classList.toggle('show', window.scrollY > ctaShownAfter && !nearEnd);
      }
    },{passive:true});

    /* ---------------- generic tabs (profiles + how it works) ---------------- */
    function initTabs(container, onSelect){
      var tabs = Array.prototype.slice.call(container.querySelectorAll('[role="tab"]'));
      function select(tab){
        tabs.forEach(function(t){
          var on = t === tab;
          t.setAttribute('aria-selected', on);
          var pane = el(t.getAttribute('aria-controls'));
          if (pane) pane.classList.toggle('active', on);
        });
        if (onSelect) onSelect(tabs.indexOf(tab), tab);
      }
      tabs.forEach(function(t, i){
        t.addEventListener('click', function(){ select(t); });
        t.addEventListener('keydown', function(e){
          var d = e.key==='ArrowRight'?1 : e.key==='ArrowLeft'?-1 : 0;
          if (d){ e.preventDefault(); var n = tabs[(i+d+tabs.length)%tabs.length]; n.focus(); select(n); }
        });
      });
    }
    var PROFILE_COLORS = [0xffbf5e, 0x4fd8ff, 0x3ee6a0, 0xff4fd8, 0x8b6cff];
    var PROFILE_NAMES = ['founder','builder','mentor','influencer','investor'];
    var selectedProfile = 0;
    initTabs(document.querySelector('#profiles .profile-tabs'), function(i){
      selectedProfile = i;
      document.documentElement.style.setProperty('--accent', '#'+PROFILE_COLORS[i].toString(16).padStart(6,'0'));
      track('profile_selected', {profile: PROFILE_NAMES[i]});
    });
    initTabs(el('how-tabs'));

    /* ---------------- demo stepper ---------------- */
    (function(){
      var step = 1, steps = el('demo-steps').children;
      el('demo-next').addEventListener('click', function(){
        step = step % 3 + 1;
        for (var i=1;i<=3;i++){
          el('demo-pane-'+i).hidden = (i !== step);
          steps[i-1].classList.toggle('on', i === step);
        }
        track('demo_step', {step: step});
      });
    })();

    /* ---------------- roadmap render ---------------- */
    (function(){
      var grid = el('roadmap-grid');
      var order = ['live','dev','planned','future'];
      var html = order.map(function(k){
        var col = CFG.roadmap[k]; if (!col) return '';
        return '<div class="col"><span class="tag '+k+'">'+esc(col.title)+'</span><ul>'+
          col.items.map(function(it){return '<li>'+esc(it)+'</li>'}).join('')+'</ul></div>';
      }).join('');
      grid.innerHTML = html;
    })();

    /* ---------------- visions: skeleton, fetch, cards ---------------- */
    var visionData = [];      // normalized visions
    var visionStars = [];     // three.js sprites (filled by scene)
    var visionsSettled = null;
    var visionRow = el('vision-row');

    function renderSkeletons(n){
      var html = '';
      for (var i=0;i<n;i++){
        html += '<div class="vision-card skeleton" aria-hidden="true">'+
          '<div class="sk" style="height:20px;width:70%"></div>'+
          '<div class="sk" style="height:13px;width:100%"></div>'+
          '<div class="sk" style="height:13px;width:88%"></div>'+
          '<div class="sk" style="height:12px;width:50%;margin-top:auto"></div></div>';
      }
      visionRow.innerHTML = html;
    }
    renderSkeletons(5);

    function normalizeVision(v, i){
      var id = v.id != null ? v.id : (v.slug || i);
      var url = v.url || (CFG.visionsUrl.replace(/\/$/,'') + '/' + (v.slug || id));
      var roles = v.roles || v.needed_roles || v.open_roles || [];
      if (typeof roles === 'string') roles = roles.split(',').map(function(s){return s.trim()}).filter(Boolean);
      var signal = v.signal != null ? v.signal : (v.activity != null ? v.activity : (v.supporters != null ? v.supporters : v.score));
      return {
        id: id, url: url,
        name: v.name || v.title || 'Untitled Vision',
        summary: v.summary || v.description || v.tagline || '',
        founder: v.founder || v.owner || v.author || '',
        stage: v.stage || v.status || '',
        roles: roles,
        signal: (typeof signal === 'number') ? signal : null
      };
    }

    function renderVisionCards(){
      visionRow.innerHTML = visionData.map(function(v, i){
        var meta = [];
        if (v.stage) meta.push('<span>'+esc(v.stage)+'</span>');
        if (v.founder) meta.push('<span>by '+esc(v.founder)+'</span>');
        if (v.signal != null) meta.push('<span><b>'+esc(v.signal)+'</b> signals</span>');
        var roles = v.roles.length ? '<div class="v-meta">Looking for: '+esc(v.roles.slice(0,3).join(', '))+'</div>' : '';
        return '<article class="vision-card" data-vi="'+i+'" tabindex="0">'+
          '<div class="v-top"><h4>'+esc(v.name)+'</h4></div>'+
          (v.summary ? '<p class="v-desc">'+esc(v.summary)+'</p>' : '')+
          '<div class="v-meta">'+meta.join('')+'</div>'+ roles +
          '<a class="v-open" href="'+esc(v.url)+'" data-track="vision_opened">View this Vision →</a></article>';
      }).join('');
      visionRow.querySelectorAll('.vision-card').forEach(function(card){
        card.addEventListener('mouseenter', function(){ focusVision(+card.dataset.vi, false); });
        card.addEventListener('focus', function(){ focusVision(+card.dataset.vi, false); });
      });
    }

    function focusVision(i, scrollCard){
      visionRow.querySelectorAll('.vision-card').forEach(function(c){
        c.classList.toggle('focus', +c.dataset.vi === i);
      });
      if (scrollCard){
        var card = visionRow.querySelector('[data-vi="'+i+'"]');
        if (card) card.scrollIntoView({behavior: reduceMotion?'auto':'smooth', inline:'center', block:'nearest'});
      }
      visionStars.forEach(function(s, j){ s.userData.focused = (j === i); });
    }
    window.__sfcFocusVision = focusVision;

    function fetchFirst(urls){
      var chain = Promise.reject();
      urls.forEach(function(u){
        chain = chain.catch(function(){
          return fetch(u, {headers:{'Accept':'application/json'}}).then(function(r){
            if (!r.ok) throw new Error(r.status);
            return r.json();
          });
        });
      });
      return chain;
    }

    visionsSettled = fetchFirst(CFG.visionsEndpoints).then(function(json){
      var arr = Array.isArray(json) ? json : (json.visions || json.items || json.data || []);
      visionData = arr.slice(0, 48).map(normalizeVision);
      if (!visionData.length) throw new Error('empty');
      renderVisionCards();
      track('visions_loaded', {count: visionData.length});
      return true;
    }).catch(function(){
      visionRow.innerHTML = '';
      el('visions-fallback').classList.add('show');
      el('visions-hint').textContent = 'The stars behind this panel are ambient — open Vision Discovery to browse real projects.';
      return false;
    });

    /* ---------------- activity stats ---------------- */
    fetchFirst(CFG.statsEndpoints).then(function(stats){
      var grid = el('activity-grid'), html = '';
      Object.keys(CFG.statLabels).forEach(function(k){
        if (typeof stats[k] === 'number'){
          html += '<div class="stat"><b>'+stats[k].toLocaleString()+'</b><span>'+esc(CFG.statLabels[k])+'</span></div>';
        }
      });
      if (html){ grid.innerHTML = html; grid.hidden = false; el('activity-fallback').hidden = true; }
    }).catch(function(){ /* fallback text stays — no invented numbers */ });

    /* =========================================================================
       THE UNIVERSE — Three.js scene, scroll director, camera rig
       ========================================================================= */
    var scene, camera, renderer, quality, renderNeeded = true, running = true;
    var spark, sparkLight, bangPoints, bangMat, starField, visionGroup, asteroidMesh, routeMesh, routeIndexCount = 0;
    var netPoints, netLines, netNodes = [], profileGroup = [], planet, planetRing, orbiters = [], finaleSparks;
    var starMat, warpLines, warpData, comets = [], routeCurveRef, routePulse, routeShip, exhaustPts = null, exhaustData = null, nozzleV = null, trailV = null, trailLine = null, trailData = null, netPulses = [], planetGlow;
    var bangShocks = [], bangFlash, bangStreaks, bangStreakData, bangNebula = [], bangMat2, bangPoints2, bangCore, bangCoreCross, emberPts;
    var bangRays, bangRayMats = [], bangFlareH, bangFlareV, bangTwinks = [];
    var lastCamZ = null, travelDist = 0, velSmooth = 0, frameDt = 0.016, hudTick = 0, lastPhase = '', currentCam = 'spark';
    var holeGroup, accretionMat, photonRing, horizonMesh, infallPts, infallData;
    var cityGroup, cityMats = [], traffic = [], beams = [], beacon, planetsX = [];
    var segAName = '', segBName = '', segT = 0, fadeSecs = [], planetGateT = 0.1, camPosCurve = null, camLookCurve = null, riseMotes = null, riseData = null;
    var cityExtra = {scan:null, search:[], vert:[], roofPts:null, orbital:null, auroras:[], rails:[], trains:[], crystals:[], billMat:null, portal:null, threadPulses:[], visionStars:[], groundMat:null, domeMat:null};
    var CH = { bang:0, route:0, net:0, planet:0, finale:0, star:1, warp:0, hud:0, hole:0, city:0 }; // scroll-driven channels
    var timeline = [], progress = 0, targetProgress = 0, clock = null, raycaster, pointer, hoveredStar = null;

    function detectQuality(){
      if (isMobile) return 'low';
      var dpr = window.devicePixelRatio || 1;
      var cores = navigator.hardwareConcurrency || 4;
      if (cores >= 8 && dpr <= 2.5) return 'high';
      return 'medium';
    }

    function glowTexture(hex){
      var c = document.createElement('canvas'); c.width = c.height = 64;
      var g = c.getContext('2d');
      var grad = g.createRadialGradient(32,32,0,32,32,32);
      var col = '#'+hex.toString(16).padStart(6,'0');
      grad.addColorStop(0,'#ffffff'); grad.addColorStop(0.25,col); grad.addColorStop(1,'rgba(0,0,0,0)');
      g.fillStyle = grad; g.fillRect(0,0,64,64);
      var tex = new THREE.CanvasTexture(c); return tex;
    }


    function sparkleTexture(hex){
      var c = document.createElement('canvas'); c.width = c.height = 128;
      var g = c.getContext('2d');
      var col = '#'+hex.toString(16).padStart(6,'0');
      g.globalCompositeOperation = 'lighter';
      var core = g.createRadialGradient(64,64,0,64,64,20);
      core.addColorStop(0,'rgba(255,255,255,1)'); core.addColorStop(0.35,col); core.addColorStop(1,'rgba(0,0,0,0)');
      g.fillStyle = core; g.fillRect(0,0,128,128);
      function flare(len, wid, rot, alpha){
        g.save(); g.translate(64,64); g.rotate(rot);
        var fg = g.createLinearGradient(0,-len,0,len);
        fg.addColorStop(0,'rgba(0,0,0,0)'); fg.addColorStop(0.5, col); fg.addColorStop(1,'rgba(0,0,0,0)');
        g.globalAlpha = alpha; g.fillStyle = fg;
        g.beginPath();
        g.moveTo(0,-len); g.quadraticCurveTo(wid,0,0,len); g.quadraticCurveTo(-wid,0,0,-len);
        g.fill(); g.restore();
      }
      flare(58, 3.2, 0, 0.95);
      flare(58, 3.2, Math.PI/2, 0.95);
      flare(30, 2.0, Math.PI/4, 0.5);
      flare(30, 2.0, -Math.PI/4, 0.5);
      g.globalAlpha = 0.45;
      var halo = g.createRadialGradient(64,64,16,64,64,34);
      halo.addColorStop(0,'rgba(0,0,0,0)'); halo.addColorStop(0.8, col); halo.addColorStop(1,'rgba(0,0,0,0)');
      g.fillStyle = halo; g.beginPath(); g.arc(64,64,34,0,Math.PI*2); g.fill();
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      return new THREE.CanvasTexture(c);
    }

    function initScene(){
      var canvas = el('universe');
      try{
        renderer = new THREE.WebGLRenderer({canvas:canvas, antialias: quality!=='low', alpha:false, powerPreference:'high-performance'});
      }catch(e){ return false; }
      if (!renderer.getContext()) return false;
      var caps = {high:2, medium:1.5, low:1.15};
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, caps[quality]));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x050309, 1);

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x050309, 0.0030);
      camera = new THREE.PerspectiveCamera(62, window.innerWidth/window.innerHeight, 0.1, 2200);
      camera.position.set(0,0,26);

      scene.add(new THREE.AmbientLight(0x8b8bff, 0.35));
      var dir = new THREE.DirectionalLight(0xbfd4ff, 0.5); dir.position.set(3,6,2); scene.add(dir);

      /* --- background starfield: round, twinkling, size-varied stars --- */
      var starCounts = {high:7000, medium:3600, low:1500};
      var n = starCounts[quality];
      var pos = new Float32Array(n*3), col = new Float32Array(n*3), szs = new Float32Array(n), tws = new Float32Array(n);
      var palette = [0xf2effa, 0xcfd8ff, 0x8b6cff, 0x4fd8ff, 0xffbf5e, 0xff4fd8];
      var c = new THREE.Color();
      for (var i=0;i<n;i++){
        pos[i*3]   = (Math.random()-0.5)*950;
        pos[i*3+1] = (Math.random()-0.5)*540;
        pos[i*3+2] = 60 - Math.random()*1780;
        c.setHex(palette[Math.random()<0.7 ? (Math.random()<0.5?0:1) : 2+Math.floor(Math.random()*4)]);
        var b = 0.4 + Math.random()*0.6;
        col[i*3]=c.r*b; col[i*3+1]=c.g*b; col[i*3+2]=c.b*b;
        szs[i] = Math.pow(Math.random(),2.2)*3.4 + 0.8;
        tws[i] = Math.random()*Math.PI*2;
      }
      var sg = new THREE.BufferGeometry();
      sg.setAttribute('position', new THREE.BufferAttribute(pos,3));
      sg.setAttribute('aColor', new THREE.BufferAttribute(col,3));
      sg.setAttribute('aSize', new THREE.BufferAttribute(szs,1));
      sg.setAttribute('aTw', new THREE.BufferAttribute(tws,1));
      starMat = new THREE.ShaderMaterial({
        uniforms:{uTime:{value:0}, uOpacity:{value:0.9}, uWave:{value:0}, uWaveAmp:{value:0}, uPx:{value:renderer.getPixelRatio()}},
        transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
        vertexShader:
          'attribute vec3 aColor; attribute float aSize; attribute float aTw;'+
          'uniform float uTime; uniform float uPx; varying vec3 vColor; varying float vTw; varying float vDist;'+
          'void main(){'+
          '  vColor = aColor;'+
          '  vDist = length(position);'+
          '  float tw = 0.72 + 0.28*sin(uTime*(0.5+fract(aTw)*1.8) + aTw*7.0); vTw = tw;'+
          '  vec4 mv = modelViewMatrix * vec4(position,1.0);'+
          '  gl_PointSize = aSize * tw * uPx * (300.0/max(1.0,-mv.z));'+
          '  gl_Position = projectionMatrix*mv;}',
        fragmentShader:
          'uniform float uOpacity; uniform float uWave; uniform float uWaveAmp; varying vec3 vColor; varying float vTw; varying float vDist;'+
          'void main(){'+
          '  vec2 uv = gl_PointCoord-0.5; float d = length(uv);'+
          '  float core = smoothstep(0.5,0.02,d);'+
          '  float halo = smoothstep(0.5,0.16,d)*0.35;'+
          '  float wv = exp(-pow((vDist - uWave)/70.0, 2.0)) * uWaveAmp;'+
          '  float a = (core+halo)*uOpacity*vTw + wv*core*0.9;'+
          '  if(a<0.012) discard;'+
          '  gl_FragColor = vec4(vColor*(1.0+core*0.7+wv*2.2), a);}'
      });
      starField = new THREE.Points(sg, starMat);
      scene.add(starField);

      /* --- deep nebulae: vast slow-breathing color fields --- */
      var nebCols = [0x8b6cff,0x4fd8ff,0xff4fd8,0xffbf5e,0x3ee6a0,0x8b6cff,0x4fd8ff,0xff4fd8];
      for (i=0;i<(quality==='low'?4:8);i++){
        var nb = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(nebCols[i]), transparent:true,
          opacity:0.08+Math.random()*0.07, blending:THREE.AdditiveBlending, depthWrite:false}));
        nb.scale.set(260+Math.random()*300, 180+Math.random()*210, 1);
        nb.position.set((Math.random()-0.5)*720, (Math.random()-0.5)*340, -120 - Math.random()*1520);
        scene.add(nb);
      }


      /* --- the spark --- */
      spark = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(0xffbf5e), color:0xffffff, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false}));
      spark.scale.set(2.4,2.4,1);
      scene.add(spark);
      sparkLight = new THREE.PointLight(0xffbf5e, 1.4, 120); scene.add(sparkLight);

      /* --- big bang particle burst (shader points) --- */
      var bn = {high:4200, medium:2400, low:1000}[quality];
      var dirs = new Float32Array(bn*3), spd = new Float32Array(bn), seeds = new Float32Array(bn);
      var v = new THREE.Vector3();
      for (i=0;i<bn;i++){
        v.set(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1).normalize();
        dirs[i*3]=v.x; dirs[i*3+1]=v.y; dirs[i*3+2]=v.z;
        spd[i] = 0.25 + Math.pow(Math.random(),1.6)*0.75;
        seeds[i] = Math.random();
      }
      var bg = new THREE.BufferGeometry();
      bg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(bn*3),3));
      bg.setAttribute('aDir', new THREE.BufferAttribute(dirs,3));
      bg.setAttribute('aSpd', new THREE.BufferAttribute(spd,1));
      bg.setAttribute('aSeed', new THREE.BufferAttribute(seeds,1));
      bangMat = new THREE.ShaderMaterial({
        uniforms:{ uP:{value:0}, uShell:{value:0}, uSpin:{value:0}, uTime:{value:0}, uPx:{value:renderer.getPixelRatio()} },
        transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
        vertexShader:
          'attribute vec3 aDir; attribute float aSpd; attribute float aSeed;'+
          'uniform float uP; uniform float uShell; uniform float uSpin; uniform float uTime; uniform float uPx;'+
          'varying float vFade; varying float vSeed; varying float vR;'+
          'void main(){'+
          '  float sp = uP * aSpd;'+
          '  float r = sp * 150.0;'+
          '  vec3 d = aDir;'+
          '  float disc = smoothstep(0.12, 0.8, uP) * (0.55 + uShell*0.25);'+
          '  d.y *= (1.0 - disc*0.74);'+
          '  float tw = (1.9 + uShell*1.5) * sp * (1.0 + aSeed*0.35) + uSpin*(0.4 + sp);'+
          '  float cs = cos(tw), sn = sin(tw);'+
          '  vec3 p = vec3(d.x*cs - d.z*sn, d.y, d.x*sn + d.z*cs) * r;'+
          '  p.x += sin(uTime*0.5 + aSeed*43.0 + r*0.15) * uP * (2.6 + uShell*2.0);'+
          '  p.y += cos(uTime*0.42 + aSeed*31.0 + r*0.11) * uP * (1.9 + uShell*1.5);'+
          '  p.z += sin(uTime*0.36 + aSeed*57.0 - r*0.13) * uP * (2.3 + uShell*1.8);'+
          '  vFade = 1.0 - smoothstep(0.62, 1.06, uP*aSpd);'+
          '  vSeed = aSeed; vR = sp;'+
          '  vec4 mv = modelViewMatrix * vec4(p, 1.0);'+
          '  float sz = (2.2 + aSeed*3.6) * (1.0 - uShell*0.45);'+
          '  gl_PointSize = sz * uPx * (60.0 / max(1.0, -mv.z));'+
          '  gl_Position = projectionMatrix * mv;}',
        fragmentShader:
          'uniform float uP; uniform float uShell; varying float vFade; varying float vSeed; varying float vR;'+
          'void main(){'+
          '  vec2 uv = gl_PointCoord - 0.5; float d = length(uv);'+
          '  float a = smoothstep(0.5, 0.0, d) * vFade * smoothstep(0.02, 0.10, vR) * 0.82;'+
          '  vec3 core = vec3(1.0,0.96,0.86);'+
          '  vec3 gold = vec3(1.0,0.74,0.35);'+
          '  vec3 violet = vec3(0.55,0.36,1.0);'+
          '  vec3 cyan = vec3(0.35,0.85,1.0);'+
          '  vec3 rose = vec3(1.0,0.40,0.80);'+
          '  vec3 col = mix(gold, violet, smoothstep(0.25, 0.7, vR));'+
          '  col = mix(col, mix(cyan, rose, step(0.8, vSeed)), smoothstep(0.65, 1.0, vR)*0.85);'+
          '  col = mix(core, col, min(1.0, smoothstep(0.04, 0.35, vR) + uShell*0.5));'+
          '  float boost = 1.0 + (1.0 - vR)*0.55;'+
          '  gl_FragColor = vec4(col * boost * (1.0 - uShell*0.2), a);}'
      });
      
    bangPoints = new THREE.Points(bg, bangMat);
      bangPoints.visible = false;
      scene.add(bangPoints);
      bangMat2 = bangMat.clone();
      bangMat2.uniforms.uShell.value = 1;
      bangPoints2 = new THREE.Points(bg, bangMat2);
      bangPoints2.visible = false;
      scene.add(bangPoints2);
      bangCore = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(0xffe9c8), transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
      scene.add(bangCore);
      bangCoreCross = new THREE.Sprite(new THREE.SpriteMaterial({map:sparkleTexture(0xffd9a0), transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
      scene.add(bangCoreCross);
      var emN = {high:220, medium:130, low:60}[quality];
      var epos2 = new Float32Array(emN*3);
      for (i=0;i<emN;i++){
        v.set(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1).normalize()
          .multiplyScalar(24 + Math.pow(Math.random(),1.5)*72);
        epos2[i*3]=v.x; epos2[i*3+1]=v.y; epos2[i*3+2]=v.z;
      }
      var emg = new THREE.BufferGeometry(); emg.setAttribute('position', new THREE.BufferAttribute(epos2,3));
      emberPts = new THREE.Points(emg, new THREE.PointsMaterial({map:glowTexture(0xffb060), size:2.2, color:0xffffff, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true}));
      scene.add(emberPts);

      /* god-ray starburst at the moment of creation */
      bangRays = new THREE.Group();
      var rayC = document.createElement('canvas'); rayC.width = 16; rayC.height = 128;
      var rg2 = rayC.getContext('2d');
      var rGrad = rg2.createLinearGradient(0,0,0,128);
      rGrad.addColorStop(0,'rgba(255,220,160,0)'); rGrad.addColorStop(0.5,'rgba(255,242,214,0.95)'); rGrad.addColorStop(1,'rgba(255,220,160,0)');
      rg2.fillStyle = rGrad; rg2.fillRect(0,0,16,128);
      var rayTex = new THREE.CanvasTexture(rayC);
      for (i=0;i<12;i++){
        var rm = new THREE.MeshBasicMaterial({map:rayTex, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide});
        var ray = new THREE.Mesh(new THREE.PlaneGeometry(1,1), rm);
        ray.scale.set(1.6 + Math.random()*2.0, 95 + Math.random()*130, 1);
        ray.rotation.z = (i/12)*Math.PI*2 + Math.random()*0.22;
        bangRays.add(ray); bangRayMats.push(rm);
      }
      scene.add(bangRays);
      bangFlareH = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(0xcfeaff), transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
      scene.add(bangFlareH);
      bangFlareV = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(0xffd9a0), transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
      scene.add(bangFlareV);
      for (i=0;i<8;i++){
        var twk = new THREE.Sprite(new THREE.SpriteMaterial({map:sparkleTexture([0xffd9a0,0x9fdcff,0xc9b4ff][i%3]), transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
        var ta2 = Math.random()*Math.PI*2, tr2 = 22 + Math.random()*70;
        twk.position.set(Math.cos(ta2)*tr2, (Math.random()-0.5)*tr2*0.5, Math.sin(ta2)*tr2);
        twk.userData = {ph: Math.random()*Math.PI*2, s: 1.8 + Math.random()*1.8};
        scene.add(twk); bangTwinks.push(twk);
      }

      /* --- vision stars field (real data attaches after fetch) --- */
      visionGroup = new THREE.Group();
      visionGroup.position.set(0,0,-205);
      scene.add(visionGroup);

      /* --- asteroid field --- */
      var an = {high:130, medium:70, low:28}[quality];
      var ag = new THREE.IcosahedronGeometry(1, 0);
      asteroidMesh = new THREE.InstancedMesh(ag, new THREE.MeshStandardMaterial({color:0x2b2440, roughness:0.95, metalness:0.25, flatShading:true}), an);
      var m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), e = new THREE.Euler();
      for (i=0;i<an;i++){
        var az = -320 - Math.random()*280;
        var ax = (Math.random()-0.5)*90; if (Math.abs(ax)<7) ax += ax<0?-9:9;   // keep a corridor open
        var ay = (Math.random()-0.5)*46;
        e.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
        q.setFromEuler(e);
        var sc = 0.9 + Math.random()*3.6; s.set(sc, sc*(0.7+Math.random()*0.6), sc);
        m.compose(new THREE.Vector3(ax,ay,az), q, s);
        asteroidMesh.setMatrixAt(i, m);
      }
      scene.add(asteroidMesh);

      /* --- the golden route: the connected thread through the obstacles --- */
      var routeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0,-2,-300), new THREE.Vector3(4,1,-370), new THREE.Vector3(-4,-1,-440),
        new THREE.Vector3(3,2,-510), new THREE.Vector3(-2,0,-580), new THREE.Vector3(0,0,-655)
      ]);
      var tube = new THREE.TubeGeometry(routeCurve, 140, 0.28, 6, false);
      routeIndexCount = tube.index.count;
      routeMesh = new THREE.Mesh(tube, new THREE.MeshBasicMaterial({color:0xffbf5e, transparent:true, opacity:0.85, blending:THREE.AdditiveBlending, depthWrite:false}));
      routeMesh.geometry.setDrawRange(0,0);
      scene.add(routeMesh);

      /* --- intelligence network --- */
      var nn = {high:46, medium:34, low:20}[quality];
      var npos = new Float32Array(nn*3);
      for (i=0;i<nn;i++){
        v.set(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1).normalize().multiplyScalar(14+Math.random()*44);
        npos[i*3]=v.x; npos[i*3+1]=v.y*0.7; npos[i*3+2]=v.z*0.8 - 700;
        netNodes.push(new THREE.Vector3(npos[i*3], npos[i*3+1], npos[i*3+2]));
      }
      var ng = new THREE.BufferGeometry(); ng.setAttribute('position', new THREE.BufferAttribute(npos,3));
      netPoints = new THREE.Points(ng, new THREE.PointsMaterial({map:glowTexture(0xb9a6ff), size:3.4, color:0xffffff, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true}));
      scene.add(netPoints);
      var edges = [];
      for (i=0;i<nn;i++){
        for (var j=i+1;j<nn;j++){
          if (netNodes[i].distanceTo(netNodes[j]) < 26 && Math.random()<0.6) edges.push(i,j);
        }
      }
      var epos = new Float32Array(edges.length*3);
      for (i=0;i<edges.length;i++){
        epos[i*3]=netNodes[edges[i]].x; epos[i*3+1]=netNodes[edges[i]].y; epos[i*3+2]=netNodes[edges[i]].z;
      }
      var eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.BufferAttribute(epos,3));
      netLines = new THREE.LineSegments(eg, new THREE.LineBasicMaterial({color:0x8b6cff, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
      scene.add(netLines);
      for (i=0;i<3;i++){
        var npx = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(i===1?0x4fd8ff:0xffbf5e), transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
        npx.scale.set(3.6,3.6,1); npx.userData.off = 0.13 + i*0.31;
        scene.add(npx); netPulses.push(npx);
      }

      /* --- five profile energies --- */
      for (i=0;i<5;i++){
        var ps = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(PROFILE_COLORS[i]), transparent:true, opacity:0.95, blending:THREE.AdditiveBlending, depthWrite:false}));
        ps.scale.set(7,7,1);
        ps.userData.phase = i/5 * Math.PI*2;
        scene.add(ps); profileGroup.push(ps);
      }

      /* --- the startup world (vision → startup transformation) --- */
      planet = new THREE.Mesh(new THREE.SphereGeometry(20, quality==='low'?28:52, quality==='low'?20:40),
        planetMaterial(0x8b7bff, 0x241a66, 0x4fd8ff, 0.42));
      planet.position.set(0,0,-1000); planet.scale.setScalar(0.001); scene.add(planet);
      planetRing = new THREE.Mesh(new THREE.RingGeometry(26, 33, 64),
        new THREE.MeshBasicMaterial({color:0x8b6cff, transparent:true, opacity:0.3, side:THREE.DoubleSide, blending:THREE.AdditiveBlending, depthWrite:false}));
      planetRing.position.copy(planet.position); planetRing.rotation.x = Math.PI/2.4; planetRing.scale.setScalar(0.001);
      scene.add(planetRing);
      var planetLight = new THREE.PointLight(0x8b6cff, 1.2, 260); planetLight.position.set(30,20,-960); scene.add(planetLight);
      for (i=0;i<10;i++){
        var ob = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(i%2?0x4fd8ff:0xffbf5e), transparent:true, opacity:0.9, blending:THREE.AdditiveBlending, depthWrite:false}));
        ob.scale.set(2.2,2.2,1); ob.userData.a = Math.random()*Math.PI*2; ob.userData.r = 30+Math.random()*18; ob.userData.s = 0.2+Math.random()*0.3;
        scene.add(ob); orbiters.push(ob);
      }

      /* --- finale spark cloud: countless other ideas --- */
      var fn = {high:900, medium:520, low:240}[quality];
      var fpos = new Float32Array(fn*3);
      for (i=0;i<fn;i++){
        fpos[i*3]=(Math.random()-0.5)*680; fpos[i*3+1]=(Math.random()-0.5)*230; fpos[i*3+2]=(Math.random()-0.5)*640;
      }
      var fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(fpos,3));
      finaleSparks = new THREE.Points(fg, new THREE.PointsMaterial({map:glowTexture(0xffbf5e), size:3.4, color:0xffffff, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true}));
      finaleSparks.position.set(0, 150, -2280);
      scene.add(finaleSparks);


      /* --- big bang: flash, shockwaves, filament streaks, nebula bloom --- */
      bangFlash = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(0xffd9a0), transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
      bangFlash.scale.setScalar(30); scene.add(bangFlash);
      function shockMaterial(hex){
        return new THREE.ShaderMaterial({
          uniforms:{uOp:{value:0}, uTime:{value:0}, uCol:{value:new THREE.Color(hex)}},
          transparent:true, depthWrite:false, side:THREE.FrontSide, blending:THREE.AdditiveBlending,
          vertexShader:
            'varying vec3 vN; varying vec3 vW;'+
            'void main(){ vN = normalize(mat3(modelMatrix)*normal);'+
            ' vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz;'+
            ' gl_Position = projectionMatrix*viewMatrix*w; }',
          fragmentShader:
            'uniform float uOp; uniform float uTime; uniform vec3 uCol; varying vec3 vN; varying vec3 vW;'+
            'void main(){'+
            ' vec3 V = normalize(cameraPosition - vW);'+
            ' float d = 1.0 - abs(dot(normalize(vN), V));'+
            ' float rim = pow(d, 3.0);'+
            ' rim *= 0.82 + 0.18*sin(vW.x*0.05 + uTime*2.0)*sin(vW.y*0.07 - uTime*1.6);'+
            ' vec3 col = mix(uCol, vec3(1.0,0.98,0.94), pow(d, 6.0)*0.8);'+
            ' gl_FragColor = vec4(col*(1.1 + rim), rim*uOp);}'
        });
      }
      for (i=0;i<5;i++){
        var shock = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28),
          shockMaterial([0xffbf5e,0x8b6cff,0x4fd8ff,0xff4fd8,0x3ee6a0][i]));
        shock.scale.setScalar(0.001); scene.add(shock); bangShocks.push(shock);
      }
      var stN = {high:320, medium:180, low:80}[quality];
      bangStreakData = {count:stN, dir:new Float32Array(stN*3), spd:new Float32Array(stN), len:new Float32Array(stN)};
      for (i=0;i<stN;i++){
        v.set(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1).normalize();
        bangStreakData.dir[i*3]=v.x; bangStreakData.dir[i*3+1]=v.y; bangStreakData.dir[i*3+2]=v.z;
        bangStreakData.spd[i] = 0.3 + Math.pow(Math.random(),1.4)*0.7;
        bangStreakData.len[i] = 0.5 + Math.random();
      }
      var stg = new THREE.BufferGeometry();
      stg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(stN*6),3));
      bangStreaks = new THREE.LineSegments(stg, new THREE.LineBasicMaterial({color:0xffd9a0, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
      bangStreaks.visible = false; scene.add(bangStreaks);
      var nebPal = [0xffbf5e,0x8b6cff,0x4fd8ff,0xff4fd8,0xffbf5e,0x8b6cff,0x3ee6a0];
      for (i=0;i<7;i++){
        var bnx = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(nebPal[i]), transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
        bnx.userData = {op:0.06+Math.random()*0.06, sc:95+Math.random()*120};
        bnx.position.set((Math.random()-0.5)*64,(Math.random()-0.5)*38,(Math.random()-0.5)*54);
        scene.add(bnx); bangNebula.push(bnx);
      }

      /* --- the pathfinder: a ship draws the golden route through the obstacles --- */
      routeCurveRef = routeCurve;
      routeShip = new THREE.Group();
      var hullMat = new THREE.MeshStandardMaterial({color:0x232a44, roughness:0.3, metalness:0.9, emissive:0x10142a, emissiveIntensity:0.6});
      var goldTrim = new THREE.MeshBasicMaterial({color:0xffbf5e, transparent:true, opacity:0.95, blending:THREE.AdditiveBlending, depthWrite:false});
      var cyanTrim = new THREE.MeshBasicMaterial({color:0x4fd8ff, transparent:true, opacity:0.9, blending:THREE.AdditiveBlending, depthWrite:false});
      var fus = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.44, 2.7, 14), hullMat);
      fus.rotation.x = Math.PI/2; routeShip.add(fus);
      var nose = new THREE.Mesh(new THREE.ConeGeometry(0.30, 1.2, 14), hullMat);
      nose.rotation.x = Math.PI/2; nose.position.z = 1.95; routeShip.add(nose);
      var canopy = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12),
        new THREE.MeshStandardMaterial({color:0x0b1626, roughness:0.08, metalness:0.4, emissive:0x0e2f4a, emissiveIntensity:0.85}));
      canopy.scale.set(1, 0.6, 1.5); canopy.position.set(0, 0.3, 0.72); routeShip.add(canopy);
      function buildWing(sgn){
        var w = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.78), hullMat);
        w.position.set(sgn*0.98, -0.05, -0.5); w.rotation.y = sgn*-0.42;
        routeShip.add(w);
        var edge = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.05, 0.06), cyanTrim.clone());
        edge.position.set(sgn*0.98, -0.02, -0.14); edge.rotation.y = sgn*-0.42;
        routeShip.add(edge);
        var fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 0.4), hullMat);
        fin.position.set(sgn*1.68, 0.1, -0.78); fin.rotation.y = sgn*-0.42;
        routeShip.add(fin);
        var tip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.34), goldTrim.clone());
        tip.position.set(sgn*1.7, 0.26, -0.78); tip.rotation.y = sgn*-0.42;
        routeShip.add(tip);
      }
      buildWing(1); buildWing(-1);
      var tailF = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.72, 0.62), hullMat);
      tailF.position.set(0, 0.45, -1.05); routeShip.add(tailF);
      var tailTip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.6), goldTrim.clone());
      tailTip.position.set(0, 0.84, -1.05); routeShip.add(tailTip);
      var dorsal = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 2.4), goldTrim.clone());
      dorsal.position.set(0, 0.34, 0.1); routeShip.add(dorsal);
      for (var ni=0; ni<2; ni++){
        var sgn2 = ni ? 1 : -1;
        var nac = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.19, 1.05, 10), hullMat);
        nac.rotation.x = Math.PI/2; nac.position.set(sgn2*0.55, -0.14, -0.95);
        routeShip.add(nac);
        var engRing = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.05, 8, 20), goldTrim.clone());
        engRing.position.set(sgn2*0.55, -0.14, -1.5); routeShip.add(engRing);
        var engGlow = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(0xffbf5e), transparent:true, opacity:0.9, blending:THREE.AdditiveBlending, depthWrite:false}));
        engGlow.position.set(sgn2*0.55, -0.14, -1.74); engGlow.scale.set(0.8, 0.8, 1);
        routeShip.add(engGlow);
      }
      routePulse = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(0xffbf5e), transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
      routePulse.position.set(0, -0.05, -2.1); routePulse.scale.set(2.0, 2.0, 1);
      routeShip.add(routePulse);
      routeShip.scale.setScalar(1.7);
      routeShip.visible = false;
      scene.add(routeShip);
      nozzleV = new THREE.Vector3();
      trailV = new THREE.Vector3();
      var exN = {high:220, medium:140, low:70}[quality];
      exhaustData = {n:exN, pos:new Float32Array(exN*3), vel:new Float32Array(exN*3),
        life:new Float32Array(exN), max:new Float32Array(exN), col:new Float32Array(exN*3), cursor:0};
      var exG = new THREE.BufferGeometry();
      exG.setAttribute('position', new THREE.BufferAttribute(exhaustData.pos, 3));
      exG.setAttribute('color', new THREE.BufferAttribute(exhaustData.col, 3));
      exhaustPts = new THREE.Points(exG, new THREE.PointsMaterial({map:glowTexture(0xffc37a), size:2.7, vertexColors:true,
        transparent:true, opacity:1, blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true}));
      exhaustPts.material.size = 3.3;
      exhaustPts.frustumCulled = false;
      scene.add(exhaustPts);
      var tN = 46;
      var tpos = new Float32Array(tN*3), tcol = new Float32Array(tN*3);
      for (i=0;i<tN;i++){
        var tfade = 1 - i/tN;
        tcol[i*3] = tfade; tcol[i*3+1] = 0.72*tfade; tcol[i*3+2] = 0.3*tfade*tfade;
      }
      var tg2 = new THREE.BufferGeometry();
      tg2.setAttribute('position', new THREE.BufferAttribute(tpos, 3));
      tg2.setAttribute('color', new THREE.BufferAttribute(tcol, 3));
      trailLine = new THREE.Line(tg2, new THREE.LineBasicMaterial({vertexColors:true, transparent:true, opacity:0.9, blending:THREE.AdditiveBlending, depthWrite:false}));
      trailLine.frustumCulled = false; trailLine.visible = false;
      scene.add(trailLine);
      trailData = {n:tN, pos:tpos, init:false};

      /* --- planet atmosphere glow --- */
      planetGlow = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(0x8b6cff), transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
      planetGlow.position.copy(planet.position); scene.add(planetGlow);

      /* --- warp streaks parented to the camera --- */
      scene.add(camera);
      var wn = {high:260, medium:150, low:70}[quality];
      warpData = {n:wn, x:new Float32Array(wn), y:new Float32Array(wn), z:new Float32Array(wn), l:new Float32Array(wn)};
      for (i=0;i<wn;i++){
        var wr = 3 + Math.pow(Math.random(),0.6)*26, wa = Math.random()*Math.PI*2;
        warpData.x[i] = Math.cos(wa)*wr; warpData.y[i] = Math.sin(wa)*wr*0.6;
        warpData.z[i] = -Math.random()*80; warpData.l[i] = 0.4 + Math.random()*1.2;
      }
      var wg = new THREE.BufferGeometry();
      wg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(wn*6),3));
      warpLines = new THREE.LineSegments(wg, new THREE.LineBasicMaterial({color:0xaee4ff, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
      warpLines.frustumCulled = false;
      camera.add(warpLines);

      /* --- comet pool: rare travellers --- */
      for (i=0;i<3;i++){
        var cmx = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(0xdff2ff), transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
        cmx.scale.set(16,1.5,1); cmx.userData = {life:0, max:1, vel:new THREE.Vector3()};
        scene.add(cmx); comets.push(cmx);
      }


      /* --- cinematic planets: shader surfaces, fresnel atmospheres, rings, moons --- */
      function planetMaterial(cA, cB, cC, freq){
        return new THREE.ShaderMaterial({
          uniforms:{uTime:{value:0}, uA:{value:new THREE.Color(cA)}, uB:{value:new THREE.Color(cB)},
            uC:{value:new THREE.Color(cC)}, uFreq:{value:freq}, uLight:{value:new THREE.Vector3(0.45,0.35,0.85).normalize()}},
          vertexShader:
            'varying vec3 vN; varying vec3 vP; varying vec3 vW;'+
            'void main(){ vN = normalize(mat3(modelMatrix)*normal); vP = position;'+
            ' vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz;'+
            ' gl_Position = projectionMatrix*viewMatrix*w; }',
          fragmentShader:
            'uniform vec3 uA,uB,uC; uniform float uFreq,uTime; uniform vec3 uLight;'+
            'varying vec3 vN; varying vec3 vP; varying vec3 vW;'+
            'float hash(vec3 q){ return fract(sin(dot(q, vec3(12.9898,78.233,37.719)))*43758.5453); }'+
            'float vnoise(vec3 q){ vec3 f = floor(q); vec3 r = fract(q); r = r*r*(3.0-2.0*r);'+
            ' float a = hash(f), b = hash(f+vec3(1,0,0)), c = hash(f+vec3(0,1,0)), d = hash(f+vec3(1,1,0));'+
            ' float e = hash(f+vec3(0,0,1)), g = hash(f+vec3(1,0,1)), h = hash(f+vec3(0,1,1)), k = hash(f+vec3(1,1,1));'+
            ' return mix(mix(mix(a,b,r.x),mix(c,d,r.x),r.y), mix(mix(e,g,r.x),mix(h,k,r.x),r.y), r.z); }'+
            'void main(){'+
            ' vec3 sp = vP*uFreq;'+
            ' float turb = vnoise(sp*1.6)*0.6 + vnoise(sp*3.4)*0.28 + vnoise(sp*7.2)*0.12;'+
            ' float band = sin(vP.y*uFreq + turb*4.2 + sin(vP.x*uFreq*0.35 + uTime*0.28)*1.6);'+
            ' float band2 = sin(vP.y*uFreq*2.3 + uTime*0.2 + turb*6.0);'+
            ' vec3 col = mix(uA, uB, smoothstep(-1.0,1.0,band));'+
            ' col = mix(col, uB*0.55, smoothstep(0.5,0.95,turb)*0.5);'+
            ' col = mix(col, uC, smoothstep(0.42,1.0,band2)*0.4);'+
            ' float cloud = smoothstep(0.55, 0.85, vnoise(sp*2.2 + vec3(uTime*0.05, 0.0, uTime*0.03)));'+
            ' col = mix(col, vec3(0.96,0.95,0.98), cloud*0.5);'+
            ' float pole = smoothstep(0.72, 0.98, abs(normalize(vP).y));'+
            ' col = mix(col, mix(col, vec3(0.9,0.94,1.0), 0.55), pole);'+
            ' vec3 N = normalize(vN);'+
            ' float light = dot(N, normalize(uLight));'+
            ' float day = smoothstep(-0.18, 0.35, light);'+
            ' col *= 0.10 + day*1.15;'+
            ' vec3 V = normalize(cameraPosition - vW);'+
            ' float d = 1.0 - clamp(dot(N,V),0.0,1.0);'+
            ' float fres = pow(d, 3.2) * (1.0 - smoothstep(0.90, 1.0, d));'+
            ' col += uC * fres * 0.85 * (0.25 + day);'+
            ' gl_FragColor = vec4(col, 1.0);}'
        });
      }
      function atmoShell(r, hex){
        return new THREE.Mesh(new THREE.SphereGeometry(r*1.045, 40, 30), new THREE.ShaderMaterial({
          uniforms:{uCol:{value:new THREE.Color(hex)}},
          transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.BackSide,
          vertexShader:
            'varying vec3 vN; varying vec3 vW;'+
            'void main(){ vN = normalize(mat3(modelMatrix)*normal);'+
            ' vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz;'+
            ' gl_Position = projectionMatrix*viewMatrix*w; }',
          fragmentShader:
            'uniform vec3 uCol; varying vec3 vN; varying vec3 vW;'+
            'void main(){ vec3 V = normalize(cameraPosition - vW);'+
            ' float d = 1.0 - abs(dot(normalize(vN), V));'+
            ' float f = pow(d, 2.6) * (1.0 - smoothstep(0.82, 1.0, d));'+
            ' gl_FragColor = vec4(uCol, f*0.62); }'
        }));
      }
      function makePlanet(o){
        var g = new THREE.Group();
        var seg = quality==='low' ? 28 : 52;
        var mat = planetMaterial(o.cA, o.cB, o.cC, o.freq);
        var mesh = new THREE.Mesh(new THREE.SphereGeometry(o.r, seg, Math.round(seg*0.75)), mat);
        g.add(mesh);
        g.add(atmoShell(o.r, o.atmo));
        var glow = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(o.atmo), transparent:true, opacity:0.16, blending:THREE.AdditiveBlending, depthWrite:false}));
        glow.scale.set(o.r*4.4, o.r*4.4, 1); g.add(glow);
        var entry = {group:g, mesh:mesh, mat:mat, glow:glow, moons:[], spin:o.spin||0.04,
          z:o.pos[2], appear:o.appear||300, full:o.full||200};
        g.scale.setScalar(0.001);
        if (o.ring){
          var ring = new THREE.Mesh(new THREE.RingGeometry(o.r*1.45, o.r*2.15, 72),
            new THREE.MeshBasicMaterial({color:o.ring, transparent:true, opacity:0.32, side:THREE.DoubleSide, blending:THREE.AdditiveBlending, depthWrite:false}));
          ring.rotation.x = Math.PI/2 + (o.ringTilt||0.28);
          g.add(ring); entry.ring = ring;
        }
        for (var mi=0; mi<(o.moons||0); mi++){
          var mm = new THREE.Mesh(new THREE.SphereGeometry(o.r*0.11, 14, 10),
            new THREE.MeshStandardMaterial({color:0xb9b4cf, roughness:0.9, emissive:0x2a2438, emissiveIntensity:0.4}));
          mm.userData = {r:o.r*(2.6+mi*0.9), a:Math.random()*Math.PI*2, s:0.42-mi*0.13};
          g.add(mm); entry.moons.push(mm);
        }
        g.position.fromArray(o.pos);
        scene.add(g); planetsX.push(entry);
        return entry;
      }
      makePlanet({r:38, pos:[-158,16,-330], cA:0x9fdcff, cB:0x1f5cb8, cC:0xe6f7ff, freq:0.30, atmo:0x9fdcff, spin:0.13, appear:330, full:225});
      makePlanet({r:18, pos:[-106,36,-472], cA:0xff8a50, cB:0x6e2113, cC:0xffd9a0, freq:0.85, atmo:0xff9a70, spin:0.2, appear:270, full:185});
      makePlanet({r:64, pos:[176,32,-592], cA:0xffd9a0, cB:0xc97b3d, cC:0xfff2d8, freq:0.26, atmo:0xffc98a, ring:0xffd9a0, ringTilt:0.34, moons:2, spin:0.09, appear:270, full:175});
      makePlanet({r:52, pos:[170,-36,-822], cA:0xb99cff, cB:0x3d23a8, cC:0xff9de8, freq:0.30, atmo:0xb99cff, ring:0x8b6cff, ringTilt:0.2, moons:1, spin:0.08, appear:270, full:175});
      planet.add(atmoShell(20, 0x8b6cff));   // the startup world gets an atmosphere too

      /* --- the black hole: horizon, accretion disk, photon ring, infall spiral --- */
      holeGroup = new THREE.Group();
      holeGroup.position.set(0, 4, -1520);
      horizonMesh = new THREE.Mesh(new THREE.SphereGeometry(7, 40, 30), new THREE.MeshBasicMaterial({color:0x000000, fog:false}));
      holeGroup.add(horizonMesh);
      accretionMat = new THREE.ShaderMaterial({
        uniforms:{uTime:{value:0}, uOp:{value:0}},
        transparent:true, depthWrite:false, side:THREE.DoubleSide, blending:THREE.AdditiveBlending,
        vertexShader:
          'varying vec2 vXY; void main(){ vXY = position.xy;'+
          ' gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
        fragmentShader:
          'uniform float uTime, uOp; varying vec2 vXY;'+
          'void main(){'+
          ' float r = length(vXY); float ang = atan(vXY.y, vXY.x);'+
          ' float band = smoothstep(8.4, 10.2, r) * smoothstep(26.0, 19.0, r);'+
          ' float swirl = 0.62 + 0.38*sin(ang*4.0 - uTime*2.1 + r*0.9)*sin(ang*9.0 + uTime*1.5 - r*1.7);'+
          ' float doppler = 0.55 + 0.5*sin(ang + 1.57);'+
          ' vec3 col = mix(vec3(1.0,0.94,0.80), vec3(1.0,0.70,0.34), smoothstep(8.4,15.0,r));'+
          ' col = mix(col, vec3(0.55,0.42,1.0), smoothstep(15.0,26.0,r));'+
          ' float a = band*swirl*(0.35+doppler)*uOp;'+
          ' gl_FragColor = vec4(col*(0.85+doppler*0.95), a);}'
      });
      var diskTilt = new THREE.Group();
      diskTilt.rotation.set(1.18, 0, 0.16);
      var disk = new THREE.Mesh(new THREE.RingGeometry(8.4, 26, 96, 1), accretionMat);
      diskTilt.add(disk);
      var inN = {high:520, medium:300, low:130}[quality];
      infallData = {n:inN, r:new Float32Array(inN), a:new Float32Array(inN)};
      for (i=0;i<inN;i++){ infallData.r[i] = 9+Math.random()*20; infallData.a[i] = Math.random()*Math.PI*2; }
      var ig = new THREE.BufferGeometry();
      ig.setAttribute('position', new THREE.BufferAttribute(new Float32Array(inN*3),3));
      infallPts = new THREE.Points(ig, new THREE.PointsMaterial({map:glowTexture(0xffd9a0), size:1.7, color:0xffffff, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true}));
      diskTilt.add(infallPts);
      holeGroup.add(diskTilt);
      var ringC = document.createElement('canvas'); ringC.width = ringC.height = 128;
      var rg = ringC.getContext('2d');
      rg.strokeStyle = '#ffe7bf'; rg.lineWidth = 5; rg.shadowColor = '#ffbf5e'; rg.shadowBlur = 16;
      rg.beginPath(); rg.arc(64,64,44,0,Math.PI*2); rg.stroke();
      photonRing = new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(ringC), transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
      photonRing.scale.set(19.5, 19.5, 1);
      holeGroup.add(photonRing);
      holeGroup.visible = false;
      scene.add(holeGroup);

      /* --- the new reality: the Vision Capital — a metropolis born from the cosmos --- */
      cityGroup = new THREE.Group();
      cityGroup.position.set(0, -6, -2140);
      function cityMat(m, base){ m.transparent = true; m.opacity = 0; m.userData.base = base; cityMats.push(m); return m; }

      /* coherent window fields — warm-dominant and cool-dominant variants, no confetti */
      function windowsTexture(coolShare){
        var c2 = document.createElement('canvas'); c2.width = 128; c2.height = 256;
        var w2 = c2.getContext('2d');
        w2.fillStyle = '#05060e'; w2.fillRect(0,0,128,256);
        for (var yy=4; yy<252; yy+=5){
          var fB = Math.random();
          if (fB < 0.14) continue;
          var dens = 0.28 + fB*0.42;
          for (var xx=4; xx<124; xx+=6){
            if (Math.random() < dens){
              var pk = Math.random();
              var alpha = (0.3 + Math.random()*0.6) * (0.55 + fB*0.45);
              w2.fillStyle = pk < coolShare
                ? 'rgba('+(110+Math.floor(Math.random()*40))+','+(205+Math.floor(Math.random()*35))+',255,'+alpha+')'
                : pk > 0.975 ? 'rgba(255,120,225,'+alpha+')'
                : 'rgba(255,'+(190+Math.floor(Math.random()*35))+','+(122+Math.floor(Math.random()*40))+','+alpha+')';
              w2.fillRect(xx, yy, 3, 2);
            }
          }
        }
        return new THREE.CanvasTexture(c2);
      }
      var towerMatWarm = cityMat(new THREE.MeshStandardMaterial({color:0x0b0d1c, roughness:0.5, metalness:0.55,
        emissive:0xffffff, emissiveMap:windowsTexture(0.14), emissiveIntensity:1.25}), 1);
      var towerMatCool = cityMat(new THREE.MeshStandardMaterial({color:0x0d0b20, roughness:0.5, metalness:0.55,
        emissive:0xffffff, emissiveMap:windowsTexture(0.5), emissiveIntensity:1.2}), 1);

      /* nebula-dawn sky dome — no walls, stars stay visible above */
      cityExtra.domeMat = new THREE.ShaderMaterial({
        uniforms:{uOp:{value:0}},
        transparent:true, depthWrite:false, side:THREE.BackSide, blending:THREE.AdditiveBlending, fog:false,
        vertexShader:'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
        fragmentShader:
          'uniform float uOp; varying vec3 vD;'+
          'void main(){ float h = vD.y;'+
          ' float horizon = exp(-pow((h-0.03)/0.16, 2.0));'+
          ' vec3 low = mix(vec3(1.0,0.68,0.38), vec3(0.95,0.42,0.62), clamp(h*5.0+0.2, 0.0, 1.0));'+
          ' vec3 col = mix(low, vec3(0.45,0.34,0.9), smoothstep(0.05,0.5,h));'+
          ' float a = horizon*0.5 + smoothstep(0.06,-0.25,h)*0.2 + smoothstep(0.1,0.7,h)*0.06;'+
          ' gl_FragColor = vec4(col, a*uOp);}'
      });
      var dome = new THREE.Mesh(new THREE.SphereGeometry(760, 42, 26), cityExtra.domeMat);
      dome.position.y = 20;
      cityGroup.add(dome);

      /* ground: a light-circuit field that dissolves into the void — no hard edges */
      cityExtra.groundMat = new THREE.ShaderMaterial({
        uniforms:{uOp:{value:0}},
        transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, fog:false,
        vertexShader:'varying vec2 vXZ; void main(){ vXZ = position.xy; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
        fragmentShader:
          'uniform float uOp; varying vec2 vXZ;'+
          'void main(){ float r = length(vXZ);'+
          ' vec2 g = abs(fract(vXZ/24.0)-0.5);'+
          ' float line = smoothstep(0.455,0.5,max(g.x,g.y));'+
          ' vec3 col = mix(vec3(0.31,0.85,1.0), vec3(0.55,0.42,1.0), clamp(vXZ.y*0.0016+0.5, 0.0, 1.0));'+
          ' float fade = 1.0 - smoothstep(150.0, 560.0, r);'+
          ' float a = (line*0.42 + 0.035)*fade;'+
          ' gl_FragColor = vec4(col, a*uOp);}'
      });
      var ground = new THREE.Mesh(new THREE.CircleGeometry(600, 64), cityExtra.groundMat);
      ground.rotation.x = -Math.PI/2; ground.position.y = 0.05;
      cityGroup.add(ground);

      /* the avenue: a river of light with soft edges */
      var avC = document.createElement('canvas'); avC.width = 128; avC.height = 512;
      var av = avC.getContext('2d');
      var avG = av.createLinearGradient(0,0,128,0);
      avG.addColorStop(0,'rgba(255,110,50,0)'); avG.addColorStop(0.24,'rgba(255,140,60,0.5)');
      avG.addColorStop(0.5,'rgba(255,214,140,0.9)'); avG.addColorStop(0.76,'rgba(255,140,60,0.5)'); avG.addColorStop(1,'rgba(255,110,50,0)');
      av.fillStyle = avG; av.fillRect(0,0,128,512);
      av.fillStyle = 'rgba(255,255,255,0.7)';
      for (var la=0; la<512; la+=26){ av.fillRect(62, la, 4, 12); }
      var avTex = new THREE.CanvasTexture(avC);
      avTex.wrapT = THREE.RepeatWrapping; avTex.repeat.set(1, 3);
      var avenue = new THREE.Mesh(new THREE.PlaneGeometry(58, 620),
        cityMat(new THREE.MeshBasicMaterial({map:avTex, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false}), 0.85));
      avenue.rotation.x = -Math.PI/2; avenue.position.set(0, 0.4, -140);
      cityGroup.add(avenue);

      /* canyon districts: boxes + tapered prisms + needle spires */
      var boxGeo = new THREE.BoxGeometry(1,1,1); boxGeo.translate(0,0.5,0);
      var taperGeo = new THREE.CylinderGeometry(0.42, 0.62, 1, 5); taperGeo.translate(0,0.5,0);
      var spireGeo = new THREE.CylinderGeometry(0.06, 0.5, 1, 4); spireGeo.translate(0,0.5,0);
      var counts = {high:[250,105,50], medium:[135,58,28], low:[62,25,13]}[quality];
      var tm = new THREE.Matrix4(), tq = new THREE.Quaternion(), ts = new THREE.Vector3();
      var towerTops = [], towersInfo = [];
      var famDefs = [
        {geo:boxGeo, mat:towerMatWarm, n:counts[0]},
        {geo:taperGeo, mat:towerMatCool, n:counts[1]},
        {geo:spireGeo, mat:towerMatCool, n:counts[2]}
      ];
      for (var fam=0; fam<3; fam++){
        var fd = famDefs[fam];
        var mesh = new THREE.InstancedMesh(fd.geo, fd.mat, fd.n);
        var placed2 = 0, guard2 = 0;
        while (placed2 < fd.n && guard2++ < fd.n*30){
          var side = Math.random()<0.5 ? -1 : 1;
          var tx = side * (36 + Math.pow(Math.random(),1.5)*260);
          var tz = 120 - Math.random()*560;
          var depth = Math.min(1, (-tz+80)/500);
          var th = (Math.pow(Math.random(),1.6)*130 + 16) * (0.5 + depth*0.9) * (fam===2 ? 1.5 : 1);
          var tw = fam===0 ? 9+Math.random()*13 : 10+Math.random()*12;
          var tdp = fam===0 ? 9+Math.random()*13 : tw;
          tq.setFromEuler(new THREE.Euler(0, fam===0 && Math.random()<0.4 ? Math.PI/4 : 0, 0));
          ts.set(tw, th, tdp);
          tm.compose(new THREE.Vector3(tx, 0, tz), tq, ts);
          mesh.setMatrixAt(placed2++, tm);
          if (fam===0) towersInfo.push({x:tx, z:tz, h:th, w:tw, d:tdp});
          if (th > 40 && fam < 2) towerTops.push(tx, th, tz);
        }
        cityGroup.add(mesh);
      }

      /* setback crowns + rooftop antennas — real skyline silhouettes */
      var crownCand = towersInfo.filter(function(t){ return t.h > 52; });
      var crownN = Math.min(crownCand.length, {high:110, medium:58, low:24}[quality]);
      var crowns = new THREE.InstancedMesh(boxGeo, towerMatWarm, Math.max(1, crownN));
      for (i=0;i<crownN;i++){
        var tt = crownCand[i];
        ts.set(tt.w*0.58, tt.h*0.26, tt.d*0.58);
        tm.compose(new THREE.Vector3(tt.x, tt.h, tt.z), tq.identity(), ts);
        crowns.setMatrixAt(i, tm);
        towerTops.push(tt.x, tt.h*1.26, tt.z);
      }
      cityGroup.add(crowns);
      var antGeo = new THREE.CylinderGeometry(0.14, 0.14, 1, 4); antGeo.translate(0,0.5,0);
      var antN = Math.min(crownN, {high:84, medium:46, low:18}[quality]);
      var antMat = cityMat(new THREE.MeshBasicMaterial({color:0x9aa4c8}), 0.55);
      var ants = new THREE.InstancedMesh(antGeo, antMat, Math.max(1, antN));
      for (i=0;i<antN;i++){
        var ta = crownCand[i];
        ts.set(1, 9+Math.random()*15, 1);
        tm.compose(new THREE.Vector3(ta.x, ta.h*1.26, ta.z), tq.identity(), ts);
        ants.setMatrixAt(i, tm);
      }
      cityGroup.add(ants);

      /* sky bridges */
      var bridgeN = {high:16, medium:9, low:5}[quality];
      var bridges = new THREE.InstancedMesh(boxGeo, towerMatWarm, bridgeN);
      for (i=0;i<bridgeN;i++){
        ts.set(80 + Math.random()*55, 2.4, 5.5);
        tm.compose(new THREE.Vector3(0, 32 + Math.random()*34, 60 - Math.random()*440), tq.identity(), ts);
        bridges.setMatrixAt(i, tm);
      }
      cityGroup.add(bridges);

      /* billboard screens facing the avenue */
      var billC = document.createElement('canvas'); billC.width = 128; billC.height = 256;
      var bb = billC.getContext('2d');
      bb.fillStyle = '#060810'; bb.fillRect(0,0,128,256);
      var billCols = ['#ff4fd8','#4fd8ff','#ffbf5e','#8b6cff','#3ee6a0'];
      for (var by=0; by<256; by+=32){
        var bg2 = bb.createLinearGradient(0,by,128,by+30);
        bg2.addColorStop(0, billCols[Math.floor(Math.random()*billCols.length)]);
        bg2.addColorStop(1, billCols[Math.floor(Math.random()*billCols.length)]);
        bb.fillStyle = bg2; bb.globalAlpha = 0.8; bb.fillRect(4, by+3, 120, 26);
        bb.globalAlpha = 0.9; bb.fillStyle = 'rgba(255,255,255,0.85)';
        for (var bl=0; bl<3; bl++){ bb.fillRect(10, by+8+bl*6, 40+Math.random()*60, 2.5); }
      }
      bb.globalAlpha = 1;
      var billTex = new THREE.CanvasTexture(billC);
      billTex.wrapT = THREE.RepeatWrapping; billTex.repeat.set(1, 0.125);
      cityExtra.billMat = new THREE.MeshBasicMaterial({map:billTex, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide});
      cityExtra.billMat.userData.base = 0.8; cityMats.push(cityExtra.billMat);
      var billN = {high:48, medium:28, low:12}[quality];
      var bills = new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1), cityExtra.billMat, billN);
      for (i=0;i<billN;i++){
        var side2 = i%2 ? 1 : -1;
        tq.setFromEuler(new THREE.Euler(0, side2>0 ? -Math.PI/2 : Math.PI/2, 0));
        ts.set(10+Math.random()*15, 7+Math.random()*9, 1);
        tm.compose(new THREE.Vector3(side2*(33+Math.random()*44), 12+Math.random()*66, 90-Math.random()*500), tq, ts);
        bills.setMatrixAt(i, tm);
      }
      cityGroup.add(bills);

      /* rooftop lights */
      var roofN = Math.floor(towerTops.length/3);
      var rpos = new Float32Array(roofN*3);
      for (i=0;i<roofN;i++){
        rpos[i*3] = towerTops[i*3]; rpos[i*3+1] = towerTops[i*3+1] + 1.5; rpos[i*3+2] = towerTops[i*3+2];
      }
      var rgeo = new THREE.BufferGeometry(); rgeo.setAttribute('position', new THREE.BufferAttribute(rpos,3));
      cityExtra.roofPts = new THREE.Points(rgeo, new THREE.PointsMaterial({map:glowTexture(0xffbf5e), size:3, color:0xffffff, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true}));
      cityExtra.roofPts.material.userData.base = 0.85; cityMats.push(cityExtra.roofPts.material);
      cityGroup.add(cityExtra.roofPts);

      /* THE ARCOLOGY */
      var arco = new THREE.Group(); arco.position.set(0, 0, -400);
      var tierR = [30, 23, 16, 10], tierH = [92, 80, 66, 54], yAcc = 0;
      for (i=0;i<4;i++){
        var tier = new THREE.Mesh(new THREE.CylinderGeometry(tierR[i]*0.82, tierR[i], tierH[i], 10), towerMatWarm);
        tier.position.y = yAcc + tierH[i]/2; yAcc += tierH[i];
        arco.add(tier);
      }
      var core = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, yAcc+30, 10),
        cityMat(new THREE.MeshBasicMaterial({color:0xffbf5e, blending:THREE.AdditiveBlending, depthWrite:false}), 0.85));
      core.position.y = (yAcc+30)/2; arco.add(core);
      for (i=0;i<3;i++){
        var halo = new THREE.Mesh(new THREE.TorusGeometry(tierR[i]*1.35, 0.9, 8, 56),
          cityMat(new THREE.MeshBasicMaterial({color:i===1?0x4fd8ff:0xffbf5e, blending:THREE.AdditiveBlending, depthWrite:false}), 0.9));
        halo.position.y = [100, 176, 246][i]; halo.rotation.x = Math.PI/2;
        halo.userData.spin = 0.12 + i*0.09;
        arco.add(halo); beams.push(halo);
      }
      cityExtra.orbital = new THREE.Mesh(new THREE.TorusGeometry(64, 2.2, 8, 96),
        cityMat(new THREE.MeshBasicMaterial({color:0x8b6cff, blending:THREE.AdditiveBlending, depthWrite:false}), 0.55));
      cityExtra.orbital.position.y = 150; cityExtra.orbital.rotation.x = Math.PI/2;
      arco.add(cityExtra.orbital);
      var orbN = {high:70, medium:40, low:18}[quality];
      var opos2 = new Float32Array(orbN*3);
      for (i=0;i<orbN;i++){
        var oa = Math.random()*Math.PI*2;
        opos2[i*3] = Math.cos(oa)*64; opos2[i*3+1] = Math.sin(oa)*64; opos2[i*3+2] = (Math.random()-0.5)*3;
      }
      var ogeo = new THREE.BufferGeometry(); ogeo.setAttribute('position', new THREE.BufferAttribute(opos2,3));
      var orbPts = new THREE.Points(ogeo, new THREE.PointsMaterial({map:glowTexture(0x4fd8ff), size:4.5, color:0xffffff, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true}));
      orbPts.material.userData.base = 0.9; cityMats.push(orbPts.material);
      cityExtra.orbital.add(orbPts);
      cityExtra.scan = new THREE.Mesh(new THREE.TorusGeometry(32, 0.7, 8, 64),
        cityMat(new THREE.MeshBasicMaterial({color:0xffbf5e, blending:THREE.AdditiveBlending, depthWrite:false}), 0.8));
      cityExtra.scan.rotation.x = Math.PI/2;
      arco.add(cityExtra.scan);
      var beamC = document.createElement('canvas'); beamC.width = 16; beamC.height = 128;
      var bgc = beamC.getContext('2d');
      var bGrad = bgc.createLinearGradient(0,128,0,0);
      bGrad.addColorStop(0,'rgba(255,191,94,0.9)'); bGrad.addColorStop(1,'rgba(255,191,94,0)');
      bgc.fillStyle = bGrad; bgc.fillRect(0,0,16,128);
      var skyBeam = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 5, 340, 12, 1, true),
        cityMat(new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(beamC), transparent:true, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide}), 0.5));
      skyBeam.position.y = yAcc + 170; arco.add(skyBeam);
      beacon = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(0xffbf5e), transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
      beacon.position.y = yAcc + 14; beacon.scale.set(24,24,1);
      beacon.material.userData.base = 1; cityMats.push(beacon.material);
      arco.add(beacon);
      cityGroup.add(arco);

      /* the golden thread runs through the civilization it built */
      for (i=0;i<2;i++){
        var thPts = [
          new THREE.Vector3(-300+i*46, 26+i*10, 90-i*40),
          new THREE.Vector3(-110, 118+i*34, -50),
          new THREE.Vector3(70, 152-i*44, -190),
          new THREE.Vector3(285-i*70, 44, -350)
        ];
        var thCurve = new THREE.CatmullRomCurve3(thPts, false, 'centripetal');
        var thread = new THREE.Mesh(new THREE.TubeGeometry(thCurve, 90, 0.55, 6, false),
          cityMat(new THREE.MeshBasicMaterial({color:0xffbf5e, blending:THREE.AdditiveBlending, depthWrite:false}), 0.45));
        cityGroup.add(thread);
        cityExtra.rails.push(thCurve);
        for (var tp2=0; tp2<2; tp2++){
          var thp = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(0xffe0a8), transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
          thp.scale.set(3.4,3.4,1);
          thp.userData = {rail:i, off:tp2*0.5, sp:0.05+i*0.02};
          thp.material.userData.base = 0.95; cityMats.push(thp.material);
          cityGroup.add(thp); cityExtra.threadPulses.push(thp);
        }
      }

      /* vision stars hang above the capital — new ideas over the built world */
      for (i=0;i<8;i++){
        var vs = new THREE.Sprite(new THREE.SpriteMaterial({map:sparkleTexture(i%3===2?0x8b6cff:0xffbf5e), transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
        vs.position.set((Math.random()-0.5)*560, 105+Math.random()*135, 70-Math.random()*470);
        var vsc = 6+Math.random()*5; vs.scale.set(vsc, vsc, 1);
        vs.userData = {seed:Math.random()*10, y:vs.position.y};
        cityGroup.add(vs); cityExtra.visionStars.push(vs);
      }

      /* depth haze between rows — nebula tints */
      for (i=0;i<5;i++){
        var haze = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(i%2?0x8b6cff:0xff5a8f), transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
        haze.position.set((Math.random()-0.5)*70, 14+i*8, 20-i*95);
        haze.scale.set(280, 72, 1);
        haze.material.userData.base = 0.08; cityMats.push(haze.material);
        cityGroup.add(haze); cityExtra.auroras.push(haze);
      }

      /* traffic rivers + flight lanes + cross traffic */
      var trafN = {high:78, medium:44, low:20}[quality];
      for (i=0;i<trafN;i++){
        var toward = Math.random()<0.5;
        var low = Math.random()<0.6;
        var colr = low ? (toward ? 0xffe6b0 : 0xff5a3d) : (i%2 ? 0x4fd8ff : 0xeaf6ff);
        var tf = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(colr), transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
        tf.scale.set(low?3.2:6, 0.8, 1);
        tf.userData = {axis:'z', fixed: low ? (toward?1:-1)*(4+Math.random()*16) : (Math.random()<0.5?-1:1)*(26+Math.random()*10),
          y: low ? 1.6+Math.random()*2 : 26+Math.random()*80,
          p: 120-Math.random()*560, v: (toward?1:-1)*(30+Math.random()*45)};
        tf.material.rotation = Math.PI/2;
        tf.material.userData.base = 0.95; cityMats.push(tf.material);
        cityGroup.add(tf); traffic.push(tf);
      }
      for (i=0;i<10;i++){
        var ct2 = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(0x4fd8ff), transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
        ct2.scale.set(5, 0.8, 1);
        ct2.userData = {axis:'x', fixed: 40-Math.random()*440, y: 36+Math.random()*80,
          p:(Math.random()-0.5)*500, v:(Math.random()<0.5?-1:1)*(28+Math.random()*40)};
        ct2.material.userData.base = 0.9; cityMats.push(ct2.material);
        cityGroup.add(ct2); traffic.push(ct2);
      }

      /* patrol spaceships flying circuits above the capital */
      function makeCityShip(){
        var g2 = new THREE.Group();
        var hm = cityMat(new THREE.MeshStandardMaterial({color:0x1a2038, roughness:0.35, metalness:0.85, emissive:0x0e1430, emissiveIntensity:0.7}), 1);
        var b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.3, 7.5, 10), hm);
        b2.rotation.x = Math.PI/2; g2.add(b2);
        var n2 = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.6, 10), hm);
        n2.rotation.x = Math.PI/2; n2.position.z = 5.0; g2.add(n2);
        var w2 = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.18, 2.2), hm);
        w2.position.set(0, -0.2, -1.4); g2.add(w2);
        var we = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.14, 0.2),
          cityMat(new THREE.MeshBasicMaterial({color:0x4fd8ff, blending:THREE.AdditiveBlending, depthWrite:false}), 0.9));
        we.position.set(0, -0.08, -0.4); g2.add(we);
        var cp2 = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 10),
          cityMat(new THREE.MeshStandardMaterial({color:0x0b1626, roughness:0.1, metalness:0.4, emissive:0x0e2f4a, emissiveIntensity:0.9}), 1));
        cp2.scale.set(1, 0.55, 1.5); cp2.position.set(0, 0.75, 1.6); g2.add(cp2);
        var eng2 = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(0xffbf5e), transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
        eng2.position.set(0, 0, -4.7); eng2.scale.set(2.4, 1.1, 1);
        eng2.material.userData.base = 0.95; cityMats.push(eng2.material);
        g2.add(eng2);
        return g2;
      }
      for (i=0;i<4;i++){
        var loopPts = [];
        var lr = 130 + i*55, lh = 55 + i*28;
        for (var la2=0; la2<10; la2++){
          var ang2 = la2/10*Math.PI*2;
          loopPts.push(new THREE.Vector3(Math.cos(ang2)*lr*(1 + 0.15*Math.sin(ang2*2 + i)), lh + Math.sin(ang2*3 + i)*12, Math.sin(ang2)*lr*0.8 - 140));
        }
        var loop = new THREE.CatmullRomCurve3(loopPts, true, 'centripetal');
        var pShip = makeCityShip();
        pShip.scale.setScalar(1.6);
        pShip.userData = {curve:loop, off:Math.random(), sp:0.014 + i*0.004};
        cityGroup.add(pShip); cityExtra.trains.push(pShip);
      }

      /* vertical movers */
      for (i=0;i<6;i++){
        var vm = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(0xff4fd8), transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
        vm.scale.set(1.3, 4.2, 1);
        vm.userData = {x:(Math.random()<0.5?-1:1)*(40+Math.random()*160), z:60-Math.random()*420, p:Math.random()*110, v:(Math.random()<0.5?-1:1)*(11+Math.random()*13)};
        vm.material.userData.base = 0.85; cityMats.push(vm.material);
        cityGroup.add(vm); cityExtra.vert.push(vm);
      }

      /* rising light motes — new ideas lifting off the capital */
      var moteN = {high:110, medium:70, low:32}[quality];
      var mpos = new Float32Array(moteN*3);
      riseData = {n:moteN, sp:new Float32Array(moteN)};
      for (i=0;i<moteN;i++){
        mpos[i*3] = (Math.random()-0.5)*520;
        mpos[i*3+1] = Math.random()*240;
        mpos[i*3+2] = 80 - Math.random()*500;
        riseData.sp[i] = 3 + Math.random()*6;
      }
      var mgeo = new THREE.BufferGeometry(); mgeo.setAttribute('position', new THREE.BufferAttribute(mpos,3));
      riseMotes = new THREE.Points(mgeo, new THREE.PointsMaterial({map:glowTexture(0xffd9a0), size:2.4, color:0xffffff, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true}));
      riseMotes.material.userData.base = 0.55; cityMats.push(riseMotes.material);
      cityGroup.add(riseMotes);

      /* the wormhole you arrived through */
      var portalMat = accretionMat.clone();
      cityExtra.portal = new THREE.Mesh(new THREE.RingGeometry(8.4, 26, 96, 1), portalMat);
      var portalGrp = new THREE.Group();
      portalGrp.position.set(110, 330, -330);
      portalGrp.rotation.set(0.5, -0.35, 0.15);
      portalGrp.scale.setScalar(2.8);
      portalGrp.add(cityExtra.portal);
      cityGroup.add(portalGrp);
      cityGroup.visible = false;
      scene.add(cityGroup);

      raycaster = new THREE.Raycaster(); pointer = new THREE.Vector2(-2,-2);
      clock = new THREE.Clock();
      return true;
    }

    /* --- build vision stars once data (or fallback) settles --- */
    function buildVisionStars(labeled){
      var maxN = CFG.maxStars[quality];
      var count = labeled ? Math.min(visionData.length, maxN) : Math.round(maxN*0.7);
      for (var i=0;i<count;i++){
        var hue = Math.random();
        var colHex = hue<0.5 ? 0xffbf5e : (hue<0.8 ? 0x8b6cff : 0x4fd8ff);
        var st = new THREE.Sprite(new THREE.SpriteMaterial({map:sparkleTexture(colHex), transparent:true, opacity:0.95, blending:THREE.AdditiveBlending, depthWrite:false}));
        var sig = labeled && visionData[i].signal != null ? clamp01(visionData[i].signal/100) : Math.random()*0.6;
        var base = 2.2 + sig*3.2;
        st.userData = {base:base, seed:Math.random()*10, vi: labeled?i:null, focused:false};
        st.scale.set(base, base, 1);
        st.position.set((Math.random()-0.5)*230, (Math.random()-0.5)*110, (Math.random()-0.5)*150);
        visionGroup.add(st);
        if (labeled) visionStars.push(st);
      }
      renderNeeded = true;
    }

    /* ---------------- camera timeline ---------------- */
    /* name: [pos, look, fov, channels{bang,route,net,planet,finale,star}] */
    var KEYS = {
      'dark':                [[0,0,27],[0,0,0],60,{star:0.35},0],
      'spark':               [[0,0,12],[0,0,0],60,{star:0.5},0],
      'spark2':              [[0,2.5,9],[0,0,0],58,{star:0.6},0],
      'bang':                [[0,1,27],[0,0,0],72,{bang:0.5,star:0.95},0],
      'bang-peak':           [[27,11,11],[0,0,0],80,{bang:0.85,star:1},9],
      'bang2':               [[0,7,52],[0,0,-60],68,{bang:1},-2],
      'visions-approach':    [[0,4,-58],[0,0,-205],64,{bang:1,warp:0.4,hud:0.6},2],
      'visions':             [[0,7,-118],[0,0,-215],62,{bang:1},0],
      'flight':              [[0,2,-252],[0,0,-400],80,{warp:1,hud:1},-4],
      'flight2':             [[0,3,-322],[0,0,-465],76,{warp:0.85,hud:1},5],
      'asteroids':           [[7,1,-382],[-4,0,-475],74,{warp:0.5,hud:1},-9],
      'asteroids2':          [[-5,2,-465],[3,0,-565],70,{route:1,warp:0.35,hud:1},8],
      'network':             [[0,11,-618],[0,0,-700],62,{route:1,net:1},0],
      'profiles-approach':   [[0,6,-772],[0,0,-860],64,{net:1},0],
      'profiles':            [[0,10,-802],[0,0,-862],60,{net:0.6},0],
      'transform':           [[20,9,-938],[0,0,-1000],62,{planet:0.35},-3],
      'transform2':          [[28,13,-958],[0,0,-1000],60,{planet:1},0],
      'tools':               [[-26,11,-962],[0,0,-1000],60,{planet:1},3],
      'knowledge-approach':  [[-10,17,-1032],[0,0,-1095],62,{planet:1},0],
      'knowledge':           [[0,11,-1072],[0,0,-1135],62,{planet:1},0],
      'contribution-approach':[[6,8,-1112],[0,0,-1175],62,{planet:1},0],
      'contribution':        [[-4,7,-1148],[0,0,-1210],62,{planet:1},0],
      'value':               [[5,6,-1185],[0,0,-1250],62,{planet:1},0],
      'compare':             [[-5,8,-1218],[0,0,-1285],62,{planet:1},0],
      'how':                 [[4,7,-1250],[0,0,-1315],62,{planet:1},0],
      'demo':                [[-4,6,-1280],[0,0,-1345],62,{planet:1},0],
      'activity':            [[3,8,-1310],[0,0,-1375],62,{planet:1},0],
      'roadmap':             [[0,9,-1340],[0,0,-1405],62,{planet:1},0],
      'blackhole':           [[0,12,-1332],[0,4,-1520],66,{hole:1,star:1},0],
      'hole-transit':        [[0,4,-1514],[0,4,-1720],92,{hole:1},16],
      'city-entry':          [[0,124,-1970],[0,28,-2260],66,{city:1,finale:0.5},0],
      'city-dive':           [[5,6,-2098],[-3,10,-2330],78,{city:1,finale:0.7,hud:0.5},-5],
      'city':                [[0,78,-2300],[0,114,-2540],60,{city:1,finale:1,star:1.1},0]
    };
    var PHASE_NAMES = {
      'dark':'Phase 00 — Void','spark':'Phase 01 — The Spark','spark2':'Phase 01 — The Spark',
      'bang':'Phase 02 — Ignition','bang-peak':'Phase 02 — Detonation','bang2':'Phase 02 — Expansion',
      'visions-approach':'Phase 03 — Vision Field','visions':'Phase 03 — Vision Field',
      'flight':"Phase 04 — Founder's Flight",'flight2':"Phase 04 — Founder's Flight",
      'asteroids':'Phase 05 — Obstacle Belt','asteroids2':'Phase 05 — Connected Route',
      'network':'Phase 06 — Intelligence Layer','profiles-approach':'Phase 07 — Five Forces','profiles':'Phase 07 — Five Forces',
      'transform':'Phase 08 — World Formation','transform2':'Phase 08 — World Formation','tools':'Phase 09 — Construction',
      'knowledge-approach':'Phase 10 — Knowledge','knowledge':'Phase 10 — Knowledge',
      'contribution-approach':'Phase 11 — Contribution','contribution':'Phase 11 — Contribution',
      'value':'Phase 12 — Value Flow','compare':'Phase 13 — Convergence','how':'Phase 14 — First Mission',
      'demo':'Phase 15 — Demonstration','activity':'Phase 16 — Live Signals','roadmap':'Phase 17 — Horizon',
      'blackhole':'Phase 18 — Event Horizon','hole-transit':'Phase 18 — Singularity','city-entry':'Phase 19 — New Reality','city-dive':'Phase 19 — Descent','city':'Phase 19 — SFCollab'
    };
    var CHANNEL_DEFAULTS = {bang:0,route:0,net:0,planet:0,finale:0,star:1,warp:0,hud:0,hole:0,city:0};

    function fitFinale(){
      var f = el('finale'), foot = document.querySelector('footer');
      if (!f || !foot) return;
      var inner = f.querySelector('.beat-inner');
      f.classList.remove('finale-compact');
      var avail = window.innerHeight - foot.offsetHeight;
      var need = inner ? inner.offsetHeight + 16 : 0;
      if (need > avail){
        f.classList.add('finale-compact');
        need = inner.offsetHeight + 16;
      }
      f.style.minHeight = Math.max(avail, need) + 'px';
    }

    var STAGES = [
      ['#ch1','The Spark'],['#ch2','Big Bang'],['#visions','Active Visions'],['#ch4',"Founder's Flight"],
      ['#intelligence','Intelligence'],['#profiles','Profiles'],['#conversion','Vision \u2192 Startup'],
      ['#ai-tools','AI Tools'],['#ch19','Event Horizon'],['#finale','The City']
    ];
    var jrRail = null, jrRocket = null, jrDots = [], stageTs = [], lastRailP = -1;
    function buildJourneyRail(){
      if (!jrRail){
        jrRail = el('journey-rail'); jrRocket = el('jr-rocket');
        if (!jrRail) return;
        STAGES.forEach(function(st){
          var b = document.createElement('button');
          b.className = 'jr-dot'; b.type = 'button';
          b.setAttribute('aria-label', 'Jump to ' + st[1]);
          b.innerHTML = '<span class="jr-tip">' + st[1] + '</span>';
          b.addEventListener('click', function(){
            var t = document.querySelector(st[0]);
            if (t){ track('rail_jump', {stage: st[1]}); t.scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth'}); }
          });
          jrRail.appendChild(b); jrDots.push(b);
        });
      }
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      stageTs = STAGES.map(function(st){
        var sec = document.querySelector(st[0]);
        if (!sec) return 0;
        return clamp01((sec.offsetTop + sec.offsetHeight*0.5 - window.innerHeight*0.5)/Math.max(1, docH));
      });
      jrDots.forEach(function(d, i){ d.style.left = (stageTs[i]*100).toFixed(2) + '%'; });
    }
    function setRail(p){
      if (Math.abs(p - lastRailP) < 0.0012) return;
      lastRailP = p;
      if (!hudProgEl) hudProgEl = el('mission-progress');
      if (!jrRocket) jrRocket = el('jr-rocket');
      hudProgEl.style.width = (p*100).toFixed(2) + '%';
      jrRocket.style.left = 'calc(' + (p*100).toFixed(2) + '% - 7px)';
      for (var i=0;i<jrDots.length;i++){
        jrDots[i].classList.toggle('done', stageTs[i] <= p + 0.004);
      }
    }
    function buildTimeline(){
      fitFinale();
      timeline = [];
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      document.querySelectorAll('[data-cam]').forEach(function(sec){
        var k = KEYS[sec.getAttribute('data-cam')];
        if (!k) return;
        var t = clamp01((sec.offsetTop + sec.offsetHeight*0.5 - window.innerHeight*0.5) / Math.max(1,docH));
        var ch = Object.assign({}, CHANNEL_DEFAULTS, k[3]||{});
        timeline.push({t:t, pos:new THREE.Vector3().fromArray(k[0]), look:new THREE.Vector3().fromArray(k[1]), fov:k[2], ch:ch, roll:(k[4]||0), name:sec.getAttribute('data-cam')});
      });
      timeline.sort(function(a,b){return a.t-b.t});
      buildJourneyRail();
      for (var ti=0; ti<timeline.length; ti++){
        if (timeline[ti].name === 'bang2'){ planetGateT = timeline[ti].t + 0.015; break; }
      }
      if (timeline.length > 1){
        camPosCurve = new THREE.CatmullRomCurve3(timeline.map(function(k){return k.pos}), false, 'centripetal');
        camLookCurve = new THREE.CatmullRomCurve3(timeline.map(function(k){return k.look}), false, 'centripetal');
      }
      fadeSecs = [];
      document.querySelectorAll('main > section').forEach(function(sc){
        if (sc.id === 'finale'){ sc.style.opacity = ''; sc.style.pointerEvents = ''; return; }
        fadeSecs.push({el:sc, top:sc.offsetTop, h:sc.offsetHeight, o:-1});
      });
    }

    var tmpPos = null, tmpLook = null;
    function applyTimeline(p){
      if (!timeline.length) return;
      if (p < timeline[0].t) p = timeline[0].t;
      if (p > timeline[timeline.length-1].t) p = timeline[timeline.length-1].t;
      var a = timeline[0], b = timeline[timeline.length-1];
      for (var i=0;i<timeline.length-1;i++){
        if (p >= timeline[i].t && p <= timeline[i+1].t){ a = timeline[i]; b = timeline[i+1]; break; }
      }
      var span = Math.max(1e-5, b.t - a.t);
      var rawT = clamp01((p - a.t)/span);
      var t = smooth(rawT);
      if (!tmpPos){ tmpPos = new THREE.Vector3(); tmpLook = new THREE.Vector3(); }
      var ai = timeline.indexOf(a);
      if (camPosCurve && timeline.length > 1){
        var u = clamp01((ai + rawT)/(timeline.length - 1));
        camPosCurve.getPoint(u, tmpPos);
        camLookCurve.getPoint(u, tmpLook);
      } else {
        tmpPos.lerpVectors(a.pos, b.pos, t);
        tmpLook.lerpVectors(a.look, b.look, t);
      }
      camera.position.copy(tmpPos);
      camera.lookAt(tmpLook);
      camera.fov = lerp(a.fov, b.fov, t);
      if (a.name === 'blackhole' && b.name === 'hole-transit') camera.fov += smooth(t)*8;
      else if (a.name === 'hole-transit') camera.fov += (1 - smooth(t))*8;
      camera.updateProjectionMatrix();
      camera.rotateZ(THREE.MathUtils.degToRad(lerp(a.roll||0, b.roll||0, t)));
      currentCam = t < 0.5 ? a.name : b.name;
      segAName = a.name; segBName = b.name; segT = t;
      for (var k in CHANNEL_DEFAULTS) CH[k] = lerp(a.ch[k], b.ch[k], t);
    }

    /* ---------------- per-frame scene state ---------------- */
    var lastBangP = -1, lastTimeS = 0, cometTimer = 2;
    function updateScene(time){
      var dt = Math.min(0.1, Math.max(0, time - lastTimeS)); lastTimeS = time; frameDt = dt || frameDt;

      /* --- cinematic drift: handheld float, wide sweep over the city --- */
      var driftAmp = 0.25 + smooth(CH.city)*5.0;
      camera.position.x += Math.sin(time*0.07)*driftAmp*0.9;
      camera.position.y += Math.cos(time*0.093)*driftAmp*0.5;
      if (!isMobile && !reduceMotion){
        var ppx = pointer.x < -1.5 ? 0 : pointer.x;
        var ppy = pointer.y < -1.5 ? 0 : pointer.y;
        camera.position.x += ppx*0.7;
        camera.position.y += ppy*0.45;
      }
      var det = Math.exp(-Math.pow((CH.bang-0.36)/0.05, 2.0));
      var shake = CH.warp * Math.min(1, velSmooth*2.4) * 0.26 + det*0.85;
      if (shake > 0.004 && !reduceMotion){
        camera.position.x += (Math.random()-0.5)*shake;
        camera.position.y += (Math.random()-0.5)*shake;
      }

      /* --- the spark: alive, then violently unstable as ignition nears --- */
      var pre = clamp01(CH.bang/0.3);
      var jit = pre*(1-pre)*4;
      spark.position.set(Math.sin(time*23.7)*0.15*jit, Math.cos(time*19.3)*0.15*jit, 0);
      var sparkScale = (2.1 + Math.sin(time*2.2)*0.35 + Math.sin(time*17)*0.55*jit) * (1 - smooth(clamp01((CH.bang-0.3)/0.5))*0.75);
      spark.scale.set(sparkScale, sparkScale, 1);
      spark.material.opacity = 1 - smooth(clamp01((CH.bang-0.35)/0.5))*0.75;
      sparkLight.intensity = 1.4 + Math.sin(time*2.2)*0.3 + jit*1.6 + CH.bang*2.6;

      /* --- big bang: implosion → flash → shockwaves → burst → nebula bloom --- */
      var p = CH.bang;
      var burst = smooth(clamp01((p-0.32)/0.68));
      bangPoints.visible = burst > 0.001;
      bangMat.uniforms.uP.value = burst;
      bangMat.uniforms.uTime.value = time;
      bangMat.uniforms.uSpin.value = time*0.05;
      bangMat2.uniforms.uSpin.value = time*0.075;
      bangFlash.material.opacity = Math.exp(-Math.pow((p-0.36)/0.07,2)) * 0.95;
      bangFlash.scale.setScalar(42 + burst*250);
      for (var i=0;i<bangShocks.length;i++){
        var sp = clamp01((p - 0.33 - i*0.115)/0.62);
        bangShocks[i].scale.setScalar(Math.max(0.001, smooth(sp)*(200+i*75)));
        bangShocks[i].material.uniforms.uOp.value = sp>0 ? (1-sp)*(0.55-i*0.08) : 0;
        bangShocks[i].material.uniforms.uTime.value = time;
      }
      if (Math.abs(p - lastBangP) > 0.0015){ updateBangStreaks(p); lastBangP = p; }
      var burst2 = smooth(clamp01((p-0.5)/0.5));
      bangPoints2.visible = burst2 > 0.001;
      bangMat2.uniforms.uP.value = burst2*0.85;
      bangMat2.uniforms.uTime.value = time*1.15;
      var coreO = smooth(clamp01((p-0.42)/0.2));
      bangCore.material.opacity = coreO*(0.85 + Math.sin(time*3.2)*0.15);
      var bcs = Math.max(0.001, coreO*(7 + Math.sin(time*3.2)*1.2));
      bangCore.scale.set(bcs, bcs, 1);
      bangCoreCross.material.opacity = coreO*0.9;
      bangCoreCross.material.rotation = time*0.4;
      var bcc = Math.max(0.001, coreO*(15 + Math.sin(time*2.1)*2));
      bangCoreCross.scale.set(bcc, bcc, 1);
      sparkLight.intensity += coreO*2.2;
      emberPts.material.opacity = smooth(clamp01((p-0.52)/0.25))*0.85;
      emberPts.rotation.y = time*0.035;
      emberPts.rotation.z = time*0.018;
      var flashG = Math.exp(-Math.pow((p-0.36)/0.075, 2.0));
      bangRays.visible = flashG > 0.01 || (burst > 0.02 && burst < 0.98);
      if (bangRays.visible){
        bangRays.quaternion.copy(camera.quaternion);
        bangRays.rotateZ(time*0.05);
        var rayO = flashG*0.9 + burst*(1-burst)*0.22;
        for (i=0;i<bangRayMats.length;i++){
          bangRayMats[i].opacity = rayO*(0.6 + 0.4*Math.sin(time*7 + i*2.3));
        }
      }
      bangFlareH.material.opacity = flashG*0.95;
      bangFlareH.scale.set(40 + flashG*260, 2.6, 1);
      bangFlareV.material.opacity = flashG*0.8;
      bangFlareV.scale.set(2.2, 18 + flashG*95, 1);
      var twGate = smooth(clamp01((p-0.62)/0.22));
      for (i=0;i<bangTwinks.length;i++){
        var twk = bangTwinks[i];
        var o2 = Math.max(0, Math.sin(time*1.1 + twk.userData.ph));
        twk.material.opacity = twGate * o2*o2*o2 * 0.95;
        twk.material.rotation = time*0.3 + twk.userData.ph;
        var ts2 = twk.userData.s * (0.7 + o2*0.5);
        twk.scale.set(ts2, ts2, 1);
      }
      var nbP = smooth(clamp01((p-0.4)/0.6));
      for (i=0;i<bangNebula.length;i++){
        var bn = bangNebula[i];
        bn.material.opacity = nbP * bn.userData.op;
        var nsc = Math.max(0.001, nbP * bn.userData.sc);
        bn.scale.set(nsc, nsc*0.72, 1);
        bn.material.rotation = time*0.02*(i%2?1:-1);
      }

      /* --- starfield: twinkle + slow galactic drift --- */
      starMat.uniforms.uTime.value = time;
      starMat.uniforms.uOpacity.value = 0.34 + 0.70*Math.min(1.3, CH.star);
      starMat.uniforms.uWave.value = 30 + burst*1050;
      starMat.uniforms.uWaveAmp.value = (burst > 0.001 && burst < 0.999) ? Math.sin(burst*Math.PI)*1.1 : 0;
      starField.rotation.z = time*0.0035;

      /* --- vision stars: breathing sparkles --- */
      visionGroup.children.forEach(function(st){
        var pulse = 1 + Math.sin(time*1.6 + st.userData.seed)*0.18;
        var f = st.userData.focused ? 2.0 : (st === hoveredStar ? 1.5 : 1);
        var sc = st.userData.base * pulse * f;
        st.scale.set(sc, sc, 1);
        st.material.rotation = Math.sin(time*0.4 + st.userData.seed)*0.35;
      });

      /* --- asteroid belt: slow tectonic sway --- */
      asteroidMesh.rotation.z = Math.sin(time*0.05)*0.05;

      /* --- the golden route + traveling head pulse --- */
      var rp = smooth(CH.route);
      routeMesh.geometry.setDrawRange(0, Math.floor(routeIndexCount * rp));
      routeMesh.material.opacity = 0.85 * Math.min(1, CH.route*2);
      routeShip.visible = rp > 0.012;
      if (!routeShip.visible && trailLine){ trailLine.visible = false; }
      var emitN = 0, tang = null;
      if (routeShip.visible){
        var shipU = 0.005 + Math.min(0.994, rp*0.99);
        routeCurveRef.getPointAt(shipU, routeShip.position);
        tang = routeCurveRef.getTangentAt(shipU);
        routeShip.lookAt(routeShip.position.x + tang.x, routeShip.position.y + tang.y, routeShip.position.z + tang.z);
        routeShip.rotateZ(Math.sin(time*1.3)*0.16);
        var cruising = rp < 0.985;
        routePulse.material.opacity = (cruising ? 0.95 : 0.45) * (0.8 + Math.sin(time*16)*0.2);
        routeCurveRef.getPointAt(Math.max(0.001, shipU - 0.02), nozzleV);
        emitN = reduceMotion ? 0 : (cruising ? 6 : 1);
        for (i=0;i<trailData.n;i++){
          routeCurveRef.getPointAt(Math.max(0.001, shipU - 0.018 - i*0.0062), trailV);
          trailData.pos[i*3] = trailV.x; trailData.pos[i*3+1] = trailV.y; trailData.pos[i*3+2] = trailV.z;
        }
        trailLine.geometry.attributes.position.needsUpdate = true;
        trailLine.visible = true;
        trailLine.material.opacity = cruising ? 0.9 : 0.3;
      }
      for (var ei=0; ei<emitN; ei++){
        var ci = exhaustData.cursor = (exhaustData.cursor + 1) % exhaustData.n;
        exhaustData.pos[ci*3]   = nozzleV.x + (Math.random()-0.5)*0.35;
        exhaustData.pos[ci*3+1] = nozzleV.y + (Math.random()-0.5)*0.35;
        exhaustData.pos[ci*3+2] = nozzleV.z + (Math.random()-0.5)*0.35;
        exhaustData.vel[ci*3]   = -tang.x*(8+Math.random()*6) + (Math.random()-0.5)*4.4;
        exhaustData.vel[ci*3+1] = -tang.y*(8+Math.random()*6) + (Math.random()-0.5)*4.4;
        exhaustData.vel[ci*3+2] = -tang.z*(8+Math.random()*6) + (Math.random()-0.5)*4.4;
        exhaustData.max[ci] = exhaustData.life[ci] = 0.55 + Math.random()*0.6;
      }
      var anyAlive = false;
      for (i=0;i<exhaustData.n;i++){
        if (exhaustData.life[i] > 0){
          anyAlive = true;
          exhaustData.life[i] -= dt;
          var lf = Math.max(0, exhaustData.life[i]/exhaustData.max[i]);
          exhaustData.pos[i*3]   += exhaustData.vel[i*3]*dt;
          exhaustData.pos[i*3+1] += exhaustData.vel[i*3+1]*dt;
          exhaustData.pos[i*3+2] += exhaustData.vel[i*3+2]*dt;
          var drag = 1 - 2.1*dt;
          exhaustData.vel[i*3] *= drag; exhaustData.vel[i*3+1] *= drag; exhaustData.vel[i*3+2] *= drag;
          var w = lf*lf;
          exhaustData.col[i*3]   = (0.62 + 0.38*w) * lf * 1.5;
          exhaustData.col[i*3+1] = (0.30 + 0.58*w) * lf * 1.5;
          exhaustData.col[i*3+2] = (0.10 + 0.62*w) * lf * 1.25;
        } else if (exhaustData.col[i*3] !== 0){
          exhaustData.col[i*3] = exhaustData.col[i*3+1] = exhaustData.col[i*3+2] = 0;
        }
      }
      if (anyAlive || emitN){
        exhaustPts.geometry.attributes.position.needsUpdate = true;
        exhaustPts.geometry.attributes.color.needsUpdate = true;
      }

      /* --- intelligence network: swarm of context pulses --- */
      netPoints.material.opacity = CH.net * 0.95;
      netLines.material.opacity = CH.net * 0.4;
      for (i=0;i<netPulses.length;i++){
        var np = netPulses[i];
        if (CH.net > 0.01 && netNodes.length > 1){
          var ct = time*0.32 + np.userData.off*netNodes.length;
          var cyc = ct%1, ni = Math.floor(ct)%(netNodes.length-1);
          np.position.lerpVectors(netNodes[ni], netNodes[ni+1], cyc);
          np.material.opacity = CH.net*(0.65+0.35*Math.sin(time*6+i*2.1));
        } else np.material.opacity = 0;
      }

      /* --- five profile energies --- */
      var pv = (CH.net>0.2||CH.planet>0.01) ? 1 : (CH.route>0.3?0.6:0);
      for (i=0;i<5;i++){
        var ps = profileGroup[i];
        var a = ps.userData.phase + time*0.35;
        var r = 26 - CH.planet*4;
        ps.position.set(Math.cos(a)*r, Math.sin(a*1.3)*10, -862 + Math.sin(a)*r*0.5 - CH.planet*120);
        var boost = (i===selectedProfile) ? 1.5 : 1;
        ps.scale.setScalar(7*boost*(0.9+Math.sin(time*2+i)*0.12));
        ps.material.opacity = pv * (i===selectedProfile ? 1 : 0.75);
      }

      /* --- the startup world --- */
      var pf = smooth(CH.planet);
      planet.scale.setScalar(Math.max(0.001, pf));
      planet.rotation.y = time*0.18;
      planet.material.uniforms.uTime.value = time;
      planetRing.scale.setScalar(Math.max(0.001, pf));
      planetRing.rotation.z = time*0.05;
      planetGlow.material.opacity = pf*(0.32 + Math.sin(time*1.1)*0.05);
      planetGlow.scale.set(Math.max(0.001,78*pf), Math.max(0.001,78*pf), 1);
      orbiters.forEach(function(ob){
        var a2 = ob.userData.a + time*ob.userData.s;
        ob.position.set(Math.cos(a2)*ob.userData.r*pf, Math.sin(a2*0.8)*8*pf, -1000 + Math.sin(a2)*ob.userData.r*0.6*pf);
        ob.material.opacity = pf*0.9;
      });

      /* --- comets: rare bright travellers --- */
      if (!reduceMotion){
        cometTimer -= dt;
        if (cometTimer <= 0){ cometTimer = 3.5 + Math.random()*6.5; spawnComet(); }
        for (i=0;i<comets.length;i++){
          var cm = comets[i];
          if (!cm.userData.life) continue;
          cm.userData.life -= dt;
          cm.position.addScaledVector(cm.userData.vel, dt);
          var lf = clamp01(cm.userData.life/cm.userData.max);
          cm.material.opacity = Math.sin(lf*Math.PI)*0.9;
          if (cm.userData.life <= 0){ cm.userData.life = 0; cm.material.opacity = 0; }
        }
      }

      /* --- cinematic planets: born after the bang, one by one as we travel --- */
      var pGate = smooth(clamp01((progress - planetGateT)/0.03));
      for (i=0;i<planetsX.length;i++){
        var px = planetsX[i];
        var distZ = camera.position.z - px.z;
        var rev = pGate * smooth(clamp01((px.appear - distZ)/(px.appear - px.full)));
        var pop = rev * (1 + 0.16*Math.sin(rev*Math.PI));
        px.group.scale.setScalar(Math.max(0.001, pop));
        px.group.visible = rev > 0.004;
        if (!px.group.visible) continue;
        px.glow.material.opacity = 0.16*rev + Math.sin(rev*Math.PI)*0.5;
        px.mat.uniforms.uTime.value = time;
        px.mesh.rotation.y = time*px.spin;
        for (var mj=0;mj<px.moons.length;mj++){
          var mo = px.moons[mj], md = mo.userData;
          mo.position.set(Math.cos(md.a+time*md.s)*md.r, Math.sin((md.a+time*md.s)*0.6)*md.r*0.14, Math.sin(md.a+time*md.s)*md.r);
        }
      }

      /* --- black hole: horizon, disk, photon ring, infall --- */
      var hp = CH.hole;
      holeGroup.visible = hp > 0.004;
      if (holeGroup.visible){
        accretionMat.uniforms.uTime.value = time;
        accretionMat.uniforms.uOp.value = hp;
        photonRing.material.opacity = hp*0.95;
        infallPts.material.opacity = hp*0.9;
        var iArr = infallPts.geometry.attributes.position.array;
        for (i=0;i<infallData.n;i++){
          infallData.a[i] += (1.4 + 16/infallData.r[i])*dt;
          infallData.r[i] -= (2.2 + 26/infallData.r[i])*dt*0.6;
          if (infallData.r[i] < 8.6) infallData.r[i] = 22 + Math.random()*9;
          iArr[i*3]   = Math.cos(infallData.a[i])*infallData.r[i];
          iArr[i*3+1] = Math.sin(infallData.a[i])*infallData.r[i];
          iArr[i*3+2] = (Math.random()-0.5)*0.4;
        }
        infallPts.geometry.attributes.position.needsUpdate = true;
      }

      /* --- the SFCollab city --- */
      var cy = smooth(CH.city);
      cityGroup.visible = cy > 0.003;
      if (cityGroup.visible){
        for (i=0;i<cityMats.length;i++){
          cityMats[i].opacity = cityMats[i].userData.base * cy;
        }
        beacon.scale.setScalar(24*(1 + Math.sin(time*2.6)*0.2));
        for (i=0;i<beams.length;i++){ beams[i].rotation.z = time*beams[i].userData.spin; }
        var scanT = (time*0.24)%1;
        cityExtra.scan.position.y = scanT*300;
        cityExtra.scan.scale.setScalar(1 - scanT*0.55);
        cityExtra.scan.material.opacity = (1-scanT)*0.85*cy;
        cityExtra.orbital.rotation.z = time*0.05;
        cityExtra.billMat.map.offset.y = (time*0.045)%1;
        for (i=0;i<traffic.length;i++){
          var tf = traffic[i], td2 = tf.userData;
          td2.p += td2.v*dt;
          if (td2.axis === 'z'){
            if (td2.p > 130) td2.p = -450; else if (td2.p < -450) td2.p = 130;
            tf.position.set(td2.fixed, td2.y, td2.p);
          } else {
            if (td2.p > 270) td2.p = -270; else if (td2.p < -270) td2.p = 270;
            tf.position.set(td2.p, td2.y, td2.fixed);
            tf.material.rotation = 0;
          }
        }
        for (i=0;i<cityExtra.trains.length;i++){
          var pSh = cityExtra.trains[i], pd2 = pSh.userData;
          var pu = (time*pd2.sp + pd2.off)%1;
          pd2.curve.getPointAt(pu, pSh.position);
          pd2.curve.getPointAt((pu + 0.012)%1, nozzleV);
          pSh.lookAt(cityGroup.localToWorld(nozzleV.clone()));
        }
        for (i=0;i<cityExtra.vert.length;i++){
          var vm = cityExtra.vert[i], vd = vm.userData;
          vd.p += vd.v*dt;
          if (vd.p > 120) vd.p = 0; else if (vd.p < 0) vd.p = 120;
          vm.position.set(vd.x, vd.p, vd.z);
        }
        cityExtra.domeMat.uniforms.uOp.value = cy;
        cityExtra.groundMat.uniforms.uOp.value = cy;
        var mArr = riseMotes.geometry.attributes.position.array;
        for (i=0;i<riseData.n;i++){
          mArr[i*3+1] += riseData.sp[i]*dt;
          if (mArr[i*3+1] > 250) mArr[i*3+1] = 2;
        }
        riseMotes.geometry.attributes.position.needsUpdate = true;
        for (i=0;i<cityExtra.threadPulses.length;i++){
          var thp = cityExtra.threadPulses[i], thd = thp.userData;
          cityExtra.rails[thd.rail].getPointAt((time*thd.sp + thd.off)%1, thp.position);
        }
        for (i=0;i<cityExtra.visionStars.length;i++){
          var vs = cityExtra.visionStars[i];
          vs.position.y = vs.userData.y + Math.sin(time*0.6 + vs.userData.seed)*5;
          vs.material.opacity = cy*(0.55 + 0.45*Math.sin(time*1.4 + vs.userData.seed*2));
          vs.material.rotation = Math.sin(time*0.3 + vs.userData.seed)*0.4;
        }
        cityExtra.portal.material.uniforms.uTime.value = time*1.4;
        cityExtra.portal.material.uniforms.uOp.value = cy*0.55;
      }

      /* --- finale: a universe of new sparks --- */
      finaleSparks.material.opacity = CH.finale*0.95;
      finaleSparks.rotation.y = time*0.02*CH.finale;
      scene.fog.density = Math.max(0.0006, 0.0030 - Math.max(CH.finale, CH.city)*0.0021 - Math.exp(-Math.pow((CH.bang-0.36)/0.075, 2.0))*0.0012);
    }

    function spawnComet(){
      for (var i=0;i<comets.length;i++){
        var cm = comets[i];
        if (!cm.userData.life){
          cm.position.set((Math.random()-0.5)*280, 45+Math.random()*95, camera.position.z - 90 - Math.random()*260);
          var vx = (Math.random()<0.5?-1:1)*(32+Math.random()*45);
          cm.userData.vel.set(vx, -(20+Math.random()*24), 8*(Math.random()-0.5));
          cm.userData.max = cm.userData.life = 1.6 + Math.random()*1.5;
          cm.material.rotation = Math.atan2(-cm.userData.vel.y, -cm.userData.vel.x);
          return;
        }
      }
    }

    function updateBangStreaks(p){
      var attr = bangStreaks.geometry.attributes.position;
      var arr = attr.array, d = bangStreakData;
      var imp = p < 0.32 && p > 0.02;
      var k = imp ? p/0.32 : 0;
      var q = p >= 0.32 ? smooth(clamp01((p-0.32)/0.68)) : 0;
      for (var i=0;i<d.count;i++){
        var dx=d.dir[i*3], dy=d.dir[i*3+1], dz=d.dir[i*3+2], r1, r2;
        if (imp){ var base=(1-smooth(k))*(24+d.len[i]*8); r1=base; r2=base+1.8; }
        else { r1=q*d.spd[i]*140; r2=r1+d.len[i]*(2.5+q*14); }
        arr[i*6]=dx*r1;   arr[i*6+1]=dy*r1; arr[i*6+2]=dz*r1;
        arr[i*6+3]=dx*r2; arr[i*6+4]=dy*r2; arr[i*6+5]=dz*r2;
      }
      attr.needsUpdate = true;
      bangStreaks.material.opacity = imp ? smooth(k)*0.75 : (q>0 ? (1-q)*0.85 : 0);
      bangStreaks.visible = p > 0.02 && (imp || q < 0.985);
    }

    function updateWarp(){
      if (!warpLines) return;
      var w = CH.warp;
      warpLines.material.opacity = Math.min(0.9, w*(0.2 + velSmooth*1.8));
      if (warpLines.material.opacity < 0.02) return;
      var arr = warpLines.geometry.attributes.position.array;
      var stretch = 1.5 + velSmooth*24;
      var adv = (14 + velSmooth*170)*frameDt;
      for (var i=0;i<warpData.n;i++){
        warpData.z[i] += adv;
        if (warpData.z[i] > 4) warpData.z[i] = -78 - Math.random()*22;
        var x=warpData.x[i], y=warpData.y[i], z=warpData.z[i];
        arr[i*6]=x;   arr[i*6+1]=y; arr[i*6+2]=z;
        arr[i*6+3]=x; arr[i*6+4]=y; arr[i*6+5]=z - warpData.l[i]*stretch;
      }
      warpLines.geometry.attributes.position.needsUpdate = true;
    }

    var hudEl=null, hudPhaseEl, hudVelEl, hudVelBarEl, hudDistEl, hudProgEl;
    function updateHUD(){
      if (!hudEl){ hudEl=el('hud'); hudPhaseEl=el('hud-phase'); hudVelEl=el('hud-vel');
        hudVelBarEl=el('hud-velbar'); hudDistEl=el('hud-dist'); hudProgEl=el('mission-progress'); }
      setRail(progress);
      hudEl.style.opacity = CH.hud.toFixed(2);
      if (CH.hud < 0.03) return;
      if (++hudTick % 3) return;
      var phase = PHASE_NAMES[currentCam] || '';
      if (phase !== lastPhase){ hudPhaseEl.textContent = phase; lastPhase = phase; }
      hudVelEl.textContent = (velSmooth*2.4).toFixed(2)+'c';
      hudVelBarEl.style.width = Math.min(100, velSmooth*300).toFixed(0)+'%';
      hudDistEl.textContent = (travelDist*0.42).toFixed(1)+' AU';
    }

    var transitEl = null, lastTransit = -1;
    function updateTransit(){
      if (!transitEl) transitEl = el('transit');
      var o = 0;
      if (segAName === 'blackhole' && segBName === 'hole-transit') o = smooth(segT);
      else if (segAName === 'hole-transit') o = 1 - smooth(segT);
      if (Math.abs(o - lastTransit) > 0.008){ transitEl.style.opacity = o.toFixed(3); lastTransit = o; }
    }

    function updateContentFade(){
      if (reduceMotion) return;
      var mid = window.scrollY + window.innerHeight*0.5;
      for (var i=0;i<fadeSecs.length;i++){
        var f = fadeSecs[i];
        var d = Math.abs(f.top + f.h*0.5 - mid);
        var o = clamp01(1.32 - d/(window.innerHeight*0.60));
        o = o*o*(3-2*o);
        if (Math.abs(f.o - o) > 0.012){
          f.o = o;
          f.el.style.opacity = o.toFixed(3);
          f.el.style.pointerEvents = o < 0.2 ? 'none' : '';
        }
      }
    }


    /* ---------------- pointer: pick vision stars ---------------- */
    function onPointer(e){
      if (!renderer) return;
      var x = (e.touches ? e.touches[0].clientX : e.clientX);
      var y = (e.touches ? e.touches[0].clientY : e.clientY);
      pointer.set(x/window.innerWidth*2-1, -(y/window.innerHeight)*2+1);
      renderNeeded = true;
    }
    function pickStar(click){
      if (!visionStars.length) { hoveredStar = null; return; }
      raycaster.setFromCamera(pointer, camera);
      var hits = raycaster.intersectObjects(visionStars);
      var hit = hits.length ? hits[0].object : null;
      document.body.style.cursor = hit ? 'pointer' : '';
      hoveredStar = hit;
      if (click && hit && hit.userData.vi != null){
        focusVision(hit.userData.vi, true);
        track('vision_star_selected');
      }
    }
    window.addEventListener('pointermove', onPointer, {passive:true});
    window.addEventListener('click', function(e){
      if (e.target.closest('a,button,.panel,nav,#mobile-menu')) return;
      onPointer(e); if (renderer) pickStar(true);
    });

    /* ---------------- main loop ---------------- */
    function frame(){
      if (!running) return;
      requestAnimationFrame(frame);
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress = clamp01(window.scrollY/Math.max(1,docH));
      if (reduceMotion){
        progress = targetProgress;
      } else {
        progress += (targetProgress - progress) * (1 - Math.exp(-(frameDt||0.016)*4.2));
      }
      var moving = Math.abs(targetProgress - progress) > 0.00005;
      if (!moving && reduceMotion && !renderNeeded) return;   // stills only under reduced motion
      applyTimeline(progress);
      if (lastCamZ === null) lastCamZ = camera.position.z;
      var vNow = Math.abs(camera.position.z - lastCamZ); lastCamZ = camera.position.z;
      travelDist += vNow; velSmooth += (vNow - velSmooth)*0.1;
      var t = reduceMotion ? 12 : clock.getElapsedTime();
      updateScene(t);
      updateWarp();
      updateHUD();
      updateTransit();
      updateContentFade();
      if (!reduceMotion || moving || renderNeeded) {
        pickStar(false);
        renderer.render(scene, camera);
        renderNeeded = false;
      }
    }
    document.addEventListener('visibilitychange', function(){
      running = !document.hidden;
      if (running && renderer) frame();
    });
    window.addEventListener('resize', function(){
      if (!renderer) return;
      camera.aspect = window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      buildTimeline(); renderNeeded = true;
    });
    window.addEventListener('scroll', function(){ renderNeeded = true; }, {passive:true});
    window.addEventListener('load', function(){ fitFinale(); if (renderer){ buildTimeline(); renderNeeded = true; } });
    window.addEventListener('resize', fitFinale);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', fitFinale);
    fitFinale();
    buildJourneyRail();
    setRail(0);

    /* ---------------- boot + loader ---------------- */
    var loader = el('loader');
    function setSpark(v){ loader.style.setProperty('--spark', 0.4 + v*2.4); }
    function dismissLoader(){ loader.classList.add('done'); }
    el('loader-skip').addEventListener('click', function(){
      dismissLoader(); track('cinematic_skipped');
      el('positioning').scrollIntoView({behavior: reduceMotion?'auto':'smooth'});
    });

    quality = detectQuality();
    var webglOK = false;
    if (window.THREE){
      try{ webglOK = initScene(); }catch(e){ webglOK = false; }
    }
    if (!webglOK){
      document.documentElement.classList.add('no-webgl');
      document.body.classList.add('no-webgl');
      el('visions-hint').textContent = 'A selection of active Visions from the platform:';
      dismissLoader();
    } else {
      buildTimeline();
      applyTimeline(0);
      updateScene(0);
      renderer.render(scene, camera);
      setSpark(0.35);
      frame();
      var settleTimer = new Promise(function(res){ setTimeout(res, 2600); });
      document.fonts && document.fonts.ready.then(function(){ setSpark(0.7); });
      Promise.race([visionsSettled, settleTimer]).then(function(labeled){
        buildVisionStars(labeled === true);
        buildTimeline();
        setSpark(1);
        setTimeout(dismissLoader, 350);
      });
      // if visions resolve after the race timeout, still attach real stars
      visionsSettled.then(function(labeled){
        if (labeled === true && !visionStars.length){
          while (visionGroup.children.length) visionGroup.remove(visionGroup.children[0]);
          buildVisionStars(true);
        }
      });
      track('landing_loaded', {quality: quality, reducedMotion: reduceMotion});
    }
    // safety: never trap the visitor behind the loader
    setTimeout(dismissLoader, 6000);

    /* --- added: teardown hook for SPA unmount (see module header) --- */
    window.__sfcStop = function(){
      running = false;
      try {
        if (renderer) {
          renderer.dispose();
          if (renderer.forceContextLoss) renderer.forceContextLoss();
        }
      } catch (e) { /* noop */ }
    };
    })();
    /* ================== END verbatim scene script ================== */
  } finally {
    targets.forEach((t, i) => { t.addEventListener = originals[i]; });
  }

  return function teardown() {
    bound.forEach(([t, type, handler, opts]) => {
      try { t.removeEventListener(type, handler, opts); } catch (e) { /* noop */ }
    });
    // Stops the rAF loop and releases GPU resources (installed at the end of
    // the scene script above).
    try { window.__sfcStop && window.__sfcStop(); } catch (e) { /* noop */ }
    delete window.__sfcStop;
    delete window.__sfcFocusVision;
    delete window.SFC_CONFIG;
    document.body.style.cursor = '';
  };
}
