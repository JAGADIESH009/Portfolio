/**
 * KINETIC TECHNOLOGY INDEX
 * Handles the subtle row-based interaction for Page 3.
 */
document.addEventListener('DOMContentLoaded', () => {
    const rows = document.querySelectorAll('.skills-row');
    
    // Config
    const maxDisplacement = 15; // Max pixels to shift
    const pullRadius = 300;     // Interaction radius
    const springFactor = 0.1;   // Return speed
    const dampFactor = 0.8;     // Momentum dampening
  
    rows.forEach(row => {
      const words = Array.from(row.querySelectorAll('.tech-word[data-magnetic]'));
      
      // Store state for each word
      const wordStates = words.map(word => ({
        el: word,
        x: 0, 
        y: 0,
        vx: 0,
        vy: 0,
        targetX: 0,
        targetY: 0,
        targetScale: 1,
        scale: 1,
        bounds: null
      }));
  
      let isHovered = false;
      let mouseX = 0;
      let mouseY = 0;
      let animationFrame;
  
      // Update bounds on resize or enter
      const updateBounds = () => {
        wordStates.forEach(state => {
          state.bounds = state.el.getBoundingClientRect();
        });
      };
  
      row.addEventListener('mouseenter', () => {
        // Disable on touch devices and narrow screens to keep mobile typography completely stable
        if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024) return;
        
        isHovered = true;
        updateBounds();
        startAnimation();
      });
  
      row.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });
  
      row.addEventListener('mouseleave', () => {
        isHovered = false;
        // Reset targets
        wordStates.forEach(state => {
          state.targetX = 0;
          state.targetY = 0;
          state.targetScale = 1;
        });
      });
  
      function startAnimation() {
        if (!animationFrame) {
          loop();
        }
      }
  
      function loop() {
        let isAnimating = false;
        
        // Handle row accent stretch
        if (isHovered) {
          // Stretch based on how far right the cursor is, keeping it subtle (max 40px extra)
          const stretchTarget = (mouseX / window.innerWidth) * 40;
          let currentStretch = parseFloat(row.style.getPropertyValue('--stretch-amount')) || 0;
          currentStretch += (stretchTarget - currentStretch) * 0.1; // Smooth interpolation
          row.style.setProperty('--stretch-amount', \`\${currentStretch}px\`);
          isAnimating = true;
        } else {
          // Smoothly return stretch to 0
          let currentStretch = parseFloat(row.style.getPropertyValue('--stretch-amount')) || 0;
          if (currentStretch > 0.1) {
            currentStretch += (0 - currentStretch) * 0.1;
            row.style.setProperty('--stretch-amount', \`\${currentStretch}px\`);
            isAnimating = true;
          }
        }
  
        wordStates.forEach(state => {
          if (isHovered && state.bounds) {
            // Calculate distance to mouse
            const centerX = state.bounds.left + state.bounds.width / 2;
            const centerY = state.bounds.top + state.bounds.height / 2;
            
            const dx = mouseX - centerX;
            const dy = mouseY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < pullRadius) {
              const pullStrength = Math.pow(1 - (distance / pullRadius), 2);
              
              // Shift slightly away from cursor for a "magnetic push" or towards it
              // Let's make them shift slightly *away* to give breathing room
              state.targetX = -(dx / distance) * pullStrength * maxDisplacement;
              state.targetY = -(dy / distance) * pullStrength * (maxDisplacement * 0.5);
              
              // If we're really close (hovering this specific word)
              if (distance < state.bounds.width / 2) {
                state.targetScale = 1.05; // slight scale up
              } else {
                state.targetScale = 1;
              }
            } else {
              state.targetX = 0;
              state.targetY = 0;
              state.targetScale = 1;
            }
          }
  
          // Physics: spring
          const ax = (state.targetX - state.x) * springFactor;
          const ay = (state.targetY - state.y) * springFactor;
          
          state.vx = (state.vx + ax) * dampFactor;
          state.vy = (state.vy + ay) * dampFactor;
          
          state.x += state.vx;
          state.y += state.vy;
          
          // Scale smooth interpolation
          state.scale += (state.targetScale - state.scale) * 0.15;
  
          // Check if settling
          const settling = Math.abs(state.vx) < 0.01 && Math.abs(state.vy) < 0.01 && 
                           Math.abs(state.targetX - state.x) < 0.01 && 
                           Math.abs(state.targetScale - state.scale) < 0.001;
                           
          if (!settling) isAnimating = true;
  
          // Apply
          state.el.style.transform = \`translate(\${state.x}px, \${state.y}px) scale(\${state.scale})\`;
        });
  
        if (isAnimating || isHovered) {
          animationFrame = requestAnimationFrame(loop);
        } else {
          animationFrame = null;
        }
      }
      
      // Handle resize recalculations
      window.addEventListener('resize', () => {
        if (isHovered) updateBounds();
      });
    });
  });
