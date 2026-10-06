// Header scroll triggers and mobile navigation drawers
function initNavbar() {
  const header = document.getElementById('header');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  const menuToggle = document.getElementById('menu-toggle');
  const navList = document.getElementById('nav-list');
  const navListLinks = document.querySelectorAll('#nav-list .nav-link');
  const activeIndicator = document.getElementById('nav-active-indicator');

  function updateIndicator(activeLink) {
    if (!activeIndicator || !navList) return;
    
    // Disable indicator logic on mobile drawer
    if (window.innerWidth <= 768 && navList.classList.contains('open')) {
      return;
    }
    
    if (activeLink) {
      navList.classList.add('has-active');
      const linkRect = activeLink.getBoundingClientRect();
      const listRect = navList.getBoundingClientRect();
      
      // Calculate relative position within the spatial dock
      const offsetLeft = linkRect.left - listRect.left;
      const width = linkRect.width;
      
      activeIndicator.style.transform = `translateY(-50%) translateX(${offsetLeft}px)`;
      activeIndicator.style.width = `${width}px`;
    } else {
      navList.classList.remove('has-active');
    }
  }

  window.addEventListener('scroll', () => {
    // Header glass switch - appear after scrolling past hero
    if (header) {
      if (window.scrollY > window.innerHeight * 0.9) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Active link highlighting indicator
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 200;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });
    
    let activeLink = null;
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').slice(1) === current) {
        link.classList.add('active');
        activeLink = link;
      }
    });
    
    updateIndicator(activeLink);
  });
  
  // Initialize indicator on load
  setTimeout(() => {
    const active = document.querySelector('.nav-link.active');
    if (active) updateIndicator(active);
  }, 100);

  // Update indicator on window resize
  window.addEventListener('resize', () => {
    const active = document.querySelector('.nav-link.active');
    if (active) updateIndicator(active);
  });

  // Mobile floating dock toggle
  if (menuToggle && navList) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menuToggle.classList.toggle('open');
      navList.classList.toggle('open');
    });
    
    navListLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('open');
        navList.classList.remove('open');
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (navList.classList.contains('open') && !navList.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.classList.remove('open');
        navList.classList.remove('open');
      }
    });
  }
}
