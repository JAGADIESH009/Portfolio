document.addEventListener("DOMContentLoaded", () => {
  const allWorksData = [
    {
      title: "SRI DENTAL CLINIC",
      type: "WEBSITE",
      href: "https://demodentalclinicweb.vercel.app/",
      html: `<img src="assets/images/sri-dental.jpg" alt="Sri Dental Clinic" style="width: 100%; height: 100%; object-fit: cover; display: block;" />`
    },
    {
      title: "YAM REAL ESTATE",
      type: "WEBSITE",
      href: "https://demorealestateweb.vercel.app/",
      html: `<img src="assets/images/yam-real-estate.jpg" alt="Yam Real Estate" style="width: 100%; height: 100%; object-fit: cover; display: block;" />`
    },
    {
      title: "SMART CAMPUS",
      type: "WEBSITE",
      href: "https://smartcampusportal.vercel.app/",
      html: `<img src="assets/images/smart-campus.jpg" alt="Smart Campus" style="width: 100%; height: 100%; object-fit: cover; display: block;" />`
    },
    {
      title: "VANYA FARM AI",
      type: "WEBSITE",
      status: "IN DEVELOPMENT",
      statusClass: "in-progress",
      href: "https://vanya-farm-ai.vercel.app/",
      html: `<img src="assets/images/vanya-farm.jpg" alt="Vanya Farm AI" style="width: 100%; height: 100%; object-fit: cover; display: block;" />`
    }
  ];

  const section = document.getElementById("works");
  const intro = document.getElementById("works-intro");
  const worksEl = document.getElementById("wheel-all-works");

  let wheelInstance = null;
  if (worksEl) {
    wheelInstance = new WorksWheel(worksEl, {
      label: "", 
      items: allWorksData
    });
  }

  const onScroll = () => {
    if (!section || !wheelInstance) return;
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    
    // Total scrollable distance for the interaction
    const totalScroll = rect.height - vh;
    if (totalScroll <= 0) return;

    let progress = -rect.top / totalScroll;
    progress = Math.max(0, Math.min(progress, 1));

    // Phase 1 (0 to 0.25): Intro fades out, ring forms (target 0 to 1)
    if (progress <= 0.25) {
      const p1 = progress / 0.25; // 0 to 1
      if (intro) {
        intro.style.opacity = 1 - p1;
        intro.style.transform = `scale(${1 - p1 * 0.05}) translateY(${-p1 * 40}px)`;
      }
      wheelInstance.setTarget(p1); 
    } else if (progress <= 0.45) {
      if (intro) intro.style.opacity = 0;
      
      // Phase 2 (0.25 to 0.45): Ring transitions to Drum (target 1 to 2)
      const p2 = (progress - 0.25) / 0.20; // 0 to 1
      wheelInstance.setTarget(1 + p2);
    } else {
      if (intro) intro.style.opacity = 0;

      // Phase 3 (0.45 to 1.0): Drum pos goes 0 to last (target 2 to 2 + last)
      const p3 = (progress - 0.45) / 0.55;
      wheelInstance.setTarget(2 + (p3 * wheelInstance.last));
    }
  };

  window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
  onScroll();
});
