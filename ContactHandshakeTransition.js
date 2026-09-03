/**
 * ContactHandshakeTransition.js
 * 
 * Manages the single-scene cinematic contact experience.
 * - Handles form validation and state.
 * - Triggers form layer dissolve.
 * - Crossfades from static hands to canvas.
 * - Plays 180-frame canvas animation.
 * - Triggers white bloom near contact moment.
 * - Reveals thank-you overlay at the end.
 */

export class ContactHandshakeTransition {
  constructor(options = {}) {
    this.scene = options.scene || document.getElementById('contact');
    
    // Background layers
    this.staticHands = document.getElementById('hands-static');
    this.canvas = document.getElementById('hands-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.bloom = document.getElementById('contact-bloom');
    
    // Content layers
    this.formLayer = document.getElementById('contact-form-layer');
    this.thankYouLayer = document.getElementById('contact-thankyou-layer');
    
    // Form elements
    this.form = document.getElementById('contact-form');
    this.submitBtn = document.getElementById('contact-submit-btn');
    this.errorDisplay = document.getElementById('contact-error-msg');
    this.srAnnouncer = document.getElementById('contact-sr-announcer');
    this.resetBtn = document.getElementById('contact-reset-btn');

    // Animation state
    this.state = 'idle'; // 'idle' | 'submitting' | 'animating' | 'complete'
    this.frames = [];
    this.totalFrames = 180;
    this.framesLoaded = 0;
    this.currentFrame = 1;
    this.rafId = null;

    this.init();
  }

  init() {
    this.setupForm();
    this.setupReset();
    
    // Handle resizing for correct canvas rendering
    window.addEventListener('resize', () => {
      if (this.state === 'animating' || this.state === 'complete') {
        this.drawFrame(this.currentFrame);
      }
    });
  }

  // Called from main.js when appropriate (e.g. lazy load)
  preloadFrames() {
    if (this.framesLoaded > 0) return Promise.resolve();

    return new Promise((resolve) => {
      const TARGET_PRIORITY = 30; // Prioritize first 30 frames
      let priorityLoaded = 0;
      let totalLoaded = 0;
      
      const loadQueue = [];
      for (let i = 1; i <= this.totalFrames; i++) {
        loadQueue.push(i);
      }
      
      const CONCURRENT = 6;
      let activeLoads = 0;
      
      const loadNext = () => {
        if (loadQueue.length === 0 || activeLoads >= CONCURRENT) return;
        
        const i = loadQueue.shift();
        activeLoads++;
        
        const img = new Image();
        const frameNum = String(i).padStart(3, '0');
        img.src = `/hands/ezgif-frame-${frameNum}.png`;
        img.onload = img.onerror = () => {
          this.frames[i] = img;
          activeLoads--;
          totalLoaded++;
          this.framesLoaded = totalLoaded;
          
          if (priorityLoaded < TARGET_PRIORITY) {
            priorityLoaded++;
            if (priorityLoaded >= Math.min(TARGET_PRIORITY, this.totalFrames)) resolve();
          }
          
          loadNext();
        };
        loadNext();
      };
      
      for (let k = 0; k < CONCURRENT; k++) loadNext();
    });
  }

  setupForm() {
    if (!this.form) return;
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });
  }

  setupReset() {
    if (!this.resetBtn) return;
    this.resetBtn.addEventListener('click', () => {
      this.resetScene();
    });
  }

  showError(msg) {
    if (!this.errorDisplay) return;
    this.errorDisplay.textContent = msg;
    this.errorDisplay.classList.add('visible');
  }

  clearError() {
    if (!this.errorDisplay) return;
    this.errorDisplay.textContent = '';
    this.errorDisplay.classList.remove('visible');
  }

  validateForm() {
    const nameInput = this.form.querySelector('#contact-name');
    const emailInput = this.form.querySelector('#contact-email');
    const msgInput = this.form.querySelector('#contact-message');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const message = msgInput ? msgInput.value.trim() : '';

    if (!name) {
      this.showError('Please enter your name.');
      if (nameInput) nameInput.focus();
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      this.showError('Please enter a valid email address.');
      if (emailInput) emailInput.focus();
      return false;
    }

    if (!message || message.length < 5) {
      this.showError('Please enter a message (at least 5 characters).');
      if (msgInput) msgInput.focus();
      return false;
    }

    this.clearError();
    return { name, email, message };
  }

  async handleFormSubmit() {
    if (this.state !== 'idle') return;

    const formData = this.validateForm();
    if (!formData) return;

    this.state = 'submitting';
    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.classList.add('submitting');
      const btnText = this.submitBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'SENDING...';
    }

    if (this.srAnnouncer) {
      this.srAnnouncer.textContent = 'Your message was sent successfully.';
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.skipToComplete();
      return;
    }

    this.startTransition();
  }

  startTransition() {
    this.state = 'animating';

    // 1. Dissolve form layer
    if (this.formLayer) {
      this.formLayer.classList.add('dissolving');
    }

    // 2. Wait a moment, then prepare canvas and crossfade
    setTimeout(() => {
      // Ensure canvas is sized correctly and first frame is drawn before crossfade
      this.drawFrame(1);
      
      if (this.staticHands) this.staticHands.classList.add('hidden');
      if (this.canvas) this.canvas.classList.add('visible');

      // 3. Start playback shortly after crossfade begins
      setTimeout(() => {
        this.playFrames();
      }, 200);

    }, 300); // Wait for form to dissolve a bit
  }

  drawFrame(index) {
    if (!this.ctx || !this.canvas) return;
    
    let img = this.frames[index];
    
    // Nearest neighbor fallback if frame isn't loaded
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset <= this.totalFrames; offset++) {
        const downIdx = index - offset;
        if (downIdx > 0 && this.frames[downIdx] && this.frames[downIdx].complete && this.frames[downIdx].naturalWidth > 0) {
          img = this.frames[downIdx];
          break;
        }
      }
    }
    
    if (!img || !img.complete || img.naturalWidth === 0) return;

    // Use internal dimensions (1280x720) for rendering.
    // CSS object-fit: cover will handle scaling to the screen correctly.
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'medium';
    
    this.ctx.clearRect(0, 0, cw, ch);
    this.ctx.drawImage(img, 0, 0, cw, ch);
  }

  playFrames() {
    this.currentFrame = 1;
    let lastTime = 0;
    // ~50-60fps
    const frameDuration = 1000 / 55; 

    const loop = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;

      if (elapsed > frameDuration) {
        this.currentFrame++;
        lastTime = timestamp;

        if (this.currentFrame <= this.totalFrames) {
          this.drawFrame(this.currentFrame);
          
          // Trigger bloom near contact (frame 95)
          if (this.currentFrame === 95 && this.bloom) {
            this.bloom.classList.add('active');
          }
          // Remove bloom later (frame 140)
          if (this.currentFrame === 140 && this.bloom) {
            this.bloom.classList.remove('active');
          }
        }
      }

      if (this.currentFrame < this.totalFrames) {
        this.rafId = requestAnimationFrame(loop);
      } else {
        this.finishAnimation();
      }
    };

    this.rafId = requestAnimationFrame(loop);
  }

  finishAnimation() {
    this.state = 'complete';
    
    // Hold final frame, reveal thank you text
    setTimeout(() => {
      if (this.thankYouLayer) {
        this.thankYouLayer.classList.add('revealed');
      }
    }, 300);
  }

  skipToComplete() {
    this.state = 'complete';
    this.currentFrame = this.totalFrames;
    this.drawFrame(this.currentFrame);
    
    if (this.staticHands) this.staticHands.classList.add('hidden');
    if (this.canvas) this.canvas.classList.add('visible');
    
    if (this.formLayer) this.formLayer.classList.add('dissolving');
    if (this.thankYouLayer) this.thankYouLayer.classList.add('revealed');
  }

  resetScene() {
    // Clear RAF just in case
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.state = 'idle';
    this.currentFrame = 1;

    // Reset Form UI
    if (this.form) this.form.reset();
    this.clearError();
    
    if (this.submitBtn) {
      this.submitBtn.disabled = false;
      this.submitBtn.classList.remove('submitting');
      const btnText = this.submitBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'SEND MESSAGE';
    }

    // Reset Layers
    if (this.bloom) this.bloom.classList.remove('active');
    if (this.thankYouLayer) this.thankYouLayer.classList.remove('revealed');
    if (this.canvas) this.canvas.classList.remove('visible');
    if (this.staticHands) this.staticHands.classList.remove('hidden');
    
    if (this.formLayer) this.formLayer.classList.remove('dissolving');
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}
