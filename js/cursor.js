// Custom trailing cursor coordinates tracking
let cursorInitialized = false;

function initCursor() {
  // Mobile/touch device check - disable custom cursor completely
  if (window.innerWidth <= 1024 || ('ontouchstart' in window) || navigator.maxTouchPoints > 0) {
    document.querySelectorAll('.custom-cursor-dot, .custom-cursor-glow').forEach(el => {
      el.style.display = 'none';
    });
    return;
  }
  
  // Initialization guard
  if (cursorInitialized) return;
  cursorInitialized = true;

  // Cleanup: Remove ANY duplicates that might be trapped inside sections
  const existingDots = document.querySelectorAll('.custom-cursor-dot, #cursor-dot');
  const existingGlows = document.querySelectorAll('.custom-cursor-glow, #cursor-glow');
  
  let cursorDot = existingDots.length > 0 ? existingDots[0] : null;
  let cursorGlow = existingGlows.length > 0 ? existingGlows[0] : null;

  // Remove all duplicates to enforce exactly ONE global instance
  for (let i = 1; i < existingDots.length; i++) {
    existingDots[i].remove();
  }
  for (let i = 1; i < existingGlows.length; i++) {
    existingGlows[i].remove();
  }

  // Create them if they don't exist
  if (!cursorDot) {
    cursorDot = document.createElement('div');
    cursorDot.className = 'custom-cursor-dot';
    cursorDot.id = 'cursor-dot';
  }
  if (!cursorGlow) {
    cursorGlow = document.createElement('div');
    cursorGlow.className = 'custom-cursor-glow';
    cursorGlow.id = 'cursor-glow';
  }

  // Guarantee they are attached globally to viewport (body)
  document.body.appendChild(cursorDot);
  document.body.appendChild(cursorGlow);

  // Guarantee styling for global viewport fixed positioning
  cursorDot.style.position = 'fixed';
  cursorDot.style.left = '0';
  cursorDot.style.top = '0';
  cursorDot.style.pointerEvents = 'none';
  cursorDot.style.zIndex = '999999';

  cursorGlow.style.position = 'fixed';
  cursorGlow.style.left = '0';
  cursorGlow.style.top = '0';
  cursorGlow.style.pointerEvents = 'none';
  cursorGlow.style.zIndex = '999998';

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let dotX = mouseX;
  let dotY = mouseY;
  let glowX = mouseX;
  let glowY = mouseY;

  // Track window level clientX/clientY independently of scroll position
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Check light context for hero section
    if (e.target && typeof e.target.closest === 'function' && e.target.closest('.hero')) {
      document.body.classList.add('cursor-light-context');
    } else {
      document.body.classList.remove('cursor-light-context');
    }
  });

  function updateCursor() {
    dotX += (mouseX - dotX) * 0.7;
    dotY += (mouseY - dotY) * 0.7;
    glowX += (mouseX - glowX) * 0.4;
    glowY += (mouseY - glowY) * 0.4;

    if (cursorDot && cursorGlow) {
      // Use purely transform translate3d based on clientX/Y
      cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
    }

    requestAnimationFrame(updateCursor);
  }
  requestAnimationFrame(updateCursor);

  // Hover scale selectors using event delegation so it works universally
  document.body.addEventListener('mouseover', (e) => {
    const target = e.target;
    if (!target || typeof target.closest !== 'function') return;

    const interactive = target.closest('a, button, select, input, textarea, .btn, .nav-link, .project-card, .skill-card, .hero-portrait-container, [data-cursor]');
    if (interactive) {
      const type = interactive.getAttribute('data-cursor');
      if (type === 'portrait') {
        document.body.classList.add('cursor-hover-portrait');
        cursorDot.textContent = 'EXPLORE';
      } else if (type === 'project' || interactive.closest('.project-card')) {
        document.body.classList.add('cursor-hover-project');
        cursorDot.textContent = 'VIEW →';
      } else if (type === 'link') {
        document.body.classList.add('cursor-hover-link');
        cursorDot.textContent = 'OPEN ↗';
      } else if (type === 'contact') {
        document.body.classList.add('cursor-hover-contact');
        cursorDot.textContent = "LET'S TALK";
      } else if (type === 'nav') {
        document.body.classList.add('cursor-hover-nav');
      } else if (interactive.classList.contains('btn') || interactive.classList.contains('magnetic-btn') || type === 'button') {
        document.body.classList.add('cursor-hover-button');
      } else {
        document.body.classList.add('cursor-hover');
      }
    }
  });

  document.body.addEventListener('mouseout', (e) => {
    const target = e.target;
    if (!target || typeof target.closest !== 'function') return;
    
    const interactive = target.closest('a, button, select, input, textarea, .btn, .nav-link, .project-card, .skill-card, .hero-portrait-container, [data-cursor]');
    if (interactive) {
      document.body.className = document.body.className.replace(/\bcursor-hover[^\s]*\b/g, '').trim();
      cursorDot.textContent = '';
    }
  });
}
