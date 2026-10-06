/**
 * Particle Animation System
 * Creates a cursor-following gooey particle trail to reveal the video underneath.
 * Uses SVG mask with feGaussianBlur and feColorMatrix, animated by GSAP.
 */
class Particle {
    constructor(x, y, size, vx, vy, particles, maskGroup) {
        this.size = size;
        this.x = x;
        this.y = y;
        this.vx = vx || 0;
        this.vy = vy || 0;
        this.friction = 0.92; // Fluid drag
        
        this.el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.el.setAttribute('cx', this.x);
        this.el.setAttribute('cy', this.y);
        this.el.setAttribute('r', this.size);
        this.el.setAttribute('fill', '#fff'); // White mask = 100% visible
        
        maskGroup.appendChild(this.el);

        const tl = gsap.timeline();
        
        // Randomize growth to make it bubble organically
        const growScale = 1.2 + Math.random() * 0.6;
        
        // Grow to full size quickly
        tl.to(this, {
            size: this.size * growScale,
            ease: 'power2.out',
            duration: 0.15 + Math.random() * 0.1
        });
        
        // Randomize how long each blob stays before shrinking. Increased by ~1s to stay in place longer.
        const holdTime = 1.4 + Math.random() * 0.8; 
        const shrinkTime = 0.8 + Math.random() * 0.5;
        
        // Hold the reveal then shrink unevenly
        tl.to(this, {
            size: 0,
            ease: 'power2.inOut',
            duration: shrinkTime
        }, holdTime);
        
        // Kill
        tl.call(() => this.kill(particles));
    }

    kill(particles) {
        const index = particles.indexOf(this);
        if (index > -1) {
            particles.splice(index, 1);
        }
        if (this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
    }

    render() {
        // Update physics
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        this.el.setAttribute('cx', this.x);
        this.el.setAttribute('cy', this.y);
        this.el.setAttribute('r', this.size);
    }
}

class ParticleRevealEngine {
    constructor() {
        this.svg = document.getElementById('particle-svg');
        this.maskGroup = document.getElementById('particle-mask-group');
        this.heroSection = document.getElementById('hero');
        
        if (!this.svg || !this.maskGroup || !this.heroSection) {
            console.error("ParticleRevealEngine: Missing required DOM elements.");
            return;
        }

        // State
        this.particles = [];
        this.mouse = {
            x: -1000,
            y: -1000,
            smoothX: -1000,
            smoothY: -1000,
            lastSmoothX: -1000,
            lastSmoothY: -1000,
            diff: 0
        };
        this.animationId = null;
        this.viewport = { width: window.innerWidth, height: window.innerHeight };

        // Bindings
        this.onMouseMove = this.onMouseMove.bind(this);
        this.resize = this.resize.bind(this);
        this.render = this.render.bind(this);
        
        // Init
        window.addEventListener('resize', this.resize);
        this.heroSection.addEventListener('mousemove', this.onMouseMove);
        
        this.resize();
        this.render();
    }

    resize() {
        const rect = this.heroSection.getBoundingClientRect();
        this.viewport.width = rect.width;
        this.viewport.height = rect.height;
        this.svg.setAttribute('width', this.viewport.width);
        this.svg.setAttribute('height', this.viewport.height);
    }

    onMouseMove(e) {
        const rect = this.heroSection.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        
        if (this.mouse.smoothX === -1000) {
            this.mouse.smoothX = this.mouse.x;
            this.mouse.smoothY = this.mouse.y;
            this.mouse.lastSmoothX = this.mouse.x;
            this.mouse.lastSmoothY = this.mouse.y;
        }
    }

    emitParticle(x, y, size, vx, vy) {
        const speed = Math.hypot(vx, vy);
        
        // Spawn a core cluster of particles to create a lumpy, irregular shape
        // The bigger the base size, the more particles we spawn to form the blob
        const clusterSize = Math.max(3, Math.floor(size / 15)); 
        
        for (let i = 0; i < clusterSize; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * size * 0.4; // Tighter grouping to prevent flickering disconnected blobs
            
            const randX = x + Math.cos(angle) * dist;
            const randY = y + Math.sin(angle) * dist;
            
            // Randomize size of each blob in the cluster heavily
            const randSize = size * (0.3 + Math.random() * 0.8);
            
            const p = new Particle(randX, randY, randSize, vx * 0.1, vy * 0.1, this.particles, this.maskGroup);
            this.particles.push(p);
        }
    }

    render() {
        this.mouse.lastSmoothX = this.mouse.smoothX;
        this.mouse.lastSmoothY = this.mouse.smoothY;

        // Moderate lerp factor for smooth, organic fluid tracking
        this.mouse.smoothX += (this.mouse.x - this.mouse.smoothX) * 0.25;
        this.mouse.smoothY += (this.mouse.y - this.mouse.smoothY) * 0.25;
        
        const dx = this.mouse.smoothX - this.mouse.lastSmoothX;
        const dy = this.mouse.smoothY - this.mouse.lastSmoothY;
        this.mouse.diff = Math.hypot(dx, dy);

        this.frameCount = (this.frameCount || 0) + 1;
        const isMoving = this.mouse.diff > 0.5;

        // Base size reduced as requested
        let baseSize = this.mouse.diff * 0.8; 
        baseSize = Math.max(baseSize, 25); // minimum blob size
        baseSize = Math.min(baseSize, 60); // maximum thickness
        
        if (isMoving) {
            // Interpolate to fill gaps
            const step = 12; // increased step size since blobs are bigger and more irregular
            if (this.mouse.diff > step) {
                const steps = Math.ceil(this.mouse.diff / step);
                for (let i = 1; i <= steps; i++) {
                    const interpX = this.mouse.lastSmoothX + (dx * i) / steps;
                    const interpY = this.mouse.lastSmoothY + (dy * i) / steps;
                    this.emitParticle(interpX, interpY, baseSize, dx, dy);
                }
            } else {
                this.emitParticle(this.mouse.smoothX, this.mouse.smoothY, baseSize, dx, dy);
            }
        } else {
            // Even when stationary, emit slowly to keep a simmering irregular paint puddle
            if (this.frameCount % 4 === 0) {
                // If it's been idle at -1000 initially, don't emit
                if (this.mouse.smoothX !== -1000) {
                    this.emitParticle(this.mouse.smoothX, this.mouse.smoothY, baseSize, 0, 0);
                }
            }
        }

        this.particles.forEach(p => p.render());
        this.animationId = requestAnimationFrame(this.render);
    }

    destroy() {
        window.removeEventListener('resize', this.resize);
        this.heroSection.removeEventListener('mousemove', this.onMouseMove);
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.particles.forEach(p => {
            if (p.el.parentNode) p.el.parentNode.removeChild(p.el);
        });
        this.particles = [];
    }
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
    // Only initialize on non-touch devices
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        // Small delay to ensure GSAP is loaded if loaded defer
        setTimeout(() => {
            if (typeof gsap !== 'undefined') {
                window.particleEngine = new ParticleRevealEngine();
            } else {
                console.error("GSAP not found. Particle animation failed to initialize.");
            }
        }, 100);
    }
});
