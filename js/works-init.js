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

    // Phase 1 (0 to 0.15): Intro fades out and moves up, first project enters
    const introProgress = Math.min(progress / 0.15, 1);
    
    if (intro) {
      intro.style.opacity = 1 - introProgress;
      intro.style.transform = `scale(${1 - introProgress * 0.06}) translateY(${-introProgress * 120}px)`;
    }

    let targetPos;
    if (progress <= 0.15) {
      const p = progress / 0.15;
      targetPos = -1 + p; // -1 to 0
    } else {
      const p = (progress - 0.15) / 0.85;
      targetPos = p * wheelInstance.last;
    }
    
    wheelInstance.setTarget(targetPos);
  };

  window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
  onScroll();
});
