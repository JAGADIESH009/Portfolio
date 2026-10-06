// Lanyard Badge Physics (Adapted from 21st.dev reference)
class LanyardBadge {
  constructor(rootEl, options = {}) {
    this.root = rootEl;
    this.options = Object.assign({
      strapText: 'JAGADIESH R',
      strapLabel: 'DEVELOPER',
      strapColor: '#121110', // dark ink
      inkColor: '#EAE4D9', // cream
      cardColor: '#EAE4D9', // cream card stock
      cardWidth: 240,
    }, options);

    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.showBack = false;

    this.cw = this.options.cardWidth;
    this.ch = Math.round(this.cw * 1.5);
    this.ringR = Math.max(7, Math.round(this.cw * 0.036));
    this.clipH = Math.round(this.cw * 0.1);

    this.initDOM();
    this.initPhysics();
    this.bindEvents();
    
    // Initial build
    this.build();
    
    // Start loop
    this.raf = requestAnimationFrame(this.tick.bind(this));
  }

  initDOM() {
    this.root.style.position = 'absolute';
    this.root.style.inset = '0';
    this.root.style.overflow = 'visible'; // Let card swing outside section boundaries if pulled hard
    this.root.style.userSelect = 'none';

    // Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('aria-hidden', 'true');
    this.canvas.style.position = 'absolute';
    this.canvas.style.inset = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.pointerEvents = 'none';
    this.ctx = this.canvas.getContext('2d');
    this.root.appendChild(this.canvas);

    // Card Container
    this.card = document.createElement('div');
    this.card.setAttribute('role', 'button');
    this.card.setAttribute('tabindex', '0');
    this.card.setAttribute('aria-label', 'Badge. Drag to swing, press to flip.');
    this.card.style.position = 'absolute';
    this.card.style.left = '0';
    this.card.style.top = '0';
    this.card.style.width = this.cw + 'px';
    this.card.style.height = (this.ch + this.ringR + this.clipH) + 'px';
    this.card.style.transformOrigin = '50% 0';
    this.card.style.cursor = 'grab';
    this.card.style.touchAction = 'none';
    this.card.style.willChange = 'transform';
    this.card.style.pointerEvents = 'auto'; // allow dragging
    this.root.appendChild(this.card);

    // Badge Clip
    const clip = document.createElement('div');
    clip.setAttribute('aria-hidden', 'true');
    clip.style.position = 'absolute';
    clip.style.left = '50%';
    clip.style.top = '0';
    clip.style.width = (this.cw * 0.075) + 'px';
    clip.style.height = (this.clipH + this.cw * 0.05) + 'px';
    clip.style.transform = 'translateX(-50%)';
    clip.style.borderRadius = (this.cw * 0.02) + 'px';
    clip.style.background = 'linear-gradient(90deg, #f4efe4, #a8a090 50%, #ece6da)';
    clip.style.boxShadow = '0 1px 3px rgba(0,0,0,0.35)';
    clip.style.zIndex = '2';
    this.card.appendChild(clip);

    // Inner 3D Container
    this.inner = document.createElement('div');
    this.inner.style.position = 'absolute';
    this.inner.style.left = '0';
    this.inner.style.right = '0';
    this.inner.style.top = (this.ringR + this.clipH * 0.6) + 'px';
    this.inner.style.height = this.ch + 'px';
    this.inner.style.transformStyle = 'preserve-3d';
    this.card.appendChild(this.inner);

    // Card Faces
    const faceStyle = `
      position: absolute; inset: 0; 
      border-radius: ${this.cw * 0.06}px; 
      overflow: hidden; 
      backface-visibility: hidden; 
      -webkit-backface-visibility: hidden; 
      box-shadow: 0 18px 40px -12px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.2);
    `;

    const shadeStyle = `
      position: absolute; inset: 0; pointer-events: none;
      background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.28) 50%, transparent 65%) var(--lyd-shine, 50%) 0 / 250% 100% no-repeat, rgba(0,0,0,var(--lyd-dim, 0));
    `;

    const slotStyle = `
      position: absolute; top: ${this.cw * 0.05}px; left: 50%;
      width: ${this.cw * 0.2}px; height: ${this.cw * 0.035}px;
      transform: translateX(-50%); border-radius: 999px;
      background: rgba(0,0,0,0.28); box-shadow: inset 0 1px 2px rgba(0,0,0,0.5);
    `;

    // FRONT
    const front = document.createElement('div');
    front.style.cssText = faceStyle + `background: ${this.options.cardColor}; color: ${this.options.strapColor};`;
    front.innerHTML = `
      <div style="position: absolute; inset: 0; padding: 30px 20px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
        <div style="font-family: 'Anton', sans-serif; font-size: 2.2rem; line-height: 1; letter-spacing: 0.05em; text-transform: uppercase;">JAGADIESH R</div>
        <div style="margin-top: 15px; width: 40px; height: 2px; background-color: ${this.options.strapColor};"></div>
        <div style="margin-top: 15px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; font-size: 0.8rem; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.7;">CREATIVE DEVELOPER</div>
      </div>
      <div aria-hidden="true" style="${slotStyle}"></div>
      <div aria-hidden="true" style="${shadeStyle}"></div>
    `;

    // BACK
    const back = document.createElement('div');
    back.style.cssText = faceStyle + `background: ${this.options.cardColor}; transform: rotateY(180deg); color: ${this.options.strapColor};`;
    back.innerHTML = `
      <div style="position: absolute; inset: 0; padding: 30px 20px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; border: 1px solid rgba(0,0,0,0.1); border-radius: ${this.cw * 0.06}px;">
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500; font-size: 0.8rem; letter-spacing: 0.05em; opacity: 0.8;">B.Tech Computer Science</div>
        <div style="margin-top: 15px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.5;">ID: 2026-JR-DEV</div>
      </div>
      <div style="position: absolute; left: 0; right: 0; bottom: 0; height: 35%; background: ${this.options.strapColor}; color: ${this.options.cardColor}; display: flex; align-items: center; justify-content: center; border-top-left-radius: 40px;">
        <div style="font-family: 'Anton', sans-serif; font-size: 1.5rem; letter-spacing: 0.1em;">PORTFOLIO</div>
      </div>
      <div aria-hidden="true" style="${slotStyle}"></div>
      <div aria-hidden="true" style="${shadeStyle}"></div>
    `;

    this.inner.appendChild(front);
    this.inner.appendChild(back);
  }

  initPhysics() {
    this.pts = [];
    this.links = [];
    this.left = [];
    this.right = [];
    this.low = [];
    this.iB = 0;
    this.iT = 0;
    this.iC = 0;
    this.strandRest = 1;
    
    this.spin = { a: this.showBack ? Math.PI : 0, v: 0 };
    this.spinTarget = this.spin.a;
    
    this.STEP = 1 / 120;
    this.GRAVITY = 2400;
    this.ITER = 18;
    this.drag = null;
    this.acc = 0;
    this.last = performance.now();
    this.t = 0;
  }

  add(x, y, w) {
    this.pts.push({ x, y, px: x, py: y, w });
    return this.pts.length - 1;
  }

  strand(from, to, n, slack) {
    const a = this.pts[from];
    const b = this.pts[to];
    const rest = (Math.hypot(b.x - a.x, b.y - a.y) * slack) / n;
    const ids = [from];
    for (let i = 1; i < n; i++) {
      ids.push(this.add(a.x + ((b.x - a.x) * i) / n, a.y + ((b.y - a.y) * i) / n, 1));
    }
    ids.push(to);
    for (let i = 0; i < n; i++) this.links.push([ids[i], ids[i + 1], rest]);
    return { ids, rest };
  }

  integrate(dt) {
    for (const p of this.pts) {
      if (!p.w) continue;
      const damping = 0.992; // reduced damping for snappier feel? default 0.992
      const vx = (p.x - p.px) * damping;
      const vy = (p.y - p.py) * damping;
      p.px = p.x;
      p.py = p.y;
      p.x += vx;
      p.y += vy + this.GRAVITY * dt * dt;
    }
  }

  solve() {
    for (let k = 0; k < this.ITER; k++) {
      for (const [i, j, rest] of this.links) {
        const a = this.pts[i];
        const b = this.pts[j];
        const ws = a.w + b.w;
        if (!ws) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1e-6;
        const f = (d - rest) / (d * ws);
        a.x += dx * f * a.w;
        a.y += dy * f * a.w;
        b.x -= dx * f * b.w;
        b.y -= dy * f * b.w;
      }
    }
  }

  spinStep(dt, drive) {
    this.spin.v += (-(this.spin.a - this.spinTarget) * 18 - this.spin.v * 3.2 + drive) * dt;
    this.spin.a += this.spin.v * dt;
  }

  swingAngle(top, bottom) {
    return Math.atan2(bottom.x - top.x, bottom.y - top.y);
  }

  build() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = Math.max(1, this.root.clientWidth);
    this.H = Math.max(1, this.root.clientHeight);
    this.canvas.width = Math.round(this.W * this.dpr);
    this.canvas.height = Math.round(this.H * this.dpr);

    this.pts = [];
    this.links = []; // CRITICAL FIX: Clear links on rebuild
    this.isDesktop = this.W > 1024;
    
    // Position lanyard on the right for desktop and tablet, center for mobile
    let cx = this.W / 2;
    if (this.W > 1024) cx = Math.max(this.W * 0.5, this.W - 350);
    else if (this.W >= 768) cx = this.W - 220; // Tablet: right side
    
    const spread = Math.min(this.W * 0.16, this.cw * 0.55);
    const sw = Math.max(14, Math.round(this.cw * 0.1));
    this.lanyardTop = -sw * 2;
    const lowLen = sw * 2.2;
    const arm = this.ringR * 2 + this.clipH + this.ch * 0.55;
    const N = 14;

    let bY = Math.max(this.H * 0.16, Math.min(this.H * 0.42, this.H - (lowLen + this.ringR * 2 + this.clipH + this.ch) - 28));
    
    if (!this.isDesktop) {
      this.cw = Math.min(this.W * 0.72, 320);
      this.ch = Math.round(this.cw * 1.5);
      
      if (this.W < 768) {
        // Mobile layout: centered text, place lanyard below it
        this.lanyardTop = this.H * 0.32;
        bY = this.H * 0.40; 
      } else {
        // Tablet layout: text takes up left side, lanyard on right
        this.lanyardTop = -sw * 2;
        bY = Math.max(this.H * 0.16, this.H * 0.28);
      }
    }

    // Crucial: Update DOM if cw/ch changed
    this.card.style.width = this.cw + 'px';
    this.card.style.height = (this.ch + this.ringR + this.clipH) + 'px';
    this.inner.style.top = (this.ringR + this.clipH * 0.6) + 'px';
    this.inner.style.height = this.ch + 'px';

    const aL = this.add(cx - spread, this.lanyardTop, 0);
    this.iB = this.add(cx, bY, 1.4);
    const l = this.strand(aL, this.iB, N, 1.03);
    const aR = this.add(cx + spread, this.lanyardTop, 0);
    const r = this.strand(aR, this.iB, N, 1.03);
    
    this.iT = this.add(cx, bY + lowLen, 0.8);
    const lo = this.strand(this.iB, this.iT, 3, 1);
    this.iC = this.add(cx, bY + lowLen + arm, 0.25);
    this.links.push([this.iT, this.iC, arm]);
    
    this.left = l.ids;
    this.right = r.ids;
    this.low = lo.ids;
    this.strandRest = l.rest;
    this.sw = sw;
    this.lowLen = lowLen;

    this.strapTex = this.makeStrap(this.strandRest * N + 4, sw, this.dpr, { color: this.options.strapColor, ink: this.options.inkColor, text: this.options.strapText, label: this.options.strapLabel });
    this.plainTex = this.makeStrap(lowLen + 4, sw * 0.8, this.dpr, { color: this.options.strapColor, ink: this.options.inkColor, text: this.options.strapText, label: this.options.strapLabel, plain: true });

    if (this.reduced) {
      for (let i = 0; i < 900; i++) {
        this.integrate(this.STEP);
        this.solve();
      }
    } else {
      this.pts[this.iC].x += this.cw * 0.55;
      this.pts[this.iC].px = this.pts[this.iC].x - 2;
      this.spin.v = 5;
    }
  }

  makeStrap(length, width, dpr, opts) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(width * dpr));
    c.height = Math.max(1, Math.round(length * dpr));
    const ctx = c.getContext("2d");
    ctx.setTransform(0, dpr, -dpr, 0, c.width, 0);
    ctx.fillStyle = opts.color;
    ctx.fillRect(0, 0, length, width);
    ctx.strokeStyle = ctx.fillStyle = opts.ink;

    if (!opts.plain) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, length, width);
      ctx.clip();
      ctx.textBaseline = "middle";
      const scriptFont = "400 " + Math.round(width * 0.5) + "px 'Plus Jakarta Sans', sans-serif";
      const labelFont = "700 " + Math.round(width * 0.36) + "px 'Anton', sans-serif";
      ctx.font = scriptFont;
      const scriptW = ctx.measureText(opts.text).width;
      ctx.font = labelFont;
      const labelW = ctx.measureText(opts.label).width;
      const gap = width * 0.6;
      let x = width * 0.4;
      let flip = 1;
      while (x < length) {
        ctx.globalAlpha = 0.95;
        ctx.font = scriptFont;
        ctx.fillText(opts.text, x, width * 0.52);
        x += scriptW + gap;
        if (opts.label) {
          ctx.font = labelFont;
          ctx.fillText("-  " + opts.label + "  -", x, width * 0.53);
          x += labelW + ctx.measureText("-    -").width + gap;
        }
        flip = -flip;
      }
      ctx.restore();
    }
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 1.5);
    ctx.lineTo(length, 1.5);
    ctx.moveTo(0, width - 1.5);
    ctx.lineTo(length, width - 1.5);
    ctx.stroke();
    return c;
  }

  ribbon(ids, tex, rest, light) {
    const Wt = tex.width;
    for (let i = 0; i < ids.length - 1; i++) {
      const a = this.pts[ids[i]];
      const b = this.pts[ids[i + 1]];
      const dx = (b.x - a.x) * this.dpr;
      const dy = (b.y - a.y) * this.dpr;
      const len = Math.hypot(dx, dy) || 1e-6;
      const tx = dx / len;
      const ty = dy / len;
      const nx = ty;
      const ny = -tx;
      const v0 = i * rest * this.dpr;
      const dv = rest * this.dpr;
      const k = len / dv;
      this.ctx.setTransform(nx, ny, tx * k, ty * k, a.x * this.dpr - (nx * Wt) / 2 - tx * k * v0, a.y * this.dpr - (ny * Wt) / 2 - ty * k * v0);
      const src = Math.min(dv + 1.5, tex.height - v0);
      if (src > 0) this.ctx.drawImage(tex, 0, v0, Wt, src, 0, v0, Wt, src);
      const shade = 0.22 * (1 - Math.max(0, nx * light));
      this.ctx.fillStyle = "rgba(0,0,0," + shade.toFixed(3) + ")";
      this.ctx.fillRect(0, v0, Wt, dv + 1);
    }
  }

  metal(x0, y0, x1, y1) {
    const g = this.ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, "#f4efe4");
    g.addColorStop(0.45, "#b9b0a0");
    g.addColorStop(0.55, "#8f8778");
    g.addColorStop(1, "#ece6da");
    return g;
  }

  draw() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!this.strapTex || !this.plainTex) return;
    this.ctx.imageSmoothingEnabled = true;
    this.ribbon(this.left, this.strapTex, this.strandRest, -1);
    this.ribbon(this.right, this.strapTex, this.strandRest, 1);
    this.ribbon(this.low, this.plainTex, this.lowLen / 3, 0);

    const B = this.pts[this.iB];
    const T = this.pts[this.iT];
    const ang = Math.atan2(T.x - B.x, T.y - B.y);
    const u = this.sw / 20;
    
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, B.x * this.dpr, B.y * this.dpr);
    this.ctx.rotate(-ang);
    this.ctx.shadowColor = "rgba(0,0,0,0.3)";
    this.ctx.shadowBlur = 6 * this.dpr;
    this.ctx.shadowOffsetY = 2 * this.dpr;
    this.ctx.fillStyle = this.metal(-16 * u, 0, 16 * u, 0);
    this.ctx.beginPath();
    this.ctx.roundRect(-15 * u, -14 * u, 30 * u, 17 * u, 3 * u);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.roundRect(-11 * u, 1 * u, 22 * u, 15 * u, [2 * u, 2 * u, 6 * u, 6 * u]);
    this.ctx.fill();
    this.ctx.shadowColor = "transparent";
    this.ctx.fillStyle = "rgba(40,36,30,0.55)";
    this.ctx.fillRect(-10 * u, -9 * u, 20 * u, 2.2 * u);
    this.ctx.fillRect(-5 * u, 6 * u, 10 * u, 3 * u);
    this.ctx.strokeStyle = "rgba(255,255,255,0.6)";
    this.ctx.lineWidth = 0.8 * u;
    this.ctx.beginPath();
    this.ctx.moveTo(-13 * u, -12.5 * u);
    this.ctx.lineTo(13 * u, -12.5 * u);
    this.ctx.stroke();

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, T.x * this.dpr, (T.y + this.ringR * 0.8) * this.dpr);
    this.ctx.lineWidth = Math.max(2.5, this.ringR * 0.38);
    this.ctx.strokeStyle = this.metal(-this.ringR, -this.ringR, this.ringR, this.ringR);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.ringR, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  place() {
    const T = this.pts[this.iT];
    const C = this.pts[this.iC];
    const swing = this.swingAngle(T, C);
    this.card.style.transform = `translate3d(${(T.x - this.cw / 2).toFixed(2)}px, ${(T.y + this.ringR).toFixed(2)}px, 0) rotate(${(-swing).toFixed(4)}rad)`;
    this.inner.style.transform = `perspective(1100px) rotateY(${this.spin.a.toFixed(4)}rad)`;
    const edge = 1 - Math.abs(Math.cos(this.spin.a));
    this.inner.style.setProperty("--lyd-dim", (edge * 0.5).toFixed(3));
    this.inner.style.setProperty("--lyd-shine", (50 + Math.sin(this.spin.a) * 70 + swing * 90).toFixed(1) + "%");
  }

  local(e) {
    const r = this.root.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  flip() {
    this.spinTarget = this.spinTarget === 0 ? Math.PI : 0;
    this.showBack = this.spinTarget !== 0;
  }

  bindEvents() {
    this.onDown = (e) => {
      if (e.button > 0) return;
      const [x, y] = this.local(e);
      const T = this.pts[this.iT];
      this.drag = { id: e.pointerId, ox: T.x - x, oy: T.y - y, tx: T.x, ty: T.y, sx: x, sy: y, moved: false };
      this.pts[this.iT].w = 0;
      this.card.setPointerCapture(e.pointerId);
      this.card.style.cursor = "grabbing";
    };

    this.onMove = (e) => {
      if (!this.drag || e.pointerId !== this.drag.id) return;
      const [x, y] = this.local(e);
      this.drag.tx = x + this.drag.ox;
      this.drag.ty = y + this.drag.oy;
      if (Math.hypot(x - this.drag.sx, y - this.drag.sy) > 5) this.drag.moved = true;
    };

    this.onUp = (e) => {
      if (!this.drag || e.pointerId !== this.drag.id) return;
      if (!this.drag.moved) this.flip();
      this.drag = null;
      this.pts[this.iT].w = 0.8;
      this.card.style.cursor = "grab";
    };

    this.card.addEventListener("pointerdown", this.onDown);
    this.card.addEventListener("pointermove", this.onMove);
    this.card.addEventListener("pointerup", this.onUp);
    this.card.addEventListener("pointercancel", this.onUp);

    this.resizeObserver = new ResizeObserver(() => {
      if (Math.abs(this.root.clientWidth - this.W) < 1 && Math.abs(this.root.clientHeight - this.H) < 1) return;
      this.build();
      this.draw();
      this.place();
    });
    this.resizeObserver.observe(this.root);
  }

  tick(now) {
    this.acc += Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    let steps = 0;
    while (this.acc >= this.STEP && steps < 8) {
      this.acc -= this.STEP;
      steps++;
      this.t += this.STEP;
      
      if (this.drag) {
        const T = this.pts[this.iT];
        T.px = T.x;
        T.py = T.y;
        
        let targetX = this.drag.tx;
        let targetY = this.drag.ty;
        
        // Ensure card stays within viewport boundaries, especially on mobile to prevent scrolling
        if (!this.isDesktop) {
          targetX = Math.max(this.cw/2, Math.min(this.W - this.cw/2, targetX));
          // Do not allow dragging above the lanyard top to protect text!
          targetY = Math.max(this.lanyardTop + 20, Math.min(this.H - this.clipH, targetY));
        }
        
        T.x += (targetX - T.x) * 0.35;
        T.y += (targetY - T.y) * 0.35;
      }
      
      const C = this.pts[this.iC];
      if (!this.reduced && !this.drag) {
        C.x += (22 * Math.sin(this.t * 0.7) + 12 * Math.sin(this.t * 1.9)) * this.STEP * this.STEP;
      }
      
      this.integrate(this.STEP);
      this.solve();
      
      const vx = (C.x - C.px) / this.STEP;
      this.spinStep(this.STEP, vx * 0.03 + (this.reduced ? 0 : 0.6 * Math.sin(this.t * 0.5)));
    }
    
    this.draw();
    this.place();
    this.raf = requestAnimationFrame(this.tick.bind(this));
  }
}

// Initialize when DOM is ready
function initLanyard() {
  console.log('initLanyard called');
  const zone = document.getElementById('lanyard-zone');
  if (zone && !window.lanyardInitialized) {
    console.log('lanyard-zone found, clientHeight:', zone.clientHeight, 'clientWidth:', zone.clientWidth);
    window.lanyardInitialized = true;
    new LanyardBadge(zone, {
      cardWidth: 260
    });
  } else {
    console.log('lanyard-zone not found or already initialized');
  }
}

if (document.readyState === 'loading') {
  console.log('readyState is loading, adding listener');
  document.addEventListener('DOMContentLoaded', initLanyard);
} else {
  console.log('readyState is', document.readyState, 'calling initLanyard directly');
  initLanyard();
}
