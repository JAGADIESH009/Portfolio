// Custom trailing cursor coordinates tracking
function initCursor() {
  if (window.innerWidth <= 1024) return;
  const cursorDot = document.getElementById('cursor-dot');
  const cursorGlow = document.getElementById('cursor-glow');
  let mouseX = 0, mouseY = 0;
  let dotX = 0, dotY = 0;
  let glowX = 0, glowY = 0;

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
      cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
    }

    requestAnimationFrame(updateCursor);
  }
  requestAnimationFrame(updateCursor);

  // Hover scale selectors
  const interactiveElements = document.querySelectorAll('a, button, select, input, textarea, .btn, .nav-link, .project-card, .skill-card, .hero-portrait-container, [data-cursor]');
  
  interactiveElements.forEach(elem => {
    elem.addEventListener('mouseenter', () => {
      const type = elem.getAttribute('data-cursor');
      if (type === 'portrait') {
        document.body.classList.add('cursor-hover-portrait');
        cursorDot.textContent = 'EXPLORE';
      } else if (type === 'project' || elem.closest('.project-card')) {
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
      } else if (elem.classList.contains('btn') || elem.classList.contains('magnetic-btn') || type === 'button') {
        document.body.classList.add('cursor-hover-button');
      } else {
        document.body.classList.add('cursor-hover');
      }
    });
    
    elem.addEventListener('mouseleave', () => {
      document.body.className = document.body.className.replace(/\bcursor-hover[^\s]*\b/g, '').trim();
      cursorDot.textContent = '';
    });
  });
}
