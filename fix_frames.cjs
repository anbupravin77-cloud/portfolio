const fs = require('fs');
let js = fs.readFileSync('ContactHandshakeTransition.js', 'utf8');

js = js.replace(/this\.totalFrames = 180;/, "this.totalFrames = 180;\n    this.frameStep = 3;");

js = js.replace(/for \(let i = 1; i <= this\.totalFrames; i\+\+\) {/, "for (let i = 1; i <= this.totalFrames; i += this.frameStep) {");

// In drawFrame, the index is the actual frame number now
// In playFrames, we should increment by frameStep
js = js.replace(/this\.currentFrame\+\+;/, "this.currentFrame += this.frameStep;");
// Bloom triggers need to adjust if they are exact
js = js.replace(/this\.currentFrame === 95/, "this.currentFrame >= 93 && this.currentFrame <= 97");
js = js.replace(/this\.currentFrame === 140/, "this.currentFrame >= 138 && this.currentFrame <= 142");

fs.writeFileSync('ContactHandshakeTransition.js', js, 'utf8');
