
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.innerText || '';
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => this.resolve = resolve);
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="scramble-char" style="opacity:0.5;">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

export class PremiumEducation {
  constructor() {
    this.section = document.querySelector('.premium-edu-section');
    if (!this.section) return;
    this.initTimeline();
  }

  initTimeline() {
    // 0. Scramble effect for main "Academic Chronicle" title
    const academicTitle = document.getElementById('academic-chronicle-title') || document.querySelector('.edu-super-title');
    if (academicTitle) {
      const lineEls = academicTitle.querySelectorAll('.edu-title-scramble');
      const titleScramblers = Array.from(lineEls).map(el => ({
        el,
        scrambler: new TextScramble(el),
        targetText: el.getAttribute('data-text') || el.innerText.trim()
      }));

      let isScrambling = false;
      const triggerAcademicScramble = () => {
        if (isScrambling) return;
        isScrambling = true;
        titleScramblers.forEach((item, idx) => {
          setTimeout(() => {
            item.scrambler.setText(item.targetText);
          }, idx * 140);
        });
        setTimeout(() => {
          isScrambling = false;
        }, 1200);
      };

      // Trigger scramble on scroll when entering Education section
      ScrollTrigger.create({
        trigger: academicTitle,
        start: 'top 85%',
        onEnter: () => triggerAcademicScramble(),
      });

      // Also trigger scramble on title hover
      academicTitle.addEventListener('mouseenter', () => {
        triggerAcademicScramble();
      });
    }

    // 1. Draw the SVG line based on scroll
    const svgLine = document.querySelector('.edu-svg-line');
    
    if (svgLine) {
      // Get the path length
      const pathLength = 1000; // Hardcoded fallback for scaling SVG
      
      // Ensure SVG is correctly sized and we can get length
      try {
          const actualLength = svgLine.getTotalLength();
          if(actualLength > 0) {
              svgLine.style.strokeDasharray = actualLength;
              svgLine.style.strokeDashoffset = actualLength;
              
              gsap.to(svgLine, {
                strokeDashoffset: 0,
                ease: 'none',
                scrollTrigger: {
                  trigger: '.premium-edu-section',
                  start: 'top 50%',
                  end: 'bottom 80%',
                  scrub: true,
                }
              });
          }
      } catch(e) {}
    }

    // 2. Refined Slide-in and Reveal for each item
    const items = document.querySelectorAll('.premium-edu-item');
    
    items.forEach((item, index) => {
      // Refined slide-in-from-bottom effect (timed, not scrubbed)
      gsap.fromTo(item, 
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Scramble text element using the global scramble-text utility class
      const scrambleEl = item.querySelector('.scramble-text');
      let scrambler = null;
      let targetText = '';
      if (scrambleEl) {
        scrambler = new TextScramble(scrambleEl);
        targetText = scrambleEl.getAttribute('data-text') || scrambleEl.innerText.trim();
        scrambleEl.innerHTML = ''; // Start empty for reveal
      }

      // Highlight the node and trigger scramble when scrolling past center
      ScrollTrigger.create({
        trigger: item,
        start: 'top 70%',
        end: 'bottom 30%',
        onEnter: () => {
          item?.classList?.add('is-active');
          if (scrambler) scrambler.setText(targetText);
        },
        onLeaveBack: () => {
          item?.classList?.remove('is-active');
          if (scrambler) scrambler.setText('');
        },
      });
    });
  }
}
