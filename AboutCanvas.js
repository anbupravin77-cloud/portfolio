/**
 * AboutCanvas.js
 * Interactive fluid particle & spline field for the About Bento Grid.
 * Demonstrates creative coding with real-time physics, spring dynamics, and mouse attraction.
 */

export class AboutCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    this.nodes = [];
    this.totalNodes = 48;
    this.mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, isHovered: false };
    this.animationFrameId = null;
    this.isVisible = false;
    this.pulseWave = 0;

    this.initDimensions();
    this.initNodes();
    this.bindEvents();
    this.initObserver();
  }

  initDimensions() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width || 360;
    this.height = rect.height || 260;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  initNodes() {
    this.nodes = [];
    const cols = 8;
    const rows = 6;
    const spacingX = this.width / (cols + 1);
    const spacingY = this.height / (rows + 1);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const baseX = (i + 1) * spacingX + (Math.random() - 0.5) * 8;
        const baseY = (j + 1) * spacingY + (Math.random() - 0.5) * 8;

        this.nodes.push({
          baseX,
          baseY,
          x: baseX,
          y: baseY,
          vx: 0,
          vy: 0,
          radius: Math.random() * 1.5 + 1.8,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.02 + 0.015,
          color: Math.random() > 0.6 ? '#6d9e77' : '#3d4147'
        });
      }
    }
  }

  bindEvents() {
    const onMove = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.targetX = clientX - rect.left;
      this.mouse.targetY = clientY - rect.top;
      this.mouse.isHovered = true;
    };

    this.canvas.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.isHovered = false;
      this.mouse.targetX = -1000;
      this.mouse.targetY = -1000;
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', () => {
      this.mouse.isHovered = false;
      this.mouse.targetX = -1000;
      this.mouse.targetY = -1000;
    });

    this.canvas.addEventListener('click', () => {
      // Trigger a fluid ripple wave
      this.pulseWave = 1.0;
    });

    window.addEventListener('resize', () => {
      this.initDimensions();
      this.initNodes();
    });
  }

  initObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isVisible = entry.isIntersecting;
        if (this.isVisible) {
          if (!this.animationFrameId) this.loop();
        } else {
          if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
          }
        }
      });
    }, { threshold: 0.1 });

    observer.observe(this.canvas);
  }

  loop() {
    if (!this.isVisible) return;

    this.render();
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Smooth mouse lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.12;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.12;

    if (this.pulseWave > 0) {
      this.pulseWave = Math.max(0, this.pulseWave - 0.02);
    }

    const time = Date.now() * 0.001;

    // 1. Update nodes with spring physics & mouse influence
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];

      // Subtle ambient harmonic breathing
      const ambientX = Math.cos(time * node.speed * 40 + node.phase) * 3;
      const ambientY = Math.sin(time * node.speed * 40 + node.phase) * 3;

      const targetX = node.baseX + ambientX;
      const targetY = node.baseY + ambientY;

      // Mouse repulsion / attraction
      const dx = this.mouse.x - node.x;
      const dy = this.mouse.y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 110 && dist > 0) {
        const force = (1 - dist / 110) * 14;
        const angle = Math.atan2(dy, dx);
        node.vx -= Math.cos(angle) * force * 0.25;
        node.vy -= Math.sin(angle) * force * 0.25;
      }

      // Pulse wave ripple
      if (this.pulseWave > 0) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const cdx = node.x - centerX;
        const cdy = node.y - centerY;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        const waveForce = Math.sin(cdist * 0.05 - time * 5) * this.pulseWave * 4;
        node.vx += (cdx / (cdist || 1)) * waveForce * 0.1;
        node.vy += (cdy / (cdist || 1)) * waveForce * 0.1;
      }

      // Spring back to base position
      const springK = 0.04;
      const damping = 0.84;

      node.vx += (targetX - node.x) * springK;
      node.vy += (targetY - node.y) * springK;

      node.vx *= damping;
      node.vy *= damping;

      node.x += node.vx;
      node.y += node.vy;
    }

    // 2. Draw dynamic spring connection filaments
    this.ctx.lineWidth = 0.8;
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i];
        const b = this.nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 55) {
          const alpha = (1 - dist / 55) * 0.28;
          this.ctx.strokeStyle = `rgba(109, 158, 119, ${alpha})`;
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.stroke();
        }
      }
    }

    // 3. Draw mouse attractor field if hovered
    if (this.mouse.isHovered && this.mouse.x > 0 && this.mouse.x < this.width) {
      const grad = this.ctx.createRadialGradient(
        this.mouse.x, this.mouse.y, 0,
        this.mouse.x, this.mouse.y, 90
      );
      grad.addColorStop(0, 'rgba(109, 158, 119, 0.16)');
      grad.addColorStop(1, 'rgba(109, 158, 119, 0)');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(this.mouse.x, this.mouse.y, 90, 0, Math.PI * 2);
      this.ctx.fill();

      // Delicate cursor ring
      this.ctx.strokeStyle = 'rgba(109, 158, 119, 0.4)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(this.mouse.x, this.mouse.y, 14, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // 4. Draw node points
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      this.ctx.fillStyle = node.color;
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}
