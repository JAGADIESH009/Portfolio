/**
 * ==========================================================================
 * PREMIUM EDITORIAL SCROLL-TRIGGERED REVEAL SYSTEM
 * ==========================================================================
 * Progressively reveals typography, paragraphs, images, and metadata 
 * across every section using hardware-accelerated clipping masks and 
 * controlled vertical unmasking.
 *
 * Automatically reverses naturally when scrolling upward.
 * Fully responsive: desktop & mobile tuned travel distances and timing.
 * 100% accessible: respects prefers-reduced-motion.
 */

function initScrollReveals() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Check reduced motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    // Reveal everything immediately and exit
    gsap.set([
      "#portfolio-text span",
      ".hero-poster-portrait",
      ".hero-ui-top-left > *",
      ".hero-statement",
      ".hero-cta-wrapper",
      ".about-giant-typo",
      ".about-bio p",
      "#lanyard-zone",
      ".about-bg-monogram",
      ".journey-main-title",
      ".journey-item .journey-content",
      ".skills-title",
      ".skills-subtitle",
      ".skills-row",
      ".skills-row .tech-word",
      ".works-mobile-intro > *",
      ".works-mobile-card",
      ".works-mobile-card *",
      ".contact-heading",
      ".contact-subheading",
      ".contact-copy",
      ".action-buttons .action-btn",
      ".editorial-form-card",
      ".editorial-form .form-group",
      ".editorial-submit-btn",
      ".editorial-ticker-wrapper"
    ], {
      clipPath: "none",
      opacity: 1,
      transform: "none",
      clearProps: "all"
    });
    return;
  }

  // Clean up any existing reveal ScrollTriggers to prevent duplicates on re-init
  ScrollTrigger.getAll().forEach(st => {
    if (st.vars.id && st.vars.id.startsWith('reveal-')) {
      st.kill();
    }
  });

  const mm = gsap.matchMedia();

  mm.add({
    isDesktop: "(min-width: 768px)",
    isMobile: "(max-width: 767px)"
  }, (context) => {
    const { isDesktop, isMobile } = context.conditions;

    const easeEditorial = "power3.out";
    const yDist = isMobile ? 22 : 36;
    const yDistSmall = isMobile ? 12 : 20;

    // =========================================================================
    // 1. PORTFOLIO (HERO SECTION)
    // =========================================================================
    const portfolioSpans = document.querySelectorAll("#portfolio-text span");
    const portraitImg = document.querySelector(".hero-poster-portrait");

    if (portfolioSpans.length) {
      // Headline masked clipping reveal from bottom
      gsap.fromTo(portfolioSpans, 
        { clipPath: "inset(100% 0% 0% 0%)", y: isMobile ? 22 : 42, opacity: 0 },
        { 
          clipPath: "inset(0% 0% 0% 0%)", 
          y: 0, 
          opacity: 1, 
          duration: 1.0, 
          stagger: 0.035, 
          ease: easeEditorial, 
          delay: 0.15 
        }
      );
    }

    if (portraitImg) {
      if (isMobile) {
        // Mobile: clip and fade only, preserving CSS translateX(-45.8%) centering
        gsap.fromTo(portraitImg,
          { clipPath: "inset(6% 0% 0% 0%)", opacity: 0 },
          { 
            clipPath: "inset(0% 0% 0% 0%)", 
            opacity: 1, 
            duration: 1.15, 
            ease: "power2.out", 
            delay: 0.25 
          }
        );
      } else {
        // Desktop: subtle portrait introduction with edge mask and scale settle
        gsap.fromTo(portraitImg,
          { clipPath: "inset(8% 0% 0% 0%)", scale: 1.04, opacity: 0 },
          { 
            clipPath: "inset(0% 0% 0% 0%)", 
            scale: 1, 
            opacity: 1, 
            duration: 1.15, 
            ease: "power2.out", 
            delay: 0.28 
          }
        );
      }
    }

    // Desktop UI Corner Labels & Statement
    if (isDesktop) {
      const topLeftItems = document.querySelectorAll(".hero-ui-top-left > *");
      if (topLeftItems.length) {
        gsap.fromTo(topLeftItems,
          { clipPath: "inset(100% 0% 0% 0%)", y: 16, opacity: 0 },
          { clipPath: "inset(0% 0% 0% 0%)", y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: easeEditorial, delay: 0.35 }
        );
      }

      const statementElements = document.querySelectorAll(".hero-statement, .hero-cta-wrapper");
      if (statementElements.length) {
        gsap.fromTo(statementElements,
          { clipPath: "inset(100% 0% 0% 0%)", y: 22, opacity: 0 },
          { clipPath: "inset(0% 0% 0% 0%)", y: 0, opacity: 1, duration: 0.85, stagger: 0.1, ease: easeEditorial, delay: 0.45 }
        );
      }
    }

    // Mobile-only subtle hero retreat; desktop & laptop hero scroll naturally without any fade-out or upward shift
    const heroSection = document.getElementById("hero");
    if (heroSection && isMobile) {
      gsap.to(["#parallax-typo", "#parallax-image"], {
        yPercent: -6,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: {
          id: "reveal-hero-retreat",
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: 1
        }
      });
    } else if (heroSection && isDesktop) {
      // Ensure desktop & laptop hero elements remain 100% visible and unshifted in natural document flow
      gsap.set(["#parallax-typo", "#parallax-image"], {
        clearProps: "yPercent,y,opacity"
      });
    }

    // =========================================================================
    // 2. WHO AM I (#about)
    // =========================================================================
    const aboutSection = document.getElementById("about");
    const aboutHeading = document.querySelector(".about-giant-typo");
    const aboutBio = document.querySelector(".about-bio p");
    const lanyardZone = document.getElementById("lanyard-zone");
    const aboutMonogram = document.querySelector(".about-bg-monogram");

    if (aboutSection) {
      const aboutTl = gsap.timeline({
        scrollTrigger: {
          id: "reveal-about",
          trigger: aboutSection,
          start: isMobile ? "top 82%" : "top 76%",
          toggleActions: "play none none reverse"
        }
      });

      if (aboutHeading) {
        aboutTl.fromTo(aboutHeading,
          { clipPath: "inset(100% 0% 0% 0%)", y: yDist, opacity: 0 },
          { clipPath: "inset(0% 0% 0% 0%)", y: 0, opacity: 1, duration: 0.85, ease: easeEditorial }
        );
      }

      if (aboutBio) {
        aboutTl.fromTo(aboutBio,
          { clipPath: "inset(100% 0% 0% 0%)", y: yDistSmall, opacity: 0 },
          { clipPath: "inset(0% 0% 0% 0%)", y: 0, opacity: 1, duration: 0.78, ease: easeEditorial },
          "<0.14"
        );
      }

      if (lanyardZone) {
        aboutTl.fromTo(lanyardZone,
          { opacity: 0, y: isMobile ? -14 : -22 },
          { opacity: 1, y: 0, duration: 0.95, ease: "power2.out" },
          "<0.1"
        );
      }

      if (aboutMonogram) {
        aboutTl.fromTo(aboutMonogram,
          { y: isMobile ? 30 : 60, opacity: 0 },
          { y: 0, opacity: 0.03, duration: 1.1, ease: "power2.out" },
          "<"
        );
      }
    }

    // =========================================================================
    // 3. HOW I GOT HERE (#journey)
    // =========================================================================
    const journeyTitle = document.querySelector(".journey-main-title");
    const journeyTitleContainer = document.querySelector(".journey-title-container") || journeyTitle;

    if (journeyTitle && journeyTitleContainer) {
      gsap.fromTo(journeyTitle,
        { clipPath: "inset(100% 0% 0% 0%)", y: yDist, opacity: 0 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: easeEditorial,
          scrollTrigger: {
            id: "reveal-journey-title",
            trigger: journeyTitleContainer,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Progressive milestone reveals on mobile
    if (isMobile) {
      const journeyItems = document.querySelectorAll(".journey-item");
      journeyItems.forEach((item, idx) => {
        const dot = item.querySelector(".journey-dot");
        const content = item.querySelector(".journey-content");
        const yearTitle = item.querySelector(".journey-year-title");
        const subtitle = item.querySelector(".journey-subtitle");
        const desc = item.querySelector(".journey-desc");

        const itemTl = gsap.timeline({
          scrollTrigger: {
            id: `reveal-journey-item-${idx}`,
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        });

        if (dot) {
          itemTl.fromTo(dot,
            { scale: 0, opacity: 0.3 },
            { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.5)" }
          );
        }

        if (content) {
          const textGroup = [yearTitle, subtitle, desc].filter(Boolean);
          itemTl.fromTo(textGroup,
            { clipPath: "inset(100% 0% 0% 0%)", y: 16, opacity: 0 },
            { clipPath: "inset(0% 0% 0% 0%)", y: 0, opacity: 1, duration: 0.65, stagger: 0.06, ease: easeEditorial },
            "<0.08"
          );
        }
      });
    }

    // =========================================================================
    // 4. WHAT I KNOW (#skills)
    // =========================================================================
    const skillsHeader = document.querySelector(".skills-index-header");
    const skillsTitle = document.querySelector(".skills-title");
    const skillsSubtitle = document.querySelector(".skills-subtitle");

    if (skillsHeader) {
      const headerTl = gsap.timeline({
        scrollTrigger: {
          id: "reveal-skills-header",
          trigger: skillsHeader,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });

      if (skillsTitle) {
        headerTl.fromTo(skillsTitle,
          { clipPath: "inset(100% 0% 0% 0%)", y: yDist, opacity: 0 },
          { clipPath: "inset(0% 0% 0% 0%)", y: 0, opacity: 1, duration: 0.85, ease: easeEditorial }
        );
      }

      if (skillsSubtitle) {
        headerTl.fromTo(skillsSubtitle,
          { clipPath: "inset(100% 0% 0% 0%)", y: yDistSmall, opacity: 0 },
          { clipPath: "inset(0% 0% 0% 0%)", y: 0, opacity: 1, duration: 0.75, ease: easeEditorial },
          "<0.1"
        );
      }
    }

    // Technology groups unmasking in sequence
    const skillsRows = document.querySelectorAll(".skills-row");
    skillsRows.forEach((row, i) => {
      const rowMeta = row.querySelectorAll(".row-num, .row-label");
      const techWords = row.querySelectorAll(".tech-word");

      const rowTl = gsap.timeline({
        scrollTrigger: {
          id: `reveal-skills-row-${i}`,
          trigger: row,
          start: "top 86%",
          toggleActions: "play none none reverse"
        }
      });

      if (rowMeta.length) {
        rowTl.fromTo(rowMeta,
          { clipPath: "inset(100% 0% 0% 0%)", y: yDistSmall, opacity: 0 },
          { clipPath: "inset(0% 0% 0% 0%)", y: 0, opacity: 1, duration: 0.65, ease: easeEditorial }
        );
      }

      if (techWords.length) {
        rowTl.fromTo(techWords,
          { clipPath: "inset(100% 0% 0% 0%)", y: isMobile ? 12 : 20, opacity: 0 },
          { clipPath: "inset(0% 0% 0% 0%)", y: 0, opacity: 1, duration: 0.65, stagger: 0.035, ease: easeEditorial },
          "<0.08"
        );
      }
    });

    // =========================================================================
    // 5. WHAT I BUILT (#works / #projects)
    // =========================================================================
    if (isDesktop) {
      // Desktop persistent title reveal
      const worksMainTitle = document.getElementById("works-main-title");
      const worksEditorial = document.getElementById("works");
      if (worksMainTitle && worksEditorial) {
        gsap.fromTo(worksMainTitle,
          { clipPath: "inset(100% 0% 0% 0%)", y: yDist, opacity: 0 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: easeEditorial,
            scrollTrigger: {
              id: "reveal-works-desktop-title",
              trigger: worksEditorial,
              start: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    } else {
      // Mobile dedicated showcase reveal
      const mobileIntro = document.querySelector(".works-mobile-intro");
      if (mobileIntro) {
        const subtitle = mobileIntro.querySelector(".works-mobile-subtitle");
        const title = mobileIntro.querySelector(".works-mobile-title");
        const tagline = mobileIntro.querySelector(".works-mobile-tagline");

        const introTl = gsap.timeline({
          scrollTrigger: {
            id: "reveal-works-mobile-intro",
            trigger: mobileIntro,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        });

        if (subtitle) {
          introTl.fromTo(subtitle,
            { clipPath: "inset(100% 0% 0% 0%)", y: 12, opacity: 0 },
            { clipPath: "inset(0% 0% 0% 0%)", y: 0, opacity: 1, duration: 0.6, ease: easeEditorial }
          );
        }

        if (title) {
          introTl.fromTo(title,
            { clipPath: "inset(100% 0% 0% 0%)", y: 22, opacity: 0 },
            { clipPath: "inset(0% 0% 0% 0%)", y: 0, opacity: 1, duration: 0.8, ease: easeEditorial },
            "<0.08"
          );
        }

        if (tagline) {
          introTl.fromTo(tagline,
            { clipPath: "inset(100% 0% 0% 0%)", y: 12, opacity: 0 },
            { clipPath: "inset(0% 0% 0% 0%)", y: 0, opacity: 1, duration: 0.6, ease: easeEditorial },
            "<0.1"
          );
        }
      }

      // Individual project card progressive reveal
      const mobileCards = document.querySelectorAll(".works-mobile-card");
      mobileCards.forEach((card, idx) => {
        const meta = card.querySelector(".works-mobile-meta");
        const name = card.querySelector(".works-mobile-name");
        const media = card.querySelector(".works-mobile-media");
        const img = card.querySelector(".works-mobile-media-inner img");
        const badge = card.querySelector(".works-mobile-link-badge");

        const cardTl = gsap.timeline({
          scrollTrigger: {
            id: `reveal-works-card-${idx}`,
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        });

        if (meta) {
          cardTl.fromTo(meta,
            { clipPath: "inset(100% 0% 0% 0%)", y: 12, opacity: 0 },
            { clipPath: "inset(0% 0% 0% 0%)", y: 0, opacity: 1, duration: 0.6, ease: easeEditorial }
          );
        }

        if (name) {
          cardTl.fromTo(name,
            { clipPath: "inset(100% 0% 0% 0%)", y: 18, opacity: 0 },
            { clipPath: "inset(0% 0% 0% 0%)", y: 0, opacity: 1, duration: 0.72, ease: easeEditorial },
            "<0.06"
          );
        }

        if (media) {
          // Edge clipping unmask with subtle scale settle
          cardTl.fromTo(media,
            { clipPath: "inset(12% 0% 0% 0%)", opacity: 0.35 },
            { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, duration: 0.85, ease: easeEditorial },
            "<0.08"
          );
        }

        if (img) {
          cardTl.fromTo(img,
            { scale: 1.08 },
            { scale: 1.0, duration: 0.95, ease: "power2.out" },
            "<"
          );
        }

        if (badge) {
          cardTl.fromTo(badge,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.5, ease: easeEditorial },
            "<0.18"
          );
        }
      });
    }

    // =========================================================================
    // 6. CONTACT SECTION (#contact)
    // =========================================================================
    const contactWrapper = document.getElementById("motion-footer-wrapper");
    const contactContent = document.getElementById("contact-content");
    const contactHeading = document.querySelector(".contact-heading");
    const contactSubheading = document.querySelector(".contact-subheading");
    const contactCopy = document.querySelector(".contact-copy");
    const actionBtns = document.querySelectorAll(".action-buttons .action-btn");
    const formCard = document.querySelector(".editorial-form-card");
    const formGroups = document.querySelectorAll(".editorial-form .form-group");
    const submitBtn = document.querySelector(".editorial-submit-btn");
    const ticker = document.querySelector(".editorial-ticker-wrapper");

    // Continuous ticker subtle reveal
    if (ticker && contactWrapper) {
      gsap.fromTo(ticker,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            id: "reveal-contact-ticker",
            trigger: contactWrapper,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Deliberate sequential reveal of contact heading, copy, links, and form
    if (contactContent) {
      const contactTl = gsap.timeline({
        scrollTrigger: {
          id: "reveal-contact-content",
          trigger: contactContent,
          start: isMobile ? "top 82%" : "top 76%",
          toggleActions: "play none none reverse"
        }
      });

      if (contactHeading) {
        contactTl.fromTo(contactHeading,
          { clipPath: "inset(100% 0% 0% 0%)", y: yDist, opacity: 0 },
          { clipPath: "inset(0% 0% 0% 0%)", y: 0, opacity: 1, duration: 0.85, ease: easeEditorial }
        );
      }

      if (contactSubheading) {
        contactTl.fromTo(contactSubheading,
          { clipPath: "inset(100% 0% 0% 0%)", y: yDistSmall, opacity: 0 },
          { clipPath: "inset(0% 0% 0% 0%)", y: 0, opacity: 1, duration: 0.75, ease: easeEditorial },
          "<0.12"
        );
      }

      if (contactCopy) {
        contactTl.fromTo(contactCopy,
          { clipPath: "inset(100% 0% 0% 0%)", y: yDistSmall, opacity: 0 },
          { clipPath: "inset(0% 0% 0% 0%)", y: 0, opacity: 1, duration: 0.75, ease: easeEditorial },
          "<0.1"
        );
      }

      if (actionBtns.length) {
        contactTl.fromTo(actionBtns,
          { y: isMobile ? 12 : 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, stagger: 0.08, ease: easeEditorial },
          "<0.12"
        );
      }

      if (formCard) {
        contactTl.fromTo(formCard,
          { clipPath: "inset(8% 0% 0% 0%)", y: isMobile ? 15 : 24, opacity: 0 },
          { clipPath: "inset(0% 0% 0% 0%)", y: 0, opacity: 1, duration: 0.85, ease: easeEditorial },
          "<0.06"
        );
      }

      if (formGroups.length) {
        contactTl.fromTo(formGroups,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.06, ease: easeEditorial },
          "<0.15"
        );
      }

      if (submitBtn) {
        contactTl.fromTo(submitBtn,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, ease: easeEditorial },
          "<0.15"
        );
      }
    }
  });

  // Handle font loading and responsive refreshes
  if (document.fonts) {
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh();
    });
  }
}

// Legacy stubs for safe backward-compatibility
function loadStatCounters() {}
function loadSkillBars() {}
function initTimelineScrollTracker() {}
function initScrollParallax() {}
function triggerAnimationsOnLoad() {
  if (typeof initScrollReveals === 'function') initScrollReveals();
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    initScrollReveals();
  } else {
    window.addEventListener('load', initScrollReveals);
  }
});
