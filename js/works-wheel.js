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

    // active title
    this.titleEl = document.createElement('div');
    this.titleEl.className = 'works-wheel-active-title';
    this.titleEl.style.opacity = "0";
    
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
    if (isMobile) cardW = clamp(w * 0.7, 260, 340);
    else if (isTablet) cardW = clamp(w * 0.5, 300, 400);
    else cardW = clamp(w * 0.35, 380, 500);
    
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
      
      const card = this.cardRefs[i];
      if (card) {
        let opacity = 0;
        let translateY = 0;
        let scale = 1;
        let rotate = 0;
        
        if (d > 1 || d < -1) {
          opacity = 0;
          card.style.pointerEvents = 'none';
        } else {
          opacity = 1 - Math.abs(d);
          
          if (d > 0) {
            // Coming in from bottom
            translateY = d * 150; 
            scale = 0.92 + (1 - d) * 0.08; 
            rotate = d * 2; 
          } else {
            // Going out to top
            translateY = d * 120; // moving out also moves slightly
            scale = 1 + (Math.abs(d) * 0.04); 
            rotate = d * -1;
          }
          card.style.pointerEvents = Math.abs(d) < 0.1 ? 'auto' : 'none';
        }

        // Shift active project to the right/center on desktop to make room for left title
        const shiftX = isMobile ? 0 : w * 0.12;

        card.style.transform = `translateX(${shiftX}px) translateY(${translateY}px) scale(${scale}) rotateZ(${rotate}deg)`;
        card.style.opacity = String(opacity);
        card.style.zIndex = String(Math.round(100 - Math.abs(d) * 10));
      }
    }

    // Title opacity: fade in right after intro (together with first project)
    let titleOpacity = 0;
    if (pos > -1) {
      titleOpacity = Math.min((pos + 1), 1);
    }
    this.titleEl.style.opacity = String(titleOpacity);
    
    const near = clamp(Math.round(pos), 0, this.last);
    if (this.active !== near || this.firstRun) {
      this.active = near;
      this.firstRun = false;
      this.updateActiveItem();
    }
  }

  updateActiveItem() {
    const item = this.items[this.active];
    if (item) {
      this.titleEl.innerHTML = `
        <div class="active-item-title">${item.title}</div>
        <div class="active-item-meta">
          <span class="active-type">${item.type}</span>
          ${item.status ? `<span class="active-status ${item.statusClass || ''}">${item.status}</span>` : ''}
        </div>
      `;
    }
    
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
