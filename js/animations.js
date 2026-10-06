// Typing animation removed for editorial redesign
// Ease out expo for smooth animation
function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

let countersActive = false;

function loadStatCounters() {
  if (countersActive) return;
  countersActive = true;

  const counters = document.querySelectorAll('.count-target');
  const duration = 1500; // 1.5 seconds

  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target') || '0', 10);
    const suffix = counter.getAttribute('data-suffix') || '';
    
    if (isNaN(target)) {
      counter.textContent = '0' + suffix;
      return;
    }

    let startTime = null;

    function updateCounter(currentTime) {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentVal = Math.floor(easedProgress * target);

      counter.textContent = currentVal + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target + suffix;
      }
    }
    requestAnimationFrame(updateCounter);
  });
}

// Skill bars widths loading
function loadSkillBars() {
  const progresses = document.querySelectorAll('.skill-progress');
  progresses.forEach(prog => {
    prog.style.width = prog.getAttribute('data-width');
  });
}

// Scroll Bound Timeline Fill Indicator
function initTimelineScrollTracker() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  const timelineFill = document.getElementById('timeline-fill-line');
  if (!timelineFill) return;

  window.addEventListener('scroll', () => {
    const timeline = document.querySelector('.timeline-container');
    if (!timeline) return;
    const rect = timeline.getBoundingClientRect();
    const viewHeight = window.innerHeight;
    const progressStart = rect.top - viewHeight / 2;
    const totalDist = rect.height;
    
    let progress = 0;
    if (progressStart < 0) {
      progress = Math.min(Math.max(-progressStart / totalDist, 0), 1);
    }
    timelineFill.style.height = `${progress * 100}%`;

    timelineItems.forEach(item => {
      const dot = item.querySelector('.timeline-dot');
      const dotRect = dot.getBoundingClientRect();
      if (dotRect.top < viewHeight / 2 + 50) {
        item.classList.add('active-scroll');
      } else {
        item.classList.remove('active-scroll');
      }
    });
  });
}

// Intersection Observer reveal triggers
function initScrollReveals() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-up, .reveal-fade, .reveal-mask, .reveal-line');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        if (entry.target.closest('#skills') || entry.target.classList.contains('skills-grid')) {
          loadSkillBars();
        }
        if (entry.target.closest('#about') && entry.target.classList.contains('about-details')) {
          loadStatCounters();
        }
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(elem => observer.observe(elem));
}

function initScrollParallax() {
  const parallaxElements = document.querySelectorAll('.project-img-inner, .parallax-el');
  window.addEventListener('scroll', () => {
    parallaxElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      // Only parallax if in view
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        // Calculate distance from center of screen
        const center = window.innerHeight / 2;
        const elementCenter = rect.top + rect.height / 2;
        const distance = elementCenter - center;
        
        // Move element slightly in opposite direction of scroll (10% speed)
        const yPos = distance * 0.1;
        el.style.transform = `scale(1.05) translateY(${yPos}px)`;
      }
    });
  });
}

function triggerAnimationsOnLoad() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-up, .reveal-fade, .reveal-mask, .reveal-line');
  revealElements.forEach(elem => {
    const rect = elem.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      elem.classList.add('active');
      if (elem.closest('#skills')) loadSkillBars();
      if (elem.closest('#about') && elem.classList.contains('about-details')) loadStatCounters();
    }
  });
  
  // Initialize new behaviors
  if (typeof initScrollParallax === 'function') initScrollParallax();
}
