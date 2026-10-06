/**
 * Cinematic Motion Footer
 */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const wrapper = document.getElementById("motion-footer-wrapper");
  const leftContent = document.querySelector(".contact-left");
  const rightContent = document.querySelector(".contact-right");
  const footerInfo = document.querySelector(".contact-footer-info");

  const contactContent = document.getElementById("contact-content");

  if (!wrapper || !leftContent || !contactContent) return;

  // Cinematic Parallax Reveal applied ONLY to the content, not the footer wrapper.
  // This ensures the CSS ticker animation in the parent does not freeze during scroll scrub.
  gsap.fromTo(
    contactContent,
    { yPercent: -30, scale: 0.95 },
    {
      yPercent: 0,
      scale: 1,
      ease: "none",
      scrollTrigger: {
        trigger: wrapper,
        start: "top bottom", // Starts when top of wrapper enters bottom of viewport
        end: "top top",      // Ends when top of wrapper reaches top of viewport
        scrub: true,
      },
    }
  );

  // Staggered Content Reveal
  gsap.fromTo(
    [leftContent, rightContent, footerInfo],
    { y: 60, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: wrapper,
        start: "top 60%",
        end: "top top",
        scrub: 1,
      },
    }
  );

  // Magnetic Buttons primitive
  const magneticBtns = document.querySelectorAll(".magnetic-btn");
  
  magneticBtns.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const h = rect.width / 2;
      const w = rect.height / 2;
      const x = e.clientX - rect.left - h;
      const y = e.clientY - rect.top - w;

      gsap.to(btn, {
        x: x * 0.4,
        y: y * 0.4,
        rotationX: -y * 0.15,
        rotationY: x * 0.15,
        scale: 1.05,
        ease: "power2.out",
        duration: 0.4,
      });
    });

    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        ease: "elastic.out(1, 0.3)",
        duration: 1.2,
      });
    });
  });

  // Set current year
  const yearSpan = document.getElementById("current-year-footer");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});
