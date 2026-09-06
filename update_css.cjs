const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// Update to Deep Dark Luxury Theme
css = css.replace('--bg-primary: #e8e2d8;', '--bg-primary: #0a0a0c;');
css = css.replace('--bg-secondary: #f0ece4;', '--bg-secondary: #121215;');
css = css.replace('--bg-warm: #ddd6ca;', '--bg-warm: #18181b;');
css = css.replace('--text-primary: #1e1e1e;', '--text-primary: #f4f4f5;');
css = css.replace('--text-secondary: #4a4a4a;', '--text-secondary: #a1a1aa;');

// Add Custom Cursor and Audio Toggle CSS
const newStyles = `
/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
@media (pointer: fine) {
  body, a, button, input, textarea, .avant-item, .modal-close {
    cursor: none !important;
  }
}

.cursor-dot {
  position: fixed;
  top: 0;
  left: 0;
  width: 6px;
  height: 6px;
  background-color: var(--text-primary);
  border-radius: 50%;
  pointer-events: none;
  z-index: 99999;
  transform: translate(-50%, -50%);
  transition: opacity 0.3s;
}

.cursor-ring {
  position: fixed;
  top: 0;
  left: 0;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  pointer-events: none;
  z-index: 99998;
  transform: translate(-50%, -50%);
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
              height 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
              background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
              border 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.3s;
}

.cursor-ring.hover {
  width: 70px;
  height: 70px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid transparent;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

.cursor-ring.clicking {
  width: 30px;
  height: 30px;
  border-width: 2px;
}

/* ============================================================
   AUDIO TOGGLE
   ============================================================ */
.header-right-controls {
  display: flex;
  align-items: center;
  gap: var(--s-24);
}

.audio-toggle {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: var(--s-12);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  padding: var(--s-8) var(--s-16);
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: background 0.3s, border-color 0.3s;
}

.audio-toggle:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
}

.audio-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 12px;
}

.audio-bars .bar {
  width: 2px;
  background-color: currentColor;
  height: 2px; /* Default flat when off */
  transition: height 0.2s ease;
}

.audio-toggle.playing .audio-bars .bar:nth-child(1) {
  animation: equalize 1s infinite alternate ease-in-out;
}
.audio-toggle.playing .audio-bars .bar:nth-child(2) {
  animation: equalize 1.2s infinite alternate ease-in-out 0.2s;
}
.audio-toggle.playing .audio-bars .bar:nth-child(3) {
  animation: equalize 0.8s infinite alternate ease-in-out 0.4s;
}

@keyframes equalize {
  0% { height: 2px; }
  100% { height: 12px; }
}
`;

fs.writeFileSync('style.css', css + '\n' + newStyles, 'utf8');
console.log("Updated CSS");
