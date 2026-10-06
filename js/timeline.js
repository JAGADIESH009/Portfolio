function initTimeline() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  const section = document.getElementById('journey');
  if (!section) return;

  const isMobile = window.innerWidth < 768;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const items = document.querySelectorAll('.journey-item');
  const lineFill = document.getElementById('journey-line');
  const slider = document.getElementById('journey-slider');

  if (isMobile || reducedMotion) {
    // Mobile or Reduced Motion: Vertical scroll reveals
    
    // Set initial states for items
    items.forEach(item => {
      const dot = item.querySelector('.journey-dot');
      const text = item.querySelector('.journey-content');
      
      if (!reducedMotion) {
        gsap.set(dot, { scale: 0, opacity: 0.5 });
        gsap.set(text, { opacity: 0, y: 20 });
      } else {
        gsap.set(dot, { scale: 1, opacity: 1 });
        gsap.set(text, { opacity: 1, y: 0 });
      }
    });

    if (reducedMotion) {
      if (lineFill) gsap.set(lineFill, { scaleY: 1 });
      return; 
    }

    // Line fill animation
    if (lineFill) {
      gsap.to(lineFill, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.journey-milestones',
          start: 'top center',
          end: 'bottom center',
          scrub: true,
        }
      });
    }

    // Individual item reveal
    items.forEach(item => {
      const dot = item.querySelector('.journey-dot');
      const text = item.querySelector('.journey-content');
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
          end: 'top 50%',
          scrub: 1,
        }
      });

      tl.to(dot, { scale: 1, opacity: 1, duration: 0.2 })
        .to(text, { opacity: 1, y: 0, duration: 0.8 }, "<0.1");
    });

  } else {
    // Desktop: Horizontal Scroll
    
    const stickyContainer = document.querySelector('.journey-sticky-container');

    // 1. Horizontal movement
    const horizontalTween = gsap.fromTo(slider, 
      { x: 0 },
      {
        x: () => -(slider.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: () => `top+=${stickyContainer.offsetTop} top`,
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true
        }
      }
    );

    // 2. Line fill (GPU Optimized scaleX)
    if (lineFill) {
      gsap.fromTo(lineFill,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: () => `top+=${stickyContainer.offsetTop} top`,
            end: 'bottom bottom',
            scrub: true,
            invalidateOnRefresh: true
          }
        }
      );
    }

    // 3. Item Reveals
    items.forEach((item) => {
      const dot = item.querySelector('.journey-dot');
      const stem = item.querySelector('.journey-stem');
      const text = item.querySelector('.journey-content');
      const isTop = item.classList.contains('journey-item-top');

      // Reset states. Crucially, we use yPercent: -50 on the dot to preserve its exact centerline vertical position!
      gsap.set(dot, { scale: 0, backgroundColor: 'rgba(234, 228, 217, 0.4)', yPercent: -50 });
      gsap.set(stem, { scaleY: 0, transformOrigin: isTop ? "50% 100%" : "50% 0%" });
      gsap.set(text, { opacity: 0, y: isTop ? 20 : -20 });

      // Animate based on horizontal movement
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          containerAnimation: horizontalTween,
          start: 'left 85%', // starts animating in when it enters from right
          end: 'left 15%', // stays active until it hits the left edge
          scrub: true,
        }
      });

      // Phase 1: Enter (Active state)
      tl.to(stem, { scaleY: 1, duration: 0.2 })
        .to(dot, { scale: 1.2, backgroundColor: '#EAE4D9', duration: 0.2 }, "<")
        .to(text, { opacity: 1, y: 0, duration: 0.2 }, "<")
        // Phase 2: Hold active state
        .to({}, { duration: 0.4 })
        // Phase 3: Exit (Dim)
        .to(dot, { scale: 1, backgroundColor: 'rgba(234, 228, 217, 0.6)', duration: 0.2 })
        .to(text, { opacity: 0.6, duration: 0.2 }, "<");
    });
  }

  // Handle font loading and layout shifts
  if (document.fonts) {
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh();
    });
  }
}

// Attach to DOMContentLoaded or window load
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    initTimeline();
  } else {
    window.addEventListener('load', initTimeline);
  }
});
