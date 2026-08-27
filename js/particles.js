
(function () {
  'use strict';

  var CONFIG = {
    count: 100,
    linkDist: 140,
    mouseDist: 170,
    mouseGlow: 90,

    colors: [
      { rgb: '34,48,43',  w: 0.65 },  // ink
      { rgb: '169,123,80', w: 0.35 }, // copper
    ],
    linkAlpha: 0.11,
    mouseAlpha: 0.32,
    glowAlpha: 0.055,
    speed: 0.2,
  };

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var canvas = document.createElement('canvas');
  canvas.id = 'bg-particles';
  document.body.insertBefore(canvas, document.body.firstChild);

  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, DPR = 1;
  var parts = [];
  var mouse = { x: -1e5, y: -1e5 };
  var running = false;

  function pickColor() {
    var r = Math.random(), acc = 0;
    for (var i = 0; i < CONFIG.colors.length; i++) {
      acc += CONFIG.colors[i].w;
      if (r <= acc) return CONFIG.colors[i].rgb;
    }
    return CONFIG.colors[0].rgb;
  }

  function resize() {
    DPR = window.devicePixelRatio || 1;
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function edgeX() {
    var r = Math.random();
    if (r < 0.35) return Math.random() * W * 0.14;
    if (r < 0.7) return W * (0.86 + Math.random() * 0.14);
    return Math.random() * W;
  }

  function initParts() {
    var n = W < 720 ? Math.floor(CONFIG.count / 2) : CONFIG.count;
    parts = [];
    for (var i = 0; i < n; i++) {
      parts.push({
        x: edgeX(),
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * CONFIG.speed * 2,
        vy: (Math.random() - 0.5) * CONFIG.speed * 2,
        r: Math.random() * 2.0 + 0.7,
        c: pickColor(),
        a: Math.random() * 0.24 + 0.08,
      });
    }
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.c + ',' + p.a + ')';
      ctx.fill();
    }

    for (var a = 0; a < parts.length; a++) {
      for (var b = a + 1; b < parts.length; b++) {
        var pa = parts[a], pb = parts[b];
        var dx = pa.x - pb.x, dy = pa.y - pb.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < CONFIG.linkDist * CONFIG.linkDist) {
          var o = (1 - Math.sqrt(d2) / CONFIG.linkDist) * CONFIG.linkAlpha;
          ctx.strokeStyle = 'rgba(34,48,43,' + o + ')';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
        }
      }
    }

    if (mouse.x > -1e4) {
      for (var m = 0; m < parts.length; m++) {
        var q = parts[m];
        var mdx = q.x - mouse.x, mdy = q.y - mouse.y;
        var md2 = mdx * mdx + mdy * mdy;
        if (md2 < CONFIG.mouseDist * CONFIG.mouseDist) {
          var mo = (1 - Math.sqrt(md2) / CONFIG.mouseDist) * CONFIG.mouseAlpha;
          ctx.strokeStyle = 'rgba(169,123,80,' + mo + ')';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      var glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, CONFIG.mouseGlow);
      glow.addColorStop(0, 'rgba(169,123,80,' + CONFIG.glowAlpha + ')');
      glow.addColorStop(1, 'rgba(169,123,80,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(mouse.x, mouse.y, CONFIG.mouseGlow, 0, Math.PI * 2); ctx.fill();
    }

    if (running) requestAnimationFrame(frame);
  }

  function start() { if (!running) { running = true; requestAnimationFrame(frame); } }
  function stop() { running = false; }

  resize(); initParts();
  if (reduce) { frame(); } else { start(); }

  window.addEventListener('resize', function () { resize(); initParts(); });
  window.addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  document.documentElement.addEventListener('mouseleave', function () { mouse.x = -1e5; mouse.y = -1e5; });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else if (!reduce) start();
  });
})();
