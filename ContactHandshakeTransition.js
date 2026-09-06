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
    this.frameStep = 3;
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
      for (let i = 1; i <= this.totalFrames; i += this.frameStep) {
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
    
    // Setup blur validation
    const inputs = this.form.querySelectorAll('.trust-input, .trust-textarea, .form-input, .form-textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', (e) => {
        this.validateField(e.target);
      });
      input.addEventListener('input', (e) => {
        const field = e.target.closest('.trust-field, .form-field');
        if (field) {
          field?.classList?.remove('invalid', 'valid');
        }
        this.clearError();
      });
    });

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

  showError(msg, inputElement = null) {
    if (this.errorDisplay) {
      this.errorDisplay.textContent = msg;
      this.errorDisplay?.classList?.add('visible');
    }
    if (inputElement) {
      const field = inputElement.closest('.trust-field, .form-field');
      if (field) {
        field?.classList?.remove('valid');
        field?.classList?.add('invalid');
      }
      inputElement.focus();
    }
  }

  clearError() {
    if (!this.errorDisplay) return;
    this.errorDisplay.textContent = '';
    this.errorDisplay?.classList?.remove('visible');
  }

  validateField(inputElement) {
    const field = inputElement.closest('.trust-field, .form-field');
    if (!field) return true;
    
    // Website is optional
    if (inputElement.id === 'contact-website' && inputElement.value.trim() === '') {
      field?.classList?.remove('invalid', 'valid');
      return true;
    }

    const value = inputElement.value.trim();
    let isValid = true;

    if (inputElement.id === 'contact-name' && !value) {
      isValid = false;
    } else if (inputElement.id === 'contact-email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value || !emailRegex.test(value)) {
        isValid = false;
      }
    } else if (inputElement.id === 'contact-message' && (!value || value.length < 5)) {
      isValid = false;
    } else if (inputElement.id === 'contact-company' && !value) {
       // Optional field, no validation needed if empty
    }

    if (value !== '' || inputElement.required) {
      if (isValid) {
        field?.classList?.remove('invalid');
        field?.classList?.add('valid');
      } else {
        field?.classList?.remove('valid');
        field?.classList?.add('invalid');
      }
    }
    
    return isValid;
  }

  validateForm() {
    const nameInput = this.form.querySelector('#contact-name');
    const emailInput = this.form.querySelector('#contact-email');
    const subjectInput = this.form.querySelector('#contact-subject');
    const msgInput = this.form.querySelector('#contact-message');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const subject = subjectInput ? subjectInput.value.trim() : '';
    const message = msgInput ? msgInput.value.trim() : '';
    
    // Clear all previous
    const allFields = this.form.querySelectorAll('.trust-field, .form-field');
    allFields.forEach(f => f?.classList?.remove('invalid', 'valid'));

    if (!name) {
      this.showError('Please enter your name.', nameInput);
      return false;
    } else if (nameInput) {
      nameInput.closest('.trust-field, .form-field')?.classList?.add('valid');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      this.showError('Please enter a valid email address.', emailInput);
      return false;
    } else if (emailInput) {
      emailInput.closest('.trust-field, .form-field')?.classList?.add('valid');
    }

    if (!message || message.length < 5) {
      this.showError('Please enter a message (at least 5 characters).', msgInput);
      return false;
    } else if (msgInput) {
      msgInput.closest('.trust-field, .form-field')?.classList?.add('valid');
    }

    this.clearError();
    return { name, email, subject, message };
  }

  async sendEmailForwarding(formData) {
    try {
      const response = await fetch('https://formsubmit.co/ajax/anbupravin77@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          _subject: formData.subject ? `[Portfolio] ${formData.subject}` : `New Portfolio Inquiry from ${formData.name}`,
          message: formData.message,
          _template: 'table',
          _captcha: 'false'
        })
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.warn('Background email forwarding note:', err);
      return null;
    }
  }

  async handleFormSubmit() {
    if (this.state !== 'idle') return;
    const formData = this.validateForm();
    if (!formData) return;

    this.state = 'submitting';

    // Dispatch free email forwarding directly to anbupravin77@gmail.com
    this.sendEmailForwarding(formData);

    // Populate direct mailto link for seamless direct email client fallback
    const mailtoBtn = document.getElementById('thankyou-mailto-btn');
    if (mailtoBtn) {
      const sub = encodeURIComponent(formData.subject || `Inquiry from ${formData.name}`);
      const body = encodeURIComponent(`Hi Anbu,\n\n${formData.message}\n\nFrom: ${formData.name} (${formData.email})`);
      mailtoBtn.href = `mailto:anbupravin77@gmail.com?subject=${sub}&body=${body}`;
    }

    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn?.classList?.add('submitting');
      const btnText = this.submitBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'FORWARDING MESSAGE...';
    }

    if (this.srAnnouncer) {
      this.srAnnouncer.textContent = 'Your message was sent successfully to anbupravin77@gmail.com.';
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.skipToComplete();
      return;
    }

    // Wait until all frames (180 / 3 = 60) are loaded
    const targetLoaded = Math.floor(this.totalFrames / this.frameStep);
    
    // Call preloadFrames in case it hasn't been called
    this.preloadFrames();

    let waitTime = 0;
    const waitInterval = setInterval(() => {
      waitTime += 100;
      
      // If loaded, or if it takes longer than 8 seconds (fallback to skip)
      if (this.framesLoaded >= targetLoaded || waitTime > 8000) {
        clearInterval(waitInterval);
        
        if (this.submitBtn) {
          const btnText = this.submitBtn.querySelector('.btn-text');
          if (btnText) btnText.textContent = 'SENDING...';
        }
        
        if (this.framesLoaded >= targetLoaded) {
          this.startTransition();
        } else {
          // Fallback if network is too slow
          this.skipToComplete();
        }
      }
    }, 100);
  }

  startTransition() {
    this.state = 'animating';

    // 1. Dissolve form layer
    if (this.formLayer) {
      this.formLayer?.classList?.add('dissolving');
    }

    // 2. Wait a moment, then prepare canvas and crossfade
    setTimeout(() => {
      // Ensure canvas is sized correctly and first frame is drawn before crossfade
      this.drawFrame(1);
      
      if (this.staticHands) this.staticHands?.classList?.add('hidden');
      if (this.canvas) this.canvas?.classList?.add('visible');

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
        this.currentFrame += this.frameStep;
        lastTime = timestamp;

        if (this.currentFrame <= this.totalFrames) {
          this.drawFrame(this.currentFrame);
          
          // Trigger bloom near contact (frame 95)
          if (this.currentFrame >= 93 && this.currentFrame <= 97 && this.bloom) {
            this.bloom?.classList?.add('active');
          }
          // Remove bloom later (frame 140)
          if (this.currentFrame >= 138 && this.currentFrame <= 142 && this.bloom) {
            this.bloom?.classList?.remove('active');
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
        this.thankYouLayer?.classList?.add('revealed');
      }
    }, 300);
  }

  skipToComplete() {
    this.state = 'complete';
    this.currentFrame = this.totalFrames;
    this.drawFrame(this.currentFrame);
    
    if (this.staticHands) this.staticHands?.classList?.add('hidden');
    if (this.canvas) this.canvas?.classList?.add('visible');
    
    if (this.formLayer) this.formLayer?.classList?.add('dissolving');
    if (this.thankYouLayer) this.thankYouLayer?.classList?.add('revealed');
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
      this.submitBtn?.classList?.remove('submitting');
      const btnText = this.submitBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'SEND MESSAGE';
    }

    // Reset Layers
    if (this.bloom) this.bloom?.classList?.remove('active');
    if (this.thankYouLayer) this.thankYouLayer?.classList?.remove('revealed');
    if (this.canvas) this.canvas?.classList?.remove('visible');
    if (this.staticHands) this.staticHands?.classList?.remove('hidden');
    
    if (this.formLayer) this.formLayer?.classList?.remove('dissolving');
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}
