const fs = require('fs');
let js = fs.readFileSync('ContactHandshakeTransition.js', 'utf8');

const replacement = `
  async handleFormSubmit() {
    if (this.state !== 'idle') return;
    const formData = this.validateForm();
    if (!formData) return;

    this.state = 'submitting';

    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.classList.add('submitting');
      const btnText = this.submitBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'LOADING ANIMATION...';
    }

    if (this.srAnnouncer) {
      this.srAnnouncer.textContent = 'Your message was sent successfully. Loading animation.';
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

    const waitInterval = setInterval(() => {
      if (this.framesLoaded >= targetLoaded) {
        clearInterval(waitInterval);
        if (this.submitBtn) {
          const btnText = this.submitBtn.querySelector('.btn-text');
          if (btnText) btnText.textContent = 'SENDING...';
        }
        this.startTransition();
      }
    }, 100);
  }
`;

js = js.replace(/async handleFormSubmit\(\) \{[\s\S]*?this\.startTransition\(\);\n  \}/, replacement.trim());

fs.writeFileSync('ContactHandshakeTransition.js', js, 'utf8');
