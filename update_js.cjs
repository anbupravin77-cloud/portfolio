const fs = require('fs');
let js = fs.readFileSync('main.js', 'utf8');

const extraJs = `
/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  
  if (!dot || !ring) return;

  // Use GSAP quickTo for highly performant following
  const xToDot = gsap.quickTo(dot, "left", { duration: 0.1, ease: "power3" });
  const yToDot = gsap.quickTo(dot, "top", { duration: 0.1, ease: "power3" });
  
  const xToRing = gsap.quickTo(ring, "left", { duration: 0.4, ease: "power3" });
  const yToRing = gsap.quickTo(ring, "top", { duration: 0.4, ease: "power3" });

  window.addEventListener("mousemove", (e) => {
    xToDot(e.clientX);
    yToDot(e.clientY);
    xToRing(e.clientX);
    yToRing(e.clientY);
  });

  // Hover states
  const interactives = document.querySelectorAll('a, button, .avant-item, .modal-close');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });

  window.addEventListener('mousedown', () => ring.classList.add('clicking'));
  window.addEventListener('mouseup', () => ring.classList.remove('clicking'));
}

/* ============================================================
   GENERATIVE AMBIENT AUDIO ENGINE (Web Audio API)
   ============================================================ */
class AmbientEngine {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.ctx.destination);
    this.isPlaying = false;
    this.oscillators = [];
    this.initialized = false;
  }
  
  init() {
    if (this.initialized) return;
    this.initialized = true;
    
    // Low pass filter to make it sound deep, warm and muffled
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;
    
    // Simple delay network for reverb effect
    const delay = this.ctx.createDelay();
    delay.delayTime.value = 0.6;
    const feedback = this.ctx.createGain();
    feedback.gain.value = 0.5;
    delay.connect(feedback);
    feedback.connect(delay);
    
    const reverbMix = this.ctx.createGain();
    reverbMix.gain.value = 0.4;
    delay.connect(reverbMix);
    
    filter.connect(delay);
    filter.connect(this.masterGain);
    reverbMix.connect(this.masterGain);
    
    // Drone frequencies (E minor add 9) - Cinematic/Luxury feel
    const freqs = [41.20, 82.41, 123.47, 164.81, 233.08];
    
    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : this.ctx.createGain();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = f + (Math.random() - 0.5) * 0.5;

      lfo.type = 'sine';
      lfo.frequency.value = 0.05 + Math.random() * 0.05;
      lfo.connect(lfoGain);
      lfoGain.gain.value = 0.5;
      
      gain.gain.value = 0.5;
      lfoGain.connect(gain.gain);

      if (panner.pan) {
        panner.pan.value = (Math.random() - 0.5) * 0.8;
      }

      osc.connect(gain);
      gain.connect(panner);
      panner.connect(filter);

      osc.start();
      lfo.start();
      
      this.oscillators.push({osc, gain, lfo});
    });
  }
  
  toggle() {
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (!this.initialized) this.init();
    
    if (this.isPlaying) {
      gsap.to(this.masterGain.gain, {value: 0, duration: 2});
      this.isPlaying = false;
    } else {
      gsap.to(this.masterGain.gain, {value: 1, duration: 3});
      this.isPlaying = true;
    }
    return this.isPlaying;
  }
}

function initAudioController() {
  const toggleBtn = document.getElementById('audio-toggle');
  const toggleLabel = document.getElementById('audio-label');
  if (!toggleBtn) return;
  
  const engine = new AmbientEngine();
  const scrambler = new TextScramble(toggleLabel);
  
  toggleBtn.addEventListener('click', () => {
    const isPlaying = engine.toggle();
    if (isPlaying) {
      toggleBtn.classList.add('playing');
      scrambler.setText('SOUND ON');
    } else {
      toggleBtn.classList.remove('playing');
      scrambler.setText('SOUND OFF');
    }
  });
}
`;

js = js.replace('async function init() {', extraJs + '\nasync function init() {');

// Inject the initialization calls
const initCalls = `
  initCustomCursor();
  initAudioController();
`;
js = js.replace('  initProjectModal();', '  initProjectModal();\n' + initCalls);

// Change FloatingPrimitives color to match the dark theme
js = js.replace('color: 0x4a4a4a', 'color: 0xffffff');

fs.writeFileSync('main.js', js, 'utf8');
console.log("Updated main.js");
