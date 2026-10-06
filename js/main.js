

// Document startup initialization
document.addEventListener('DOMContentLoaded', () => {
  // Footer year binder
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Spotlight coordinates updating listener
  const glassCards = document.querySelectorAll('.glass-card');
  glassCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // 3D Parallax tilt selectors coordinate adjustments
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tiltX = -(y - centerY) / (rect.height / 18);
      const tiltY = (x - centerX) / (rect.width / 18);
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.015, 1.015, 1.015)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });



  // Component bindings
  if (typeof initCursor === 'function') initCursor();
  if (typeof initNavbar === 'function') initNavbar();
  if (typeof initFilters === 'function') initFilters();
  if (typeof initProjects === 'function') initProjects();
  if (typeof initHeroVideoGlobalTransform === 'function') initHeroVideoGlobalTransform();
  if (typeof initMagneticButtons === 'function') initMagneticButtons();
  if (typeof initRippleEffects === 'function') initRippleEffects();
  if (typeof initTimelineScrollTracker === 'function') initTimelineScrollTracker();
  if (typeof initScrollReveals === 'function') initScrollReveals();
});

function initHeroVideoGlobalTransform() {
  const heroVideo = document.getElementById('hero-video-element');
  const portfolioText = document.getElementById('portfolio-text');
  const heroSection = document.getElementById('hero');

  if (!heroVideo || !portfolioText || !heroSection) return;

  // The video element must have a fixed coordinate space of 1920x1080 to map predictably.
  heroVideo.style.width = '1920px';
  heroVideo.style.height = '1080px';
  heroVideo.style.position = 'absolute';
  heroVideo.style.transformOrigin = 'top left';

  // Inside the 1920x1080 video, JAGADIESH bounds:
  // J starts at X=15. H ends at X=1870.
  // The cap-height center is around Y=535.
  const sourceCenterX = 942.5; // (15 + 1870) / 2
  const sourceCenterY = 535;
  const sourceWidth = 1855; // 1870 - 15

  function updateGlobalTransform() {
    const spans = portfolioText.querySelectorAll('span');
    if (spans.length !== 9) return;

    const heroRect = heroSection.getBoundingClientRect();

    // Measure the exact bounding box of the physical HTML "PORTFOLIO" word
    const firstRect = spans[0].getBoundingClientRect();
    const lastRect = spans[8].getBoundingClientRect();

    const targetLeft = firstRect.left - heroRect.left;
    const targetRight = lastRect.right - heroRect.left;
    const targetTop = firstRect.top - heroRect.top;
    const targetBottom = firstRect.bottom - heroRect.top;

    const targetWidth = targetRight - targetLeft;
    const targetHeight = targetBottom - targetTop;
    const targetCenterX = targetLeft + (targetWidth / 2);
    const targetCenterY = targetTop + (targetHeight / 2);

    // Calculate independent scale factors to force the exact bounding box
    const scaleX = targetWidth / sourceWidth;
    const scaleY = targetHeight / 410; // sourceCapHeight

    // Calculate translation required to perfectly align the scaled centers
    const translateX = targetCenterX - (sourceCenterX * scaleX);
    const translateY = targetCenterY - (sourceCenterY * scaleY);

    heroVideo.style.transform = `matrix(${scaleX}, 0, 0, ${scaleY}, ${translateX}, ${translateY})`;
    
    // Export transform for fluid.js WebGL shader mapping
    window.__heroVideoTransform = { scaleX, scaleY, translateX, translateY };
    
    // Optional debug border on the video to see its bounds visually
    if (window.__debugAlignment) {
      heroVideo.style.border = '2px solid red';
      heroVideo.style.opacity = '0.5';
    }
  }

  document.fonts.ready.then(() => {
    updateGlobalTransform();
    window.addEventListener('resize', updateGlobalTransform);
  });
}

/**
 * ==========================================
 * VIDEO ALIGNMENT ENGINE (SLICE & WARP)
 * ==========================================
 * Slices the raw JAGADIESH video into 9 segments and warps them horizontally
 * so they perfectly align with the PORTFOLIO DOM characters.
 */
class VideoWarpEngine {
    constructor() {
        this.video = document.getElementById('hero-video-element');
        this.canvas = document.getElementById('alignment-canvas');
        if (!this.video || !this.canvas) return;

        this.ctx = this.canvas.getContext('2d', { alpha: false }); // Opaque for performance
        this.spans = document.querySelectorAll('#portfolio-text span');
        
        // Normalized centers of "JAGADIESH" in the 1920x1080 video (0.0 to 1.0)
        this.videoCenters = [
            0.110, // J
            0.218, // A
            0.338, // G
            0.439, // A
            0.543, // D
            0.631, // I
            0.709, // E
            0.817, // S
            0.917  // H
        ];

        this.vidWidth = 1920;
        this.vidHeight = 1080;
        this.videoTextCenterY = 540;
        this.videoTextHeight = 410;

        // Resize handler
        window.addEventListener('resize', () => this.resize());
        this.resize();

        // Start render loop
        this.render = this.render.bind(this);
        requestAnimationFrame(this.render);
    }

    resize() {
        const heroSection = document.getElementById('hero');
        const heroRect = heroSection.getBoundingClientRect();

        this.canvas.width = heroRect.width;
        this.canvas.height = heroRect.height;

        // Calculate DOM target centers horizontally relative to hero container
        this.targetCenters = [];
        this.spans.forEach(span => {
            const rect = span.getBoundingClientRect();
            this.targetCenters.push((rect.left - heroRect.left) + rect.width / 2);
        });

        // Get vertical target based on the first letter of PORTFOLIO (for vertical centering)
        if (this.spans.length > 0) {
            const rect = this.spans[0].getBoundingClientRect();
            this.targetCenterY = (rect.top - heroRect.top) + rect.height / 2;
        }

        // Calculate Boundaries (Midpoints between centers)
        this.vidBoundaries = [0]; // Start edge
        this.targetBoundaries = [0];

        for (let i = 0; i < this.videoCenters.length - 1; i++) {
            this.vidBoundaries.push((this.videoCenters[i] + this.videoCenters[i+1]) / 2);
            this.targetBoundaries.push((this.targetCenters[i] + this.targetCenters[i+1]) / 2);
        }

        this.vidBoundaries.push(1.0); // End edge
        this.targetBoundaries.push(this.canvas.width);
    }

    render() {
        if (this.video.readyState >= 2) {
            // Fill with the cream background color so the edges blend seamlessly outside the video bounds
            this.ctx.fillStyle = '#EAE4D9';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // 1. Vertical Scaling (Fit to screen, ignore typography height!)
            const videoTextCenterY = 540;
            const verticalOffset = 20; // Push video down slightly based on user request (adjusted up from 40)

            const scaleX = this.canvas.width / this.vidWidth;
            const scaleY = this.canvas.height / this.vidHeight;
            
            // Calculate minimum scale required to cover the top and bottom edges
            // given that the video will be positioned at destY
            const minScaleTop = (this.targetCenterY + verticalOffset) / videoTextCenterY;
            const minScaleBottom = (this.canvas.height - this.targetCenterY - verticalOffset) / (this.vidHeight - videoTextCenterY);
            
            // Use a scale that covers width, height, and offsets to prevent abrupt cutoffs
            const scale = Math.max(scaleX, scaleY, minScaleTop, minScaleBottom);

            const destHeight = this.vidHeight * scale;
            const destY = this.targetCenterY - (videoTextCenterY * scale) + verticalOffset;

            // 3. Horizontal 9-slice warp (Letter-to-letter alignment)
            if (this.spans.length === 9) {
                for (let i = 0; i < 9; i++) {
                    // Source slice (in raw video pixels)
                    const sx = this.vidBoundaries[i] * this.vidWidth;
                    const sw = (this.vidBoundaries[i+1] - this.vidBoundaries[i]) * this.vidWidth;
                    
                    // Target slice (in canvas pixels)
                    // We use floor for start and ceil + 1 for width to create a 1px overlap 
                    // This perfectly eliminates the sub-pixel "white lines" / gaps between slices
                    const dx = Math.floor(this.targetBoundaries[i]);
                    const dw = Math.ceil(this.targetBoundaries[i+1] - this.targetBoundaries[i]) + 1;
                    
                    // Draw slice, applying the non-uniform horizontal warp to hit exact letter centers,
                    // while maintaining the strict viewport-based vertical scale.
                    this.ctx.drawImage(
                        this.video,
                        sx, 0, sw, this.vidHeight, // Source covers full height
                        dx, destY, dw, destHeight  // Dest covers computed height and Y
                    );
                }
            }
        }
        requestAnimationFrame(this.render);
    }
}

// Initialize Alignment Engine on load
window.addEventListener('load', () => {
    new VideoWarpEngine();
});
