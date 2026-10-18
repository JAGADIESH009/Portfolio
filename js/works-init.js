document.addEventListener("DOMContentLoaded", () => {
  const allWorksData = [
    {
      title: "SMART CAMPUS",
      type: "PROJECT",
      href: "https://smartcampusportal.vercel.app/",
      html: `<img src="assets/images/smart-campus.jpg" alt="Smart Campus" style="width: 100%; height: 100%; object-fit: contain; display: block;" />`
    },
    {
      title: "SAFEHER",
      type: "MOBILE APP · WEB VERSION",
      href: "https://safeherweb.vercel.app/",
      html: `<img src="assets/images/safeher.png" alt="SafeHer" style="width: 100%; height: 100%; object-fit: contain; display: block;" />`
    },
    {
      title: "VANYA FARM AI",
      type: "PROJECT",
      status: "IN DEVELOPMENT",
      statusClass: "in-progress",
      href: "https://vanya-farm-ai.vercel.app/",
      html: `<img src="assets/images/vanya-farm.png" alt="Vanya Farm AI" style="width: 100%; height: 100%; object-fit: contain; display: block;" />`
    },
    {
      title: "SRI DENTAL CLINIC",
      type: "WEBSITE",
      href: "https://demodentalclinicweb.vercel.app/",
      html: `<img src="assets/images/sri-dental.jpg" alt="Sri Dental Clinic" style="width: 100%; height: 100%; object-fit: contain; display: block;" />`
    },
    {
      title: "YAM REAL ESTATE",
      type: "WEBSITE",
      href: "https://demorealestateweb.vercel.app/",
      html: `<img src="assets/images/yam-real-estate.jpg" alt="Yam Real Estate" style="width: 100%; height: 100%; object-fit: contain; display: block;" />`
    }
  ];

  const section = document.getElementById("works");
  const intro = document.getElementById("works-intro");
  const worksEl = document.getElementById("wheel-all-works");

  let wheelInstance = null;
  let scrollListenerAttached = false;
  let mobileObserver = null;

  const onScrollDesktop = () => {
    if (!section || !wheelInstance) return;
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    
    // Total scrollable distance for the desktop interaction
    const totalScroll = rect.height - vh;
    if (totalScroll <= 0) return;

    let progress = -rect.top / totalScroll;
    progress = Math.max(0, Math.min(progress, 1));

    // Phase 1 (0 to 0.12): Intro fades out and moves up
    const introProgress = Math.min(progress / 0.12, 1);
    
    if (intro) {
      intro.style.opacity = 1 - introProgress;
      intro.style.transform = `scale(${1 - introProgress * 0.06}) translateY(${-introProgress * 120}px)`;
      intro.style.pointerEvents = introProgress > 0.5 ? 'none' : 'auto';
    }

    let targetPos;
    if (progress <= 0.14) {
      // Intro exits, gap, first project is strictly hidden
      targetPos = -1;
    } else {
      // Phase 2 (0.14 to 0.80): Balanced wheel sequence through all 5 projects
      // Project 1 (Smart Campus) active around progress = 0.272
      // Project 2 (SafeHer) active around progress = 0.404
      // Project 3 (Vanya Farm AI) active around progress = 0.536
      // Project 4 (Sri Dental Clinic) active around progress = 0.668
      // Project 5 (Yam Real Estate) active around progress = 0.800
      // Progress 0.80 to 1.00: Yam Real Estate rests with complete stability and bottom separation buffer
      const p = Math.min((progress - 0.14) / 0.66, 1);
      targetPos = -1 + p * (wheelInstance.last + 1);
    }
    
    wheelInstance.setTarget(targetPos);
  };

  const handleDesktopScroll = () => {
    requestAnimationFrame(onScrollDesktop);
  };

  // Setup Desktop 3D Wheel
  const initDesktopWheel = () => {
    if (wheelInstance || !worksEl) return;
    wheelInstance = new WorksWheel(worksEl, {
      label: "",
      items: allWorksData
    });
    if (!scrollListenerAttached) {
      window.addEventListener('scroll', handleDesktopScroll, { passive: true });
      scrollListenerAttached = true;
    }
    handleDesktopScroll();
  };

  // Teardown Desktop 3D Wheel
  const destroyDesktopWheel = () => {
    if (scrollListenerAttached) {
      window.removeEventListener('scroll', handleDesktopScroll);
      scrollListenerAttached = false;
    }
    if (wheelInstance) {
      wheelInstance.destroy();
      wheelInstance = null;
    }
    if (worksEl) {
      worksEl.innerHTML = '';
    }
  };

  // Setup Mobile Showcase
  const initMobileShowcase = () => {
    const cards = document.querySelectorAll('.works-mobile-card');
    if (!cards.length) return;

    if ('IntersectionObserver' in window) {
      mobileObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            // Reverse transition naturally when scrolling upward
            // If the element exited below the viewport (boundingClientRect.top > 0), remove is-visible
            if (entry.boundingClientRect.top > 0) {
              entry.target.classList.remove('is-visible');
            }
          }
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -6% 0px'
      });

      cards.forEach((card) => {
        mobileObserver.observe(card);
      });
    } else {
      // Fallback if IntersectionObserver is not supported
      cards.forEach((card) => card.classList.add('is-visible'));
    }
  };

  // Teardown Mobile Showcase
  const destroyMobileShowcase = () => {
    if (mobileObserver) {
      mobileObserver.disconnect();
      mobileObserver = null;
    }
  };

  // Orchestrate based on viewport breakpoint (1024px)
  const syncExperience = () => {
    const isDesktop = window.innerWidth > 1024;
    if (isDesktop) {
      destroyMobileShowcase();
      initDesktopWheel();
    } else {
      destroyDesktopWheel();
      initMobileShowcase();
    }
  };

  // Initial sync
  syncExperience();

  // Resize handler with debounce
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      syncExperience();
    }, 150);
  }, { passive: true });
});
