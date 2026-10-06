/**
 * Vanilla JS Works Wheel - 4 Items
 */
const CARD_RATIO = 1.5; // Landscape ratio 1.5 / 1
const STEP = 90; // 4 items -> 90 degrees apart in drum

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function place(ringDeg, drumDeg, ringR, drumR, m, d, w, isMobile) {
  // In drum, we scale inactive items down slightly to emphasize the active one
  const drumScale = 1 - Math.min(Math.abs(d), 1) * 0.45; // active=1.0, adjacent=0.55
  
  // Initial circle image scale ~0.55-0.7
  const ringScale = isMobile ? 0.65 : 0.55; 
  const currentScale = ringScale * (1 - m) + drumScale * m;

  // Shift active project to the right/center on desktop to make room for left title
  const shiftX = isMobile ? 0 : m * (w * 0.12);

  return (
    `translateX(${shiftX}px) ` +
    `rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px) ` +
    `rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px) ` +
    `scale(${currentScale})`
  );
}

class WorksWheel {
  constructor(container, options) {
    this.container = container;
    this.items = options.items || [];
    this.label = options.label !== undefined ? options.label : "WORKS";
    
    this.turn = -1;
    this.target = -1;
    this.active = -1;
    this.stage = { w: 0, h: 0 };
    this.metrics = {};
    
    this.count = this.items.length;
    this.last = Math.max(this.count - 1, 0);
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    this.frame = 0;

    this.initDOM();
    this.bindEvents();
    
    this.readSize();
    this.ro = new ResizeObserver(() => this.readSize());
    this.ro.observe(this.stageEl);
    
    this.draw = this.draw.bind(this);
    this.frame = requestAnimationFrame(this.draw);
  }

  initDOM() {
    this.container.innerHTML = '';
    this.container.className = 'works-wheel-section';
    this.container.setAttribute('aria-label', this.label);
    
    this.stageEl = document.createElement('div');
    this.stageEl.className = 'works-wheel-stage';
    
    this.wheelEl = document.createElement('div');
    this.wheelEl.className = 'works-wheel-drum';
    
    this.cardRefs = [];
    this.items.forEach((item, i) => {
      const tag = item.href ? 'a' : 'div';
      const card = document.createElement(tag);
      card.className = 'works-wheel-card';
      if (item.href) {
        card.href = item.href;
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        card.setAttribute('data-cursor', 'project');
      }
      card.id = `works-wheel-${i}`;
      
      const inner = document.createElement('span');
      inner.className = 'works-wheel-card-inner';
      inner.innerHTML = item.html || '';
      
      card.appendChild(inner);
      this.wheelEl.appendChild(card);
      this.cardRefs.push(card);
    });
    
    this.stageEl.appendChild(this.wheelEl);
    this.container.appendChild(this.stageEl);

    // Titles container
    this.titleEl = document.createElement('div');
    this.titleEl.className = 'works-wheel-active-title';
    this.titleEl.style.opacity = "0"; // Intro fade in
    
    // Create individual title elements for cinematic transitions
    this.titleRefs = [];
    this.items.forEach((item, i) => {
      const t = document.createElement('div');
      t.className = 'works-wheel-title-item';
      t.innerHTML = `
        <div class="active-item-title">${item.title}</div>
        <div class="active-item-meta">
          <span class="active-type">${item.type}</span>
          ${item.status ? `<span class="active-status ${item.statusClass || ''}">${item.status}</span>` : ''}
        </div>
      `;
      t.style.position = 'absolute';
      t.style.left = '0';
      t.style.top = '0';
      t.style.width = '100%';
      t.style.display = 'flex';
      t.style.flexDirection = 'column';
      t.style.gap = '1.5vh';
      t.style.opacity = '0';
      t.style.willChange = 'transform, opacity';
      this.titleEl.appendChild(t);
      this.titleRefs.push(t);
    });

    this.container.appendChild(this.titleEl);

    // index
    this.indexEl = document.createElement('ol');
    this.indexEl.className = 'works-wheel-index';
    this.items.forEach((item, i) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.innerHTML = `<span class="index-num">0${i+1}</span> ${item.title}`;
      li.appendChild(btn);
      this.indexEl.appendChild(li);
    });
    this.container.appendChild(this.indexEl);
  }

  readSize() {
    this.stage.w = this.stageEl.clientWidth;
    this.stage.h = this.stageEl.clientHeight;
    
    if (!this.stage.h || !this.stage.w) return;

    const { w, h } = this.stage;
    
    // Responsive sizing
    const isMobile = w < 768;
    const isTablet = w >= 768 && w < 1024;
    
    let cardW;
    if (isMobile) cardW = clamp(w * 0.8, 280, 360);
    else if (isTablet) cardW = clamp(w * 0.6, 420, 520);
    else cardW = clamp(w * 0.45, 520, 650);
    
    const cardH = cardW / CARD_RATIO;
    const ringR = isMobile ? clamp(h * 0.25, 150, 180) : clamp(h * 0.3, 250, 300); // approx 500-600px diameter
    const drumR = cardH * 1.3; 

    this.metrics = {
      cardW, cardH, ringR, drumR,
      depth: cardH * 3
    };

    this.stageEl.style.perspective = `${this.metrics.depth}px`;
    
    // Size title and index text relative to viewport
    const titleSize = isMobile ? 32 : clamp(h * 0.08, 40, 80);
    this.titleEl.style.fontSize = `${titleSize}px`;
    
    this.cardRefs.forEach((card) => {
      card.style.width = `${cardW}px`;
      card.style.height = `${cardH}px`;
      card.style.marginLeft = `${-cardW / 2}px`;
      card.style.marginTop = `${-cardH / 2}px`;
    });
  }

  setTarget(val) {
    this.target = clamp(val, -1, this.last);
  }

  bindEvents() {
  }

  draw() {
    this.frame = requestAnimationFrame(this.draw);
    if (!this.stage.h) return;

    const gap = this.target - this.turn;
    const EASE = 0.08;
    if (Math.abs(gap) < 0.0005) this.turn = this.target;
    else this.turn += gap * (this.reduced ? 1 : EASE);

    const pos = this.turn;
    const { w } = this.stage;
    const isMobile = w < 768;

    this.wheelEl.style.transform = `translateZ(0)`;

    for (let i = 0; i < this.count; i++) {
      const d = i - pos;
      
      // Transform project cards
      const card = this.cardRefs[i];
      if (card) {
        let opacity = 0;
        let translateY = 0;
        let scale = 1;
        let rotate = 0;
        
        if (d > 1.8 || d < -1.8) {
          opacity = 0;
          card.style.pointerEvents = 'none';
        } else {
          // Fade smoothly
          opacity = 1 - (Math.abs(d) * 0.55);
          if (opacity < 0) opacity = 0;
          
          // Vertical Cinematic Math
          const cardH = this.metrics.cardH || (w * 0.5);
          const gap = cardH * 1.15 + 120; // Next card sits clearly below
          
          translateY = d * gap;
          
          // Scale down smoothly as they move away from center
          scale = 1 - Math.abs(d) * 0.12;
          
          // Slight perspective rotation
          rotate = d * -5; 

          card.style.pointerEvents = 'auto';
        }

        const shiftX = isMobile ? 0 : w * 0.12;
        card.style.transform = `translateX(${shiftX}px) translateY(${translateY}px) scale(${scale}) rotateZ(${rotate}deg)`;
        card.style.opacity = String(opacity);
        card.style.zIndex = String(Math.round(100 - Math.abs(d) * 10));
      }

      // Transform titles
      const titleNode = this.titleRefs[i];
      if (titleNode) {
        if (d > 1 || d < -1) {
          titleNode.style.opacity = '0';
          titleNode.style.pointerEvents = 'none';
        } else {
          // Crossfade opacity
          titleNode.style.opacity = String(1 - Math.abs(d));
          // Move vertically slightly for parallax effect
          titleNode.style.transform = `translateY(${d * 60}px) scale(${1 - Math.abs(d)*0.05})`;
        }
      }
    }

    // Title container and wheel opacity/entry: fade in right after intro
    let entryProgress = 0;
    if (pos > -1) {
      entryProgress = Math.min((pos + 1), 1);
    }
    
    // Shift the entire wheel down when entering so it physically comes from below
    // rather than fading in awkwardly.
    const entryOffset = (1 - entryProgress) * (this.stage.h || 500);
    this.wheelEl.style.transform = `translateY(${entryOffset}px)`;
    this.wheelEl.style.opacity = String(entryProgress);
    
    this.titleEl.style.opacity = String(entryProgress);
    this.titleEl.style.transform = `translateY(calc(-50% + ${entryOffset * 0.5}px))`; // preserve center alignment
    
    const near = clamp(Math.round(pos), 0, this.last);
    if (this.active !== near || this.firstRun) {
      this.active = near;
      this.firstRun = false;
      this.updateActiveItem();
    }
  }

  updateActiveItem() {
    const item = this.items[this.active];
    if (!item) return;
    
    const btns = this.indexEl.querySelectorAll('button');
    btns.forEach((btn, i) => {
      if (i === this.active) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  destroy() {
    cancelAnimationFrame(this.frame);
    this.ro.disconnect();
  }
}

window.WorksWheel = WorksWheel;
