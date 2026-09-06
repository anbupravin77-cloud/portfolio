const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Insert Custom Cursor
if (!html.includes('cursor-dot')) {
  html = html.replace('<body>', '<body>\n  <div id="cursor-dot" class="cursor-dot"></div>\n  <div id="cursor-ring" class="cursor-ring"></div>');
}

// Insert Audio Toggle in Header
const headerRight = `
      <div class="header-right-controls">
        <button id="audio-toggle" class="audio-toggle" aria-label="Toggle ambient sound">
          <div class="audio-bars">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
          </div>
          <span id="audio-label" class="audio-text scramble-text">SOUND OFF</span>
        </button>
        <a href="#contact" class="header-cta" id="header-cta">Let's Talk</a>
      </div>
`;
html = html.replace('<a href="#contact" class="header-cta" id="header-cta">Let\'s Talk</a>', headerRight);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Updated HTML");
